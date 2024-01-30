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

func GetConnectionByName(interfaceName string) (gonetworkmanager.Device, gonetworkmanager.Connection, bool, error) {
	nm, err := gonetworkmanager.NewNetworkManager()
	if err != nil {
		return nil, nil, false, err
	}
	device, err := nm.GetDeviceByIpIface(interfaceName)
	if err != nil {
		return nil, nil, false, err
	}
	// Check for an active connection
	activeConnection, err := device.GetPropertyActiveConnection()
	if err != nil {
		return nil, nil, false, err
	}
	if activeConnection != nil {
		connection, err := activeConnection.GetPropertyConnection()
		if err != nil {
			return nil, nil, false, err
		}
		return device, connection, true, nil
	}

	settings, err := gonetworkmanager.NewSettings()
	if err != nil {
		return nil, nil, false, err
	}
	connections, err := settings.ListConnections()
	if err != nil {
		return nil, nil, false, err
	}
	connectionsByIface := []gonetworkmanager.Connection{}
	for _, c := range connections {
		connSettings, err := c.GetSettings()
		if err != nil {
			return nil, nil, false, err
		}
		if connSettings["connection"]["interface-name"] == interfaceName {
			connectionsByIface = append(connectionsByIface, c)
			if connSettings["connection"]["autoconnect-priority"] != nil {
				priority := connSettings["connection"]["autoconnect-priority"].(int32)
				if priority == -999 {
					return device, c, false, nil
				}
			}

		}
	}
	priority := int32(0)
	connIndex := 0
	for i, c := range connectionsByIface {
		connSettings, err := c.GetSettings()
		if err != nil {
			return nil, nil, false, err
		}
		if connSettings["connection"]["autoconnect-priority"] != nil {
			priorityVal := connSettings["connection"]["autoconnect-priority"].(int32)
			if priorityVal >= priority {
				priority = priorityVal
				connIndex = i
			}
		}
	}
	return device, connectionsByIface[connIndex], false, err
}
