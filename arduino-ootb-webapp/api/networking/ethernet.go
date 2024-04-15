package networking

import (
	"fmt"
	"net"
	"time"
	"x8-ootb/utils"

	"github.com/Wifx/gonetworkmanager/v2"
	"github.com/google/uuid"
)

const ETHERNET_INTERFACE_NAME = "eth0"
const ETHERNET_TYPE = "802-3-ethernet"

func GetEthernetConnection() (*Connection, error) {
	return GetConnection(ETHERNET_INTERFACE_NAME)
}

func EthConnect(payload EthConnection) error {
	err := utils.DeleteConnectionByInterfaceName(ETHERNET_INTERFACE_NAME)
	if err != nil {
		return fmt.Errorf("cannot delete connection: %w", err)
	}
	time.Sleep(1 * time.Second)
	settings, err := gonetworkmanager.NewSettings()
	if err != nil {
		return fmt.Errorf("new connection setting: %w", err)
	}
	connection := make(map[string]map[string]interface{})
	connection["ipv6"] = make(map[string]interface{})
	connection["ipv6"]["method"] = "auto"
	connection["ipv4"] = make(map[string]interface{})
	connection["connection"] = make(map[string]interface{})
	connection["connection"]["id"] = "Wired connection 1"
	connection["connection"]["type"] = ETHERNET_TYPE
	connectionUUID, err := uuid.NewUUID()
	if err != nil {
		return fmt.Errorf("cannot create uuid: %w", err)
	}
	connection["connection"]["uuid"] = connectionUUID.String()
	connection["connection"]["interface-name"] = ETHERNET_INTERFACE_NAME
	connection["connection"]["autoconnect"] = true

	connection[ETHERNET_TYPE] = make(map[string]interface{})
	connection[ETHERNET_TYPE]["auto-negotiate"] = false

	if payload.IP != nil {
		if payload.Gateway == nil {
			return fmt.Errorf("gateway missing")
		}
		ipUint32 := utils.IpToUint32(*payload.IP)
		ipUint32Gateway := utils.IpToUint32(*payload.Gateway)
		stringMask := net.IPMask(net.ParseIP(*payload.Subnet).To4())
		maskLength, _ := stringMask.Size()
		addresses := make([]uint32, 3)
		addressArray := make([][]uint32, 1)
		addresses[0] = ipUint32
		addresses[1] = uint32(maskLength)
		addresses[2] = ipUint32Gateway
		addressArray[0] = addresses
		connection["ipv4"]["addresses"] = addressArray
		connection["ipv4"]["method"] = "manual"
		connection["ipv4"]["gateway"] = *payload.Gateway
	} else {
		connection["ipv4"]["method"] = "auto"
	}
	if payload.PreferredDns != nil {
		addresses := make([]uint32, 2)
		addresses[0] = utils.IpToUint32(*payload.PreferredDns)
		if payload.AlternateDns != nil {
			addresses[1] = utils.IpToUint32(*payload.AlternateDns)
		}
		connection["ipv4"]["dns"] = addresses
		connection["ipv4"]["ignore-auto-dns"] = true
	} else {
		connection["ipv4"]["ignore-auto-dns"] = false
	}

	_, err = settings.AddConnection(connection)
	if err != nil {
		return fmt.Errorf("cannot add connection: %w", err)
	}
	return nil
}
