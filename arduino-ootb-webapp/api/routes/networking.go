package routes

import (
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
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, connection)
}

func CreateWlanConnection(c echo.Context) error {
	b := connectionBody{}

	err := c.Bind(&b)
	if err != nil {
		return c.JSON(http.StatusBadRequest, fmt.Errorf("parsing body: %w", err))
	}

	err = networking.WlanConnect(b.SSID, b.Password)

	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, nil)
}

func ReadEthernetConnection(c echo.Context) error {
	connection, err := networking.GetEthernetConnection()
	if err != nil {
		log.Error("reading network connection: ", "err", err)
		return c.JSON(http.StatusInternalServerError, err.Error())
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
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	resultconnection, err := networking.GetEthernetConnection()
	if err != nil {
		log.Error("reading network connection: ", "err", err)
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, resultconnection)
}

func ReadModemConnection(c echo.Context) error {
	connection, err := networking.GetModemConnection()
	if err != nil {
		log.Error("reading network connection: ", "err", err)
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, connection)
}

func CreateModemConnection(c echo.Context) error {
	payload := networking.ModemConnectionPayload{}
	err := c.Bind(&payload)
	if err != nil {
		return c.JSON(http.StatusBadRequest, fmt.Errorf("parsing body: %w", err))
	}
	err = networking.ModemConnect(payload)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	resultconnection, err := networking.GetModemConnection()
	if err != nil {
		log.Error("reading network connection: ", "err", err)
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, resultconnection)
}
