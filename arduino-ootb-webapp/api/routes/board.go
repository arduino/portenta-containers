package routes

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"x8-ootb/board"
	"x8-ootb/utils"

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
	UsedRam        int    `json:"usableRam"`
	UsedStorage    int    `json:"usedStorage"`
	PercentStorage string `json:"perecentStorage"`
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
		return fmt.Errorf("reading Mpu temperature: %w %s", err, out)
	}
	temp := out[0:2]
	response.MpuTemp, err = strconv.Atoi(temp)
	if err != nil {
		return fmt.Errorf("atoi Mpu temperature: %w %s", err, out)
	}
	//RAM
	out, err = utils.ExecSh(`free | tail -1 | awk '{print $2}'`)
	if err != nil {
		return fmt.Errorf("total ram: %w %s", err, out)
	}
	response.TotalRam, err = strconv.Atoi(strings.Trim(out, "\n"))
	if err != nil {
		return fmt.Errorf("atoi Mpu temperature: %w %s", err, out)
	}
	out, err = utils.ExecSh(`free | tail -1 | awk '{print $3}'`)
	if err != nil {
		return fmt.Errorf("total ram: %w %s", err, out)
	}
	response.UsedRam, err = strconv.Atoi(strings.Trim(out, "\n"))
	if err != nil {
		return fmt.Errorf("atoi Mpu temperature: %w %s", err, out)
	}
	//Storage
	out, err = utils.ExecSh(`df /dev/mmcblk2p2 | tail -1 | awk '{print $3}'`)
	if err != nil {
		fmt.Println(err)
		return c.JSON(http.StatusInternalServerError, fmt.Errorf("reading used storage: %w %s", err, out))
	}
	response.UsedStorage, err = strconv.Atoi(strings.Trim(out, "\n"))
	if err != nil {
		fmt.Println(err)
		return c.JSON(http.StatusInternalServerError, fmt.Errorf("reading available atoi: %w", err))
	}
	out, err = utils.ExecSh(`df /dev/mmcblk2p2 | tail -1 | awk '{print $5}'`)
	if err != nil {
		fmt.Println(err)
		return c.JSON(http.StatusInternalServerError, fmt.Errorf("reading Percent: %w", err))
	}
	response.PercentStorage = (strings.Trim(out, "\n"))
	return c.JSON(http.StatusOK, response)
}
