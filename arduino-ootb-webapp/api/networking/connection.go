package networking

import (
	"encoding/csv"
	"fmt"
	"io"
	"net"
	"regexp"
	"strings"

	utils "x8-ootb/utils"

	log "github.com/inconshreveable/log15"
)

func GetConnection(isWlan bool, isEth bool) (*Connection, error) {
	out := ""
	var err error
	partialCommand := "nmcli --terse c show --active | grep "
	if isWlan {
		out, err = utils.ExecSh(partialCommand + " 802-11-wireless ")
		if err != nil {
			return nil, fmt.Errorf("reading all network connections via nmcli: %w %s", err, out)
		}
	}
	if isEth {
		out, err = utils.ExecSh(partialCommand + ` 802-3-ethernet `)
		if err != nil {
			return nil, fmt.Errorf("reading all network connections via nmcli: %w %s", err, out)
		}
	}

	if out == "" {
		return &Connection{
			Connected: false,
		}, nil
	}

	var netRecord string
	var nic string

	r := csv.NewReader(strings.NewReader(out))
	r.Comma = ':'
	for {
		record, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("parsing nmcli output: %w", err)
		}
		netRecord = record[0]
		nic = record[3]
	}

	out, err = utils.ExecSh(fmt.Sprintf("nmcli --terse --fields IP4.ADDRESS,IP4.GATEWAY,GENERAL.HWADDR device show %s", nic))
	if err != nil {
		return nil, fmt.Errorf("reading network ip for NIC %s: %w %s", nic, err, out)
	}

	log.Debug("Reading connection", "nic", nic, "out", out)

	var re = regexp.MustCompile(`IP4\.ADDRESS\[1\]:(.*)`)
	match := re.FindAllStringSubmatch(out, -1)

	if match == nil {
		return nil, fmt.Errorf("reading network route: no match: output: %s", out)
	}

	if match[0] == nil {
		return nil, fmt.Errorf("reading network route: no match: output: %s", out)
	}
	cidrIpv4 := match[0][1]

	re = regexp.MustCompile(`IP4\.GATEWAY:(.*)`)
	match = re.FindAllStringSubmatch(out, -1)

	if match == nil {
		return nil, fmt.Errorf("reading network link: no match: output: %s", out)
	}

	if match[0] == nil {
		return nil, fmt.Errorf("reading network link: no match: output: %s", out)
	}
	gateway := match[0][1]

	re = regexp.MustCompile(`GENERAL\.HWADDR:(.*)`)
	match = re.FindAllStringSubmatch(out, -1)

	if match == nil {
		return nil, fmt.Errorf("reading network mac: no match: output: %s", out)
	}

	if match[0] == nil {
		return nil, fmt.Errorf("reading network mac: no match: output: %s", out)
	}
	mac := match[0][1]
	ip, ipv4Net, err := net.ParseCIDR(cidrIpv4)
	if err != nil {
		return nil, fmt.Errorf("parsing network ip: %w", err)
	}
	sm := ipv4Net.Mask
	res := Connection{
		Connected: true,
		Network:   netRecord,
		CidrIpv4:  cidrIpv4,
		Ip:        ip.String(),
		Subnet:    fmt.Sprintf("%d.%d.%d.%d", sm[0], sm[1], sm[2], sm[3]),
		MAC:       mac,
		Gateway:   gateway,
		IsDhcp:    true,
	}
	out, err = utils.ExecSh(fmt.Sprintf(`nmcli dev show "%s" | grep "IP4.DNS" | head -n 1 | awk '{print $2}'`, nic))
	if err != nil {
		return nil, fmt.Errorf("reading network ip for NIC %s: %w %s", nic, err, out)
	}
	if out != "" {
		res.PreferredDns = strings.Trim(out, " \n")
	}
	out, err = utils.ExecSh(fmt.Sprintf(` nmcli --terse device show %s | grep GENERAL.CONNECTION`, nic))
	if err != nil {
		return nil, fmt.Errorf("reading connection name for NIC %s: %w %s", nic, err, out)
	}
	connectioName := strings.Trim(strings.Split(out, ":")[1], "\n")
	out, err = utils.ExecSh(fmt.Sprintf(`nmcli connection show "%s" | grep -i ipv4.method`, connectioName))
	if err != nil {
		return nil, fmt.Errorf("reading dhcp for  %s: %w %s", connectioName, err, out)
	}
	if strings.Contains(out, "manual") {
		res.IsDhcp = false
	}

	if !isWlan {
		out, err = utils.ExecSh(fmt.Sprintf(`nmcli dev show "%s" | grep "IP4.DNS" | awk 'NR==2 {print $2}'`, nic))
		if err != nil {
			return nil, fmt.Errorf("reading network ip for NIC %s: %w %s", nic, err, out)
		}
		if out != "" {
			res.AlternateDns = strings.Trim(out, " \n")
		}
	}

	return &res, nil
}
