package main

import (
	"os"
	"x8-oob/routes"
	"x8-oob/wsssh"

	log "github.com/inconshreveable/log15"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()
	e.Use(middleware.Logger())

	wd, err := os.Getwd()
	if err != nil {
		log.Error("reading working directory", "err", err)
		os.Exit(1)
	}

	log.Info("Working directory", "pwd", wd)

	e.Use(middleware.Static("webapp/dist"))

	e.GET("/api/board", routes.ReadBoard)
	e.GET("/api/board/hostname", routes.ReadHostname)
	e.PUT("/api/board/hostname", routes.UpdateHostname)

	e.GET("/api/networking/wlan/networks", routes.ReadWlanNetworkList)
	e.GET("/api/networking/wlan/connection", routes.ReadWlanConnection)
	e.PUT("/api/networking/wlan/connection", routes.CreateWlanConnection)

	e.GET("/api/networking/ethernet/connection", routes.ReadEthernetConnection)

	e.GET("/api/factory/name", routes.ReadFactoryName)
	e.POST("/api/factory/name", routes.CreateFactoryName)

	e.GET("/api/shell", wsssh.HandleWebsocket)

	e.Logger.Fatal(e.Start(":1323"))
}
