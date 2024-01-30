package routes

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	networking "x8-ootb/networking"

	log "github.com/inconshreveable/log15"
)

type connectionBody struct {
	SSID     string `json:"ssid" form:"ssid" query:"ssid"`
	Chan     int    `json:"chan" form:"chan" query:"chan"`
	Password string `json:"password" form:"password" query:"password"`
}

func ReadWlanNetworkList(c echo.Context) error {
	networks, err := networking.WlanNetworks()
	if err != nil {
		fmt.Println(err)
	}

	return c.JSON(http.StatusOK, networks)
}

func ReadWlanConnection(c echo.Context) error {
	connection, err := networking.GetWlanConnection()
	if err != nil {
		log.Error("reading network connection: ", "err", err)
		return c.JSON(http.StatusInternalServerError, fmt.Errorf(": %w", err))
	}

	return c.JSON(http.StatusOK, connection)
}

func CreateWlanConnection(c echo.Context) error {
	b := connectionBody{}

	err := c.Bind(&b)
	if err != nil {
		return c.JSON(http.StatusBadRequest, fmt.Errorf("parsing body: %w", err))
	}

	fmt.Println(b.SSID, b.Chan, b.Password)

	err = networking.WlanConnect(b.SSID, b.Password)
	if errors.Is(err, networking.NetworkConnectionFailed) {
		return c.JSON(http.StatusBadRequest, err)
	}
	if err != nil {
		fmt.Println(err)
		return c.JSON(http.StatusBadRequest, err)
	}

	return c.JSON(http.StatusOK, nil)
}

func ReadEthernetConnection(c echo.Context) error {
	connection, err := networking.GetEthernetConnection()
	if err != nil {
		log.Error("reading network connection: ", "err", err)
		return c.JSON(http.StatusInternalServerError, fmt.Errorf(": %w", err))
	}

	return c.JSON(http.StatusOK, connection)
}

func CreateEthConnection(c echo.Context) error {
	connection := networking.EthConnection{}

	err := c.Bind(&connection)
	if err != nil {
		return c.JSON(http.StatusBadRequest, fmt.Errorf("parsing body: %w", err))
	}
	err = networking.EthConnect(connection)
	if errors.Is(err, networking.NetworkConnectionFailed) {
		return c.JSON(http.StatusBadRequest, err)
	}
	resultconnection, err := networking.GetEthernetConnection()
	if err != nil {
		log.Error("reading network connection: ", "err", err)
		return c.JSON(http.StatusInternalServerError, fmt.Errorf(": %w", err))
	}
	return c.JSON(http.StatusOK, resultconnection)
}
