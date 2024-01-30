package routes

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"x8-ootb/board"
	"x8-ootb/utils"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/labstack/echo/v4"
)

type boardInfo struct {
	DeviceModelName string `json:"deviceModelName"`
}

type UpdateHostnameBody struct {
	Hostname string `json:"hostname"`
}

type BoardHostname struct {
	Hostname string `json:"hostname"`
}
type SystemStatus struct {
	MpuTemp        int    `json:"mpuTemp"`
	TotalRam       int    `json:"totalRam"`
	UsedRam        int    `json:"usedRam"`
	UsedStorage    int    `json:"usedStorage"`
	PercentStorage string `json:"percentStorage"`
	LinuxVersion   string `json:"linuxVersion"`
	OotbVersion    string `json:"ootbVersion"`
}
type Container struct {
	Name   string `json:"Name"`
	Status string `json:"Status"`
}

func ReadBoard(c echo.Context) error {
	b := boardInfo{
		DeviceModelName: "Arduino Portenta X8",
	}

	return c.JSON(http.StatusOK, b)
}

func ReadHostname(c echo.Context) error {
	h, err := board.ReadHostname()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	b := BoardHostname{
		Hostname: h,
	}

	return c.JSON(http.StatusOK, b)
}

func UpdateHostname(c echo.Context) error {
	b := UpdateHostnameBody{}

	err := c.Bind(&b)
	if err != nil {
		return c.JSON(http.StatusBadRequest, fmt.Errorf("parsing body: %w", err))
	}

	fmt.Println(b.Hostname)

	h, err := board.UpdateHostname(b.Hostname)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	r := BoardHostname{
		Hostname: h,
	}

	return c.JSON(http.StatusOK, r)
}
func ReadBoardSystemStatus(c echo.Context) error {
	response := SystemStatus{}
	//Mpu temperature
	out, err := utils.ExecSh(`cat /sys/class/thermal/thermal_zone0/temp`)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: err.Error()})
	}
	temp := out[0:2]
	response.MpuTemp, err = strconv.Atoi(temp)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: err.Error()})
	}
	//RAM
	out, err = utils.ExecSh(`free | grep "Mem" |  awk '{print $2}'	`)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: err.Error()})
	}
	response.TotalRam, err = strconv.Atoi(strings.Trim(out, "\n"))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: err.Error()})
	}
	out, err = utils.ExecSh(`free | grep "Mem" |  awk '{print $3}'	`)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: err.Error()})
	}
	response.UsedRam, err = strconv.Atoi(strings.Trim(out, "\n"))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: err.Error()})
	}
	//Storage
	out, err = utils.ExecSh(`df /dev/mmcblk2p2 | tail -1 | awk '{print $3}'`)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Errorf("reading used storage: %w %s", err, out).Error()})
	}
	response.UsedStorage, err = strconv.Atoi(strings.Trim(out, "\n"))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Errorf("reading available atoi: %w", err).Error()})
	}
	out, err = utils.ExecSh(`df /dev/mmcblk2p2 | tail -1 | awk '{print $5}'`)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Errorf("reading Percent: %w", err).Error()})
	}
	response.PercentStorage = (strings.Trim(out, "\n"))

	//Linux Version
	out, err = utils.ExecSh(`uname -v`)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Errorf("linux version: %w", err).Error()})
	}
	response.LinuxVersion = (strings.Trim(out, "\n"))

	out, err = utils.ExecSh(`uname -r`)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Errorf("linux version: %w", err).Error()})
	}
	response.LinuxVersion = (strings.Trim(out, "\n"))
	//Ootb version
	out, err = utils.ExecSh(`grep "IMAGE_VERSION=" /etc/os-release | cut -d= -f2`)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Errorf("ootb version: %w", err).Error()})
	}
	response.OotbVersion = (strings.Trim(out, "\n"))

	return c.JSON(http.StatusOK, response)
}
func ReadContainersStatus(c echo.Context) error {
	response := []Container{}
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: err.Error()})
	}
	containers, err := cli.ContainerList(context.Background(), types.ContainerListOptions{All: true})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: err.Error()})
	}
	for _, container := range containers {
		response = append(response, Container{
			Name:   strings.Trim(container.Names[0], "/"),
			Status: container.State,
		})
	}
	return c.JSON(http.StatusOK, response)
}
