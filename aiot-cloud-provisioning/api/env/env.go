package env

import (
	"os"

	"github.com/inconshreveable/log15"
)

type EnvVariables struct {
	IoTConfigPath    string
	SerialNumberPath string
	IoTAPIURL        string
	IoTFQBN          string
}

func Env() EnvVariables {
	v := EnvVariables{}

	iotConfigPathEnv := os.Getenv("IOT_SECRETS_PATH")
	if iotConfigPathEnv == "" {
		iotConfigPathEnv = "/var/sota/iot-secrets.json"
	}
	v.IoTConfigPath = iotConfigPathEnv

	serialNumberPathEnv := os.Getenv("SERIAL_NUMBER_PATH")
	if serialNumberPathEnv == "" {
		serialNumberPathEnv = "/sys/devices/soc0/serial_number"
	}
	v.SerialNumberPath = serialNumberPathEnv

	iotAPIURLEnv := os.Getenv("IOT_API_URL")
	if iotAPIURLEnv == "" {
		iotAPIURLEnv = "https://api2.arduino.cc"
	}
	v.IoTAPIURL = iotAPIURLEnv

	iotFQBNEnv := os.Getenv("IOT_FQBN")
	if iotFQBNEnv == "" {
		iotFQBNEnv = "arduino:python:portenta_x8"
	}
	v.IoTFQBN = iotFQBNEnv

	log15.Info("Environment variable", "IOT_SECRETS_PATH", v.IoTConfigPath)
	log15.Info("Environment variable", "SERIAL_NUMBER_PATH", v.SerialNumberPath)
	log15.Info("Environment variable", "IOT_API_URL", v.IoTAPIURL)
	log15.Info("Environment variable", "IOT_FQBN", v.IoTFQBN)

	return v
}
