package routes

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	networking "x8-ootb/networking"
	"x8-ootb/utils"

	log "github.com/inconshreveable/log15"
)

var fakeEthConnection *networking.Connection
var fakeWlanConnection *networking.Connection

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
	if utils.AppEnvIsDevelopment() && fakeWlanConnection != nil {
		return c.JSON(http.StatusOK, fakeWlanConnection)
	}

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
	if utils.AppEnvIsDevelopment() && fakeEthConnection != nil {
		return c.JSON(http.StatusOK, fakeEthConnection)
	}

	connection, err := networking.GetEthernetConnection()
	if err != nil {
		log.Error("reading network connection: ", "err", err)
		return c.JSON(http.StatusInternalServerError, fmt.Errorf(": %w", err))
	}

	return c.JSON(http.StatusOK, connection)
}

func CreateFakeEthConnection(c echo.Context) error {
	connection := networking.Connection{}

	err := c.Bind(&connection)
	if err != nil {
		return c.JSON(http.StatusBadRequest, fmt.Errorf("parsing body: %w", err))
	}

	fakeEthConnection = &connection
	return c.JSON(http.StatusOK, connection)
}

func CreateFakeWlanConnection(c echo.Context) error {
	connection := networking.Connection{}

	err := c.Bind(&connection)
	if err != nil {
		return c.JSON(http.StatusBadRequest, fmt.Errorf("parsing body: %w", err))
	}

	fakeWlanConnection = &connection
	return c.JSON(http.StatusOK, connection)
}
