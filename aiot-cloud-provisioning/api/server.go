package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/exec"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type ErrorResponse struct {
	Error error `json:"error"`
}

type IoTSecretsFile struct {
	Name     *string `json:"name"`
	Type     *string `json:"type"`
	DeviceID *string `json:"device_id"`
}

type IoTCloudDeviceName struct {
	Name      *string `json:"name"`
	Suggested bool    `json:"suggested"`
}

type RegisterToIOTCloudBody struct {
	ClientID     string `json:"clientId"`
	ClientSecret string `json:"clientSecret"`
	DeviceName   string `json:"deviceName"`
}

func shellout(args ...string) (string, string, error) {
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	a := append([]string{"-c"}, args...)
	cmd := exec.Command("bash", a...)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}

func readDeviceNameFromFile() (*string, error) {
	iotSecretsPathEnv := os.Getenv("IOT_SECRETS_PATH")

	if iotSecretsPathEnv == "" {
		iotSecretsPathEnv = "/var/sota/iot-secrets"
	}

	// Secrets file not found, the device is not registered
	if _, err := os.Stat(iotSecretsPathEnv); errors.Is(err, os.ErrNotExist) {
		return nil, nil
	}

	// Read the JSON file
	content, err := os.ReadFile(iotSecretsPathEnv)
	if err != nil {
		return nil, fmt.Errorf("reading iot-secrets.json file: %w", err)
	}

	// Parse the JSON file
	sf := IoTSecretsFile{}
	err = json.Unmarshal(content, &sf)
	if err != nil {
		return nil, fmt.Errorf("unmarshalling iot-secrets.json file: %w", err)
	}

	return sf.Name, nil
}

func writeDeviceNameToFile(name string) error {
	iotSecretsPathEnv := os.Getenv("IOT_SECRETS_PATH")

	if iotSecretsPathEnv == "" {
		iotSecretsPathEnv = "/var/sota/iot-secrets"
	}

	// Secrets file not found, the device is not registered
	if _, err := os.Stat(iotSecretsPathEnv); errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("checking iot-secrets file exists: %w", err)
	}

	// Read the JSON file
	content, err := os.ReadFile(iotSecretsPathEnv)
	if err != nil {
		return fmt.Errorf("reading iot-secrets file: %w", err)
	}

	// Parse the JSON file
	sf := make(map[string]string)
	err = json.Unmarshal(content, &sf)
	if err != nil {
		return fmt.Errorf("parsing iot-secrets file from json: %w", err)
	}

	sf["name"] = name

	m, err := json.Marshal(sf)
	if err != nil {
		return fmt.Errorf("parsing iot-secrets file to json: %w", err)
	}

	err = os.WriteFile(iotSecretsPathEnv, []byte(m), 0644)
	if err != nil {
		return fmt.Errorf("writing iot-secrets file: %w", err)
	}

	return nil
}

func ReadDeviceName(c echo.Context) error {
	serialNumberPathEnv := os.Getenv("SERIAL_NUMBER_PATH")

	if serialNumberPathEnv == "" {
		serialNumberPathEnv = "/sys/devices/soc0/serial_number"
	}

	// Read device serial number
	content, err := os.ReadFile(serialNumberPathEnv)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: fmt.Errorf("reading /sys/devices/soc0/serial_number: %w", err)})
	}

	suggestedName := fmt.Sprintf("portenta-x8-%s", content)

	res := IoTCloudDeviceName{
		Name:      &suggestedName,
		Suggested: true,
	}

	deviceName, err := readDeviceNameFromFile()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err})
	}

	// Device name not found, the device is not registered
	if deviceName == nil || *deviceName == "" {
		return c.JSON(http.StatusOK, res)
	}

	res.Name = deviceName
	res.Suggested = false

	return c.JSON(http.StatusOK, res)
}

func RegisterToIOTCloud(c echo.Context) error {
	iotSecretsPathEnv := os.Getenv("IOT_SECRETS_PATH")

	if iotSecretsPathEnv == "" {
		iotSecretsPathEnv = "/var/sota/iot-secrets"
	}

	b := RegisterToIOTCloudBody{}

	err := c.Bind(&b)
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{Error: fmt.Errorf("parsing body: %w", err)})
	}

	out, outerr, err := shellout(fmt.Sprintf("./provisioning.sh %s %s %s", b.ClientID, b.ClientSecret, b.DeviceName))
	if err != nil {
		fmt.Print(outerr)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: fmt.Errorf("getting stdout: %w", err)})
	}

	err = writeDeviceNameToFile(b.DeviceName)
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{Error: fmt.Errorf("writing device name to file: %w", err)})
	}

	return c.JSON(http.StatusOK, out)
}

func UnregisterFromIOTCloud(c echo.Context) error {
	err := writeDeviceNameToFile("")
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{Error: fmt.Errorf("writing device name to file: %w", err)})
	}

	return c.String(http.StatusOK, "")
}

func main() {
	e := echo.New()

	wd, err := os.Getwd()
	if err != nil {
		fmt.Println("reading working directory", "err", err)
		os.Exit(1)
	}

	fmt.Println("Working directory", "pwd", wd)

	e.Use(middleware.Static("webapp/dist"))

	e.GET("/api/iot-cloud/registration", ReadDeviceName)
	e.POST("/api/iot-cloud/registration", RegisterToIOTCloud)
	e.DELETE("/api/iot-cloud/registration", UnregisterFromIOTCloud)

	e.Logger.Fatal(e.Start(":1324"))
}
