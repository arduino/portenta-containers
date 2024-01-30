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
	log "github.com/inconshreveable/log15"
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
	Id     string `json:"id"`
	Name   string `json:"name"`
	Status string `json:"status"`
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

	h, err := board.UpdateHostname(b.Hostname)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	r := BoardHostname{
		Hostname: h,
	}

	return c.JSON(http.StatusOK, r)
}
func ReadBoardSystemStatus(c echo.Context) (err error) {
	response := SystemStatus{}
	response.MpuTemp, err = getMpuTemp()
	if err != nil {
		log.Warn("cannot fetch mpu temp", "err", err)
	}
	response.TotalRam, response.UsedRam, err = getRam()
	if err != nil {
		log.Warn("cannot fetch ram memory", "err", err)
	}
	response.UsedStorage, response.PercentStorage, err = getStorage()
	if err != nil {
		log.Warn("cannot fetch storage", "err", err)
	}
	response.LinuxVersion, err = getLinuxVersion()
	if err != nil {
		log.Warn("cannot fetch storage", "err", err)
	}
	response.LinuxVersion, err = getLinuxVersion()
	if err != nil {
		log.Warn("cannot fetch linux version", "err", err)
	}
	response.OotbVersion, err = getOotbVersion()
	if err != nil {
		log.Warn("cannot fetch ootb version", "err", err)
	}

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
			Id:     container.ID,
			Name:   strings.Trim(container.Names[0], "/"),
			Status: container.State,
		})
	}
	return c.JSON(http.StatusOK, response)
}
func getMpuTemp() (res int, err error) {
	out, err := utils.ExecSh(`cat /sys/class/thermal/thermal_zone0/temp`)
	if err != nil {
		return 0, err
	}
	temp := out[0:2]
	res, err = strconv.Atoi(temp)
	if err != nil {
		return 0, err
	}
	return res, nil
}

func getRam() (total int, used int, err error) {
	out, err := utils.ExecSh(`free | grep "Mem" |  awk '{print $2}'	`)
	if err != nil {
		return 0, 0, err
	}
	total, err = strconv.Atoi(strings.Trim(out, "\n"))
	if err != nil {
		return total, 0, err
	}
	out, err = utils.ExecSh(`free | grep "Mem" |  awk '{print $3}'	`)
	if err != nil {
		return total, 0, err
	}
	used, err = strconv.Atoi(strings.Trim(out, "\n"))
	if err != nil {
		return total, 0, err
	}
	return total, used, nil
}

func getStorage() (used int, percent string, err error) {
	out, err := utils.ExecSh(`df /dev/mmcblk2p2 | tail -1 | awk '{print $3}'`)
	if err != nil {
		return 0, "", err
	}
	used, err = strconv.Atoi(strings.Trim(out, "\n"))
	if err != nil {
		return 0, "", err
	}
	out, err = utils.ExecSh(`df /dev/mmcblk2p2 | tail -1 | awk '{print $5}'`)
	if err != nil {
		return used, "", err
	}
	percent = (strings.Trim(out, "\n"))
	return used, percent, nil
}

func getLinuxVersion() (res string, err error) {
	out, err := utils.ExecSh(`uname -r`)
	if err != nil {
		return "", err
	}
	res = (strings.Trim(out, "\n"))
	return res, nil
}

func getOotbVersion() (res string, err error) {
	out, err := utils.ExecSh(`grep "IMAGE_VERSION=" /etc/os-release | cut -d= -f2`)
	if err != nil {
		return "", err
	}
	res = (strings.Trim(out, "\n"))
	return res, nil
}
