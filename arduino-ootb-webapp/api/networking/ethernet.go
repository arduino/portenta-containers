package networking

import (
	"encoding/binary"
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
	res := Connection{
		IsDhcp: false,
	}

	//MAC address
	macAddress, err := getMACAddress(ETHERNET_INTERFACE_NAME)
	if err != nil {
		return nil, err
	}
	res.MAC = macAddress
	//information from connection settings
	device, connection, isConnected, err := utils.GetConnectionByName(ETHERNET_INTERFACE_NAME)
	if err != nil {
		return nil, err
	}
	connSetting, err := connection.GetSettings()
	if err != nil {
		return nil, err
	}
	if connSetting == nil {
		return nil, fmt.Errorf("no connection found")
	}
	res.Connected = isConnected
	//Connection name
	if connSetting["connection"]["id"] != nil {
		res.Network = connSetting["connection"]["id"].(string)
	}
	//CIDR IP Netmask
	if connSetting["ipv4"]["addresses"] != nil {
		ipArray := (connSetting["ipv4"]["addresses"].([][]uint32))
		if len(ipArray) > 0 && len(ipArray[0]) > 0 {
			ip := uint32ToIP(ipArray[0][0])
			netmask := ipArray[0][1]
			cidrIpv4 := fmt.Sprintf("%s/%d", ip, netmask)
			res.Ip = ip
			res.CidrIpv4 = cidrIpv4
			netmaskIP := net.CIDRMask(int(netmask), 32)
			subnet := net.IP(netmaskIP)
			res.Subnet = subnet.String()
		}
	}
	//Dhcp
	if connSetting["ipv4"]["method"] != nil && connSetting["ipv4"]["method"].(string) == "auto" {
		res.IsDhcp = true
		//Ip4 config from device
		deviceIp4Config, err := device.GetPropertyIP4Config()
		if err != nil {
			return nil, err
		}
		ip4Addresses, err := deviceIp4Config.GetPropertyAddresses()
		if err != nil {
			return nil, err
		}
		if len(ip4Addresses) > 0 {
			ip := ip4Addresses[0].Address
			netmask := ip4Addresses[0].Prefix
			cidrIpv4 := fmt.Sprintf("%s/%d", ip, netmask)
			res.Ip = ip
			res.CidrIpv4 = cidrIpv4
			netmaskIP := net.CIDRMask(int(netmask), 32)
			subnet := net.IP(netmaskIP)
			res.Subnet = subnet.String()
			res.Gateway = ip4Addresses[0].Gateway
		}
	}
	//Gateway
	if connSetting["ipv4"]["gateway"] != nil {
		res.Gateway = connSetting["ipv4"]["gateway"].(string)
	}
	if connSetting["ipv4"]["ignore-auto-dns"] != nil {
		res.IgnoreAutoDns = connSetting["ipv4"]["ignore-auto-dns"].(bool)
		addresses := connSetting["ipv4"]["dns"].([]uint32)
		res.PreferredDns = uint32ToIP(addresses[0])
		if len(addresses) > 1 {
			res.AlternateDns = uint32ToIP(addresses[1])
		}
	} else {
		dhcp4, err := device.GetPropertyDHCP4Config()
		if err != nil {
			return &res, err
		}
		if dhcp4 != nil {
			dhcp4Option, err := dhcp4.GetPropertyOptions()
			if err != nil {
				return nil, err
			}
			if dhcp4Option["domain_name_servers"] != nil {
				res.PreferredDns = dhcp4Option["domain_name_servers"].(string)
				res.AlternateDns = ""
			}
		}
	}
	return &res, nil
}

func EthConnect(payload EthConnection) error {
	err := utils.DeleteConnectionByInterfaceName(ETHERNET_INTERFACE_NAME)
	if err != nil {
		return err
	}
	time.Sleep(1 * time.Second)
	settings, err := gonetworkmanager.NewSettings()
	if err != nil {
		return err
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
		return err
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
		ipUint32 := ipToUint32(*payload.IP)
		ipUint32Gateway := ipToUint32(*payload.Gateway)
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
		addresses[0] = ipToUint32(*payload.PreferredDns)
		if payload.AlternateDns != nil {
			addresses[1] = ipToUint32(*payload.AlternateDns)
		}
		connection["ipv4"]["dns"] = addresses
		connection["ipv4"]["ignore-auto-dns"] = true
	} else {
		connection["ipv4"]["ignore-auto-dns"] = false
	}

	_, err = settings.AddConnection(connection)
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
func uint32ToIP(value uint32) string {
	byteIP := make([]byte, 4)
	binary.BigEndian.PutUint32(byteIP, value)
	ip := net.IPv4(byteIP[3], byteIP[2], byteIP[1], byteIP[0])
	return ip.String()
}
func getMACAddress(interfaceName string) (string, error) {
	interfaceObj, err := net.InterfaceByName(interfaceName)
	if err != nil {
		return "", err
	}
	macAddress := interfaceObj.HardwareAddr
	return macAddress.String(), nil
}
