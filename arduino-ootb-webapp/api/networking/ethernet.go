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
		stringMask := net.IPMask(net.ParseIP(*payload.Mask).To4())
		maskLength, _ := stringMask.Size()
		out, err := utils.ExecSh(fmt.Sprintf(`nmcli connection modify "%s" ipv4.addresses %s/%d ipv4.gateway %s ipv4.method "static"`, payload.ConnectionName, *payload.IP, maskLength, *payload.Gateway))
		if err != nil {
			return fmt.Errorf("modifying ip address: %w %s", err, out)
		}
	}
	if payload.PreferredDns != nil {
		out, err := utils.ExecSh(fmt.Sprintf(`nmcli connection modify "%s" ipv4.dns "%s %s" `, payload.ConnectionName, *payload.PreferredDns, *payload.AlternateDns))
		if err != nil {
			return fmt.Errorf("modifying ip address: %w %s", err, out)
		}
	}
	out, err := utils.ExecSh(fmt.Sprintf(`nmcli connection down "%s"  && nmcli connection up "%s" `, payload.ConnectionName, payload.ConnectionName))
	if err != nil {
		return fmt.Errorf("modifying ip address: %w %s", err, out)
	}
	return nil
}
