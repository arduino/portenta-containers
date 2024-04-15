package utils

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"net"
	"os/exec"
	"strings"

	"github.com/Wifx/gonetworkmanager/v2"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

var ErrNoInterface = errors.New("Connections not found")

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

	if len(connectionsByIface) == 0 {
		return nil, nil, false, ErrNoInterface
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

func DeleteConnectionByInterfaceName(interfaceName string) error {
	settings, err := gonetworkmanager.NewSettings()
	if err != nil {
		return err
	}
	connections, err := settings.ListConnections()
	if err != nil {
		return err
	}
	for _, c := range connections {
		connSettings, err := c.GetSettings()
		if err != nil {
			return err
		}
		if connSettings["connection"]["interface-name"] == interfaceName {
			err := c.Delete()
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func IpToUint32(ip string) uint32 {
	ipAddr := net.ParseIP(ip).To4()
	reversedIP := [4]byte{ipAddr[3], ipAddr[2], ipAddr[1], ipAddr[0]}
	res := binary.BigEndian.Uint32(reversedIP[:])
	return res
}
func Uint32ToIP(value uint32) string {
	byteIP := make([]byte, 4)
	binary.BigEndian.PutUint32(byteIP, value)
	ip := net.IPv4(byteIP[3], byteIP[2], byteIP[1], byteIP[0])
	return ip.String()
}
func GetMACAddress(device gonetworkmanager.Device, interfaceName string) (string, error) {
	if interfaceName == "wlan0" {
		deviceGeneric, err := gonetworkmanager.NewDeviceWireless(device.GetPath())
		if err != nil {
			return "", err
		}
		macAddress, err := deviceGeneric.GetPropertyHwAddress()
		if err != nil {
			return "", err
		}
		return macAddress, nil
	}
	if interfaceName == "eth0" {
		deviceGeneric, err := gonetworkmanager.NewDeviceWired(device.GetPath())
		if err != nil {
			return "", err
		}
		macAddress, err := deviceGeneric.GetPropertyHwAddress()
		if err != nil {
			return "", err
		}
		return macAddress, nil
	}
	return "", nil
}
