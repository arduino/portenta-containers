package networking

import (
	"encoding/binary"
	"fmt"
	"net"
	"x8-ootb/utils"
)

const ETHERNET_ID = "Wired connection 1"
const ETHERNET_INTERFACE_NAME = "eth0"

func GetEthernetConnection() (*Connection, error) {
	res := Connection{
		Network: ETHERNET_ID,
		IsDhcp:  false,
	}
	//information from connection device
	device, err := utils.GetDeviceByInterfaceName(ETHERNET_INTERFACE_NAME)
	if err != nil {
		return nil, err
	}
	//Check connection state
	activeConnection, err := device.GetPropertyActiveConnection()
	if err != nil {
		return nil, err
	}
	res.Connected = activeConnection != nil

	//MAC address

	//information from connection settings
	_, connSetting, err := utils.GetConnectionSettingsByName(ETHERNET_ID, ETHERNET_INTERFACE_NAME)
	if err != nil {
		return nil, err
	}
	if connSetting == nil {
		return nil, fmt.Errorf("no connection found")
	}

	//CIDR IP Netmask
	if connSetting["ipv4"]["addresses"] != nil {
		ip := uint32ToIP(connSetting["ipv4"]["addresses"].([][]uint32)[0][0])
		netmask := connSetting["ipv4"]["addresses"].([][]uint32)[0][1]
		cidrIpv4 := fmt.Sprintf("%s/%d", ip, netmask)
		res.Ip = ip
		res.CidrIpv4 = cidrIpv4
		netmaskIP := net.CIDRMask(int(netmask), 32)
		subnet := net.IP(netmaskIP)
		res.Subnet = subnet.String()
	}
	//IS DHCP
	if connSetting["ipv4"]["method"] != nil && connSetting["ipv4"]["method"].(string) == "auto" {
		res.IsDhcp = true
	}
	//Gateway
	if connSetting["ipv4"]["gateway"] != nil {
		res.Gateway = connSetting["ipv4"]["gateway"].(string)
	}
	if connSetting["ipv4"]["ignore-auto-dns"] != nil {
		res.IgnoreAutoDns = connSetting["ipv4"]["ignore-auto-dns"].(bool)

	} else {
		dhcp4Config, err := utils.GetDHCP4Config(ETHERNET_INTERFACE_NAME)
		if err != nil {
			return nil, err
		}
		if dhcp4Config["domain_name_servers"] != nil {
			res.PreferredDns = dhcp4Config["domain_name_servers"].(string)
			res.AlternateDns = ""
		}
	}
	return &res, nil
}

func EthConnect(payload EthConnection) error {
	connection, connSetting, err := utils.GetConnectionSettingsByName(ETHERNET_ID, ETHERNET_INTERFACE_NAME)
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
func uint32ToIP(value uint32) string {
	byteIP := make([]byte, 4)
	binary.BigEndian.PutUint32(byteIP, value)
	ip := net.IPv4(byteIP[3], byteIP[2], byteIP[1], byteIP[0])
	return ip.String()
}
