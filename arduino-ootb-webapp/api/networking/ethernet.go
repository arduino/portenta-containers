package networking

import (
	"encoding/binary"
	"fmt"
	"net"
	"x8-ootb/utils"
)

func GetEthernetConnection() (*Connection, error) {
	return GetConnection(false, true)
}

const (
	ethernetType = "802-3-ethernet"
)

const ETHERNET_NAME = "Wired connection 1"

func EthConnect(payload EthConnection) error {
	connection, connSetting, err := utils.GetConnectionSettingsByName(ETHERNET_NAME)
	if err != nil {
		return err
	}
	if connSetting == nil {
		return fmt.Errorf("no connection found")
	}

	connSetting["ipv6"] = make(map[string]interface{})
	connSetting["ipv6"]["method"] = "ignore"
	if payload.IP != nil {
		if payload.Gateway == nil {
			return fmt.Errorf("gateway missing")
		}
		ipUint32 := ipToUint32(*payload.IP)
		ipUint32Gateway := ipToUint32(*payload.Gateway)
		stringMask := net.IPMask(net.ParseIP(*payload.Subnet).To4())
		maskLength, _ := stringMask.Size()

		addresses := make([]uint32, 3)
		addresses[0] = ipUint32
		addresses[1] = uint32(maskLength)
		addresses[2] = ipUint32Gateway

		addressArray := make([][]uint32, 1)
		addressArray[0] = addresses
		connSetting["ipv4"]["addresses"] = addressArray
		connSetting["ipv4"]["method"] = "manual"
		connSetting["ipv4"]["gateway"] = *payload.Gateway
	} else {
		connSetting["ipv4"]["method"] = "auto"
	}
	if payload.PreferredDns != nil {
		addresses := make([]uint32, 2)
		addresses[0] = ipToUint32(*payload.PreferredDns)
		if payload.AlternateDns != nil {
			addresses[1] = ipToUint32(*payload.AlternateDns)
		}
		connSetting["ipv4"]["dns"] = addresses
		connSetting["ipv4"]["ignore-auto-dns"] = true
	} else {
		addresses := make([]uint32, 2)
		connSetting["ipv4"]["dns"] = addresses
		connSetting["ipv4"]["ignore-auto-dns"] = false
	}
	err = connection.Update(connSetting)
	if err != nil {
		return err
	}
	return nil
}

func ipToUint32(ip string) uint32 {
	ipAddr := net.ParseIP(ip).To4()
	reversedIP := [4]byte{ipAddr[3], ipAddr[2], ipAddr[1], ipAddr[0]}
	res := binary.BigEndian.Uint32(reversedIP[:])
	return res
}
