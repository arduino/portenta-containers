package main

import (
	"fmt"
	"net/http/httputil"
	"net/url"
	"os"
	"strconv"
	"x8-ootb/routes"
	"x8-ootb/utils"
	"x8-ootb/wsssh"

	log15 "github.com/inconshreveable/log15"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	logLevel := log15.LvlError
	logLevelEnv := os.Getenv("LOG_LEVEL")

	fmt.Printf("LOG_LEVEL: %s\n", logLevelEnv)

	if logLevelEnv != "" {
		parsedEnv, err := strconv.ParseInt(logLevelEnv, 10, 32)
		if err != nil {
			fmt.Println("reading LOG_LEVEL env variable: %w", err)
		}
		logLevel = log15.Lvl(parsedEnv)
	}

	development := utils.AppEnvIsDevelopment()

	log15.Root().SetHandler(log15.LvlFilterHandler(logLevel, log15.StdoutHandler))

	e.Use(utils.Log15HTTPLogger())

	ootb_version := os.Getenv("OOTB_GIT_SHA_VERS")
	fmt.Printf("OOTB_GIT_SHA_VERS: %s\n", ootb_version)

	wd, err := os.Getwd()
	if err != nil {
		log15.Error("reading working directory", "err", err)
		os.Exit(1)
	}

	log15.Info("Working directory", "pwd", wd)

	e.Use(middleware.Static("webapp/dist"))

	e.GET("/api/board", routes.ReadBoard)
	e.GET("/api/board/hostname", routes.ReadHostname)
	e.PUT("/api/board/hostname", routes.UpdateHostname)

	provisioningUrl := os.Getenv("PROVISIONING_URL")

	proxy := httputil.NewSingleHostReverseProxy(&url.URL{
		Scheme: "http",
		Host:   provisioningUrl,
	})
	e.Any("/api/iot-cloud/registration", echo.WrapHandler(proxy))

	e.GET("/api/networking/wlan/networks", routes.ReadWlanNetworkList)
	e.GET("/api/networking/wlan/connection", routes.ReadWlanConnection)
	e.PUT("/api/networking/wlan/connection", routes.CreateWlanConnection)
	e.GET("/api/networking/ethernet/connection", routes.ReadEthernetConnection)
	e.POST("/api/networking/ethernet/connection", routes.CreateEthConnection)

	if development {
		e.PUT("/api/networking/ethernet/fake", routes.CreateFakeEthConnection)
		e.PUT("/api/networking/wlan/fake", routes.CreateFakeWlanConnection)
	}

	e.GET("/api/firmware/update/avaliable", routes.ReadFirmwareUpdateAvaliable)
	e.POST("/api/firmware/update/download", routes.CreateFirmwareUpdateDownload)
	e.GET("/api/firmware/update/progress", routes.ReadFirmwareUpdateProgress)

	e.GET("/api/factory/name", routes.ReadRegistration)
	e.POST("/api/factory/name", routes.CreateRegistration)
	e.DELETE("/api/factory/request", routes.DeleteRegistration)

	e.GET("/api/board/system-status", routes.ReadBoardSystemStatus)
	e.GET("/api/board/containers-status", routes.ReadContainersStatus)

	e.GET("/api/shell", wsssh.HandleWebsocket)

	e.Logger.Fatal(e.Start(":1323"))
}
