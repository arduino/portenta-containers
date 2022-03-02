package routes

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	wlan "x8-oob/wlan"

	log "github.com/inconshreveable/log15"
)

type connectionBody struct {
	SSID     string `json:"ssid" form:"ssid" query:"ssid"`
	Chan     int    `json:"chan" form:"chan" query:"chan"`
	Password string `json:"password" form:"password" query:"password"`
}

func ReadNetworkList(c echo.Context) error {
	networks, err := wlan.Networks()
	if err != nil {
		fmt.Println(err)
	}

	return c.JSON(http.StatusOK, networks)
}

func ReadConnection(c echo.Context) error {
	connection, err := wlan.GetConnection()
	if err != nil {
		log.Error("reading network connection: ", "err", err)
		return c.JSON(http.StatusInternalServerError, fmt.Errorf(": %w", err))
	}

	return c.JSON(http.StatusOK, connection)
}

func PostConnection(c echo.Context) error {
	b := connectionBody{}

	err := c.Bind(&b)
	if err != nil {
		return c.JSON(http.StatusBadRequest, fmt.Errorf("parsing body: %w", err))
	}

	fmt.Println(b.SSID, b.Chan, b.Password)

	err = wlan.Connect(b.SSID, b.Password)
	if errors.Is(err, wlan.NetworkConnectionFailed) {
		return c.JSON(http.StatusBadRequest, err)
	}

	if err != nil {
		fmt.Println(err)
	}

	return c.JSON(http.StatusOK, nil)
}
