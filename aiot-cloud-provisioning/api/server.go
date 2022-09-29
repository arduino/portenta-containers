package main

import (
	"fmt"
	"os"
	"x8-aiot-cp-api/registration"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	wd, err := os.Getwd()
	if err != nil {
		fmt.Println("reading working directory", "err", err)
		os.Exit(1)
	}

	fmt.Println("Working directory", "pwd", wd)

	e.Use(middleware.Static("webapp/dist"))

	e.GET("/api/iot-cloud/registration", registration.ReadDeviceName)
	e.POST("/api/iot-cloud/registration", registration.RegisterToIOTCloud)
	e.DELETE("/api/iot-cloud/registration", registration.UnregisterFromIOTCloud)

	e.Logger.Fatal(e.Start(":1324"))
}
