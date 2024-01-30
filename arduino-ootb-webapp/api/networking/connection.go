package networking

import (
	"fmt"
	"net"
	"strings"

	utils "x8-ootb/utils"
)

const DEVICE_NAME = "eth0"

func GetConnection(isWlan bool, isEth bool) (*Connection, error) {
	out := ""
	var err error

	var connectionName string
	var cidrIpv4 string
	if isWlan {
		out, err = utils.ExecSh(`nmcli --terse c show --active | grep  802-11-wireless || echo "not found"`)
		if err != nil {
			return nil, fmt.Errorf("reading all network connections via nmcli: %w %s", err, out)
		}
		connectionName, err = utils.ExecSh(`nmcli --terse c show --active | grep  802-11-wireless  | awk -F: '{print $1}'`)
		if err != nil {
			return nil, fmt.Errorf("reading connection name: %w %s", err, out)
		}
		cidrIpv4, err = utils.ExecSh(fmt.Sprintf(`nmcli -g IP4.ADDRESS connection show "%s" `, connectionName))
		if err != nil {
			return nil, fmt.Errorf("reading addresses configuration %s: %w %s", DEVICE_NAME, err, out)
		}

	}
	if isEth {
		out, err = utils.ExecSh(`nmcli --terse c show | grep  802-3-ethernet || echo "not found"`)
		if err != nil {
			return nil, fmt.Errorf("reading all network connections via nmcli: %w %s", err, out)
		}
		connectionName, err = utils.ExecSh(`nmcli --terse c show | grep 802-3-ethernet | awk -F: '{print $1}'`)
		if err != nil {
			return nil, fmt.Errorf("reading connection name: %w %s", err, out)
		}
		cidrIpv4, err = utils.ExecSh(fmt.Sprintf(`nmcli -g ipv4.addresses connection show "%s" `, connectionName))
		if err != nil {
			return nil, fmt.Errorf("reading addresses configuration %s: %w %s", DEVICE_NAME, err, out)
		}

	}

	if strings.Trim(out, "\n") == "not found" {
		return &Connection{
			Connected: false,
		}, nil
	}

	ip, ipv4Net, err := net.ParseCIDR(cidrIpv4)
	if err != nil {
		return nil, fmt.Errorf("parsing network ip (%s): %w", cidrIpv4, err)
	}
	sm := ipv4Net.Mask
	res := Connection{
		Connected: true,
		Network:   connectionName,
		CidrIpv4:  cidrIpv4,
		Ip:        ip.String(),
		Subnet:    fmt.Sprintf("%d.%d.%d.%d", sm[0], sm[1], sm[2], sm[3]),
		IsDhcp:    true,
	}
	out, err = utils.ExecSh(fmt.Sprintf(`nmcli -g GENERAL.HWADDR device show "%s" `, DEVICE_NAME))
	if err != nil {
		return nil, fmt.Errorf("reading mac address %s: %w %s", DEVICE_NAME, err, out)
	}
	res.MAC = strings.ReplaceAll(out, "\\", "")
	out, err = utils.ExecSh(fmt.Sprintf(`nmcli -g ipv4.gateway connection show "%s" `, connectionName))
	if err != nil {
		return nil, fmt.Errorf("reading gateway configuration %s: %w %s", DEVICE_NAME, err, out)
	}
	res.Gateway = out
	out, err = utils.ExecSh(fmt.Sprintf(`nmcli -g ipv4.dns connection show "%s" `, connectionName))
	if err != nil {
		return nil, fmt.Errorf("reading dns configuration %s: %w %s", DEVICE_NAME, err, out)
	}
	if out != "" {
		dnss := strings.Split(out, ",")
		res.PreferredDns = dnss[0]
		if len(dnss) > 1 {
			res.AlternateDns = dnss[1]
		}
	}
	out, err = utils.ExecSh(fmt.Sprintf(`nmcli connection show "%s" | grep -i ipv4.method`, connectionName))
	if err != nil {
		return nil, fmt.Errorf("reading dhcp for  %s: %w", connectionName, err)
	}
	if strings.Contains(out, "manual") {
		res.IsDhcp = false
	}

	return &res, nil
}
