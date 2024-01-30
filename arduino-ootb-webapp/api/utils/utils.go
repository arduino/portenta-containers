package utils

import (
	"bytes"
	"fmt"
	"os/exec"
	"strings"

	"github.com/Wifx/gonetworkmanager/v2"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func ExecSh(command string) (string, error) {
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd := exec.Command("sh", "-c", command)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err := cmd.Run()
	if err != nil {
		return stderr.String(), fmt.Errorf("(command: %s) cmd: %w", command, err)
	}

	return strings.Trim(stdout.String(), "\n"), nil
}

func GetConnectionSettingsByName(id string, interfaceName string) (gonetworkmanager.Connection, gonetworkmanager.ConnectionSettings, error) {
	settings, err := gonetworkmanager.NewSettings()
	if err != nil {
		return nil, nil, err
	}
	connections, err := settings.ListConnections()
	if err != nil {
		return nil, nil, err
	}
	for _, connection := range connections {
		connSetting, err := connection.GetSettings()
		if err != nil {
			return connection, connSetting, err
		}
		if connSetting["connection"]["id"] == id {
			return connection, connSetting, err
		}

	}
	return nil, nil, err
}
func GetDHCP4Config(interfaceName string) (gonetworkmanager.DHCP4Options, error) {
	nm, err := gonetworkmanager.NewNetworkManager()
	if err != nil {
		return nil, err
	}
	devices, err := nm.GetPropertyAllDevices()
	if err != nil {
		return nil, err
	}
	for _, device := range devices {
		deviceInterface, err := device.GetPropertyInterface()
		if err != nil {
			continue
		}
		if deviceInterface == interfaceName {
			dhcp4, err := device.GetPropertyDHCP4Config()
			if err != nil {
				continue
			}
			if dhcp4 == nil {
				continue
			}
			dhcp4Option, err := dhcp4.GetPropertyOptions()
			if err != nil {
				continue
			}
			return dhcp4Option, nil
		}

	}
	return nil, nil
}

func GetDeviceByInterfaceName(interfaceName string) (gonetworkmanager.Device, error) {
	nm, err := gonetworkmanager.NewNetworkManager()
	if err != nil {
		return nil, err
	}
	devices, err := nm.GetPropertyAllDevices()
	if err != nil {
		return nil, err
	}
	for _, device := range devices {
		deviceInterface, err := device.GetPropertyInterface()
		if err != nil {
			continue
		}
		if deviceInterface == interfaceName {
			return device, nil
		}
	}
	return nil, nil
}
