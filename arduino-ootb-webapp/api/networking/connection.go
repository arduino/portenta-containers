package networking

import (
	"fmt"
	"net"

	utils "x8-ootb/utils"
)

func GetConnection(interfaceName string) (*Connection, error) {
	res := Connection{
		IsDhcp: false,
	}

	//information from connection settings
	device, connection, isConnected, err := utils.GetConnectionByName(interfaceName)
	if err != nil {
		return nil, err
	}

	//MAC address
	macAddress, err := utils.GetMACAddress(device, interfaceName)
	if err != nil {
		return nil, err
	}
	res.MAC = macAddress

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
			ip := utils.Uint32ToIP(ipArray[0][0])
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
		res.PreferredDns = utils.Uint32ToIP(addresses[0])
		if len(addresses) > 1 {
			res.AlternateDns = utils.Uint32ToIP(addresses[1])
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
