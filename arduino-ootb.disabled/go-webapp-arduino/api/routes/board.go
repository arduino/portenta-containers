package routes

import (
	"fmt"
	"net/http"
	"x8-oob/board"

	"github.com/labstack/echo/v4"
)

type boardInfo struct {
	DeviceModelName string `json:"deviceModelName"`
}

type updateHostnameBody struct {
	Hostname string `json:"hostname"`
}

type boardHostname struct {
	Hostname string `json:"hostname"`
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

	b := boardHostname{
		Hostname: h,
	}

	return c.JSON(http.StatusOK, b)
}

func UpdateHostname(c echo.Context) error {
	b := updateHostnameBody{}

	err := c.Bind(&b)
	if err != nil {
		return c.JSON(http.StatusBadRequest, fmt.Errorf("parsing body: %w", err))
	}

	fmt.Println(b.Hostname)

	h, err := board.UpdateHostname(b.Hostname)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	r := boardHostname{
		Hostname: h,
	}

	return c.JSON(http.StatusOK, r)
}
