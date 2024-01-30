package networking

import (
	"fmt"
	"net"
	utils "x8-ootb/utils"
)

func GetEthernetConnection() (*Connection, error) {
	return GetConnection(false, true)
}

func EthConnect(payload EthConnection) error {
	if payload.IP != nil {
		stringMask := net.IPMask(net.ParseIP(*payload.Subnet).To4())
		maskLength, _ := stringMask.Size()
		out, err := utils.ExecSh(fmt.Sprintf(`nmcli connection modify "Wired connection 1" ipv4.addresses %s/%d ipv4.gateway %s ipv4.method "static"`, *payload.IP, maskLength, *payload.Gateway))
		if err != nil {
			return fmt.Errorf("modifying ip address: %w %s", err, out)
		}
	} else {
		out, err := utils.ExecSh(`nmcli connection modify "Wired connection 1"  ipv4.method "auto"`)
		if err != nil {
			return fmt.Errorf("modifying ip address: %w %s", err, out)
		}
	}
	if payload.PreferredDns != nil {
		out, err := utils.ExecSh(fmt.Sprintf(`nmcli connection modify "Wired connection 1" ipv4.dns "%s %s" `, *payload.PreferredDns, *payload.AlternateDns))
		if err != nil {
			return fmt.Errorf("modifying ip address: %w %s", err, out)
		}
	} else {
		out, err := utils.ExecSh(`nmcli connection modify "Wired connection 1" ipv4.dns "" `)
		if err != nil {
			return fmt.Errorf("modifying ip address: %w %s", err, out)
		}
	}
	out, err := utils.ExecSh(`nmcli connection down "Wired connection 1"  && nmcli connection up "Wired connection 1" `)
	if err != nil {
		return fmt.Errorf("modifying ip address: %w %s", err, out)
	}
	return nil
}
