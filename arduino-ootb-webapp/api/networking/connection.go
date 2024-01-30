package networking

import (
	"encoding/csv"
	"fmt"
	"io"
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

	var net string
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
		net = record[0]
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
	ip := match[0][1]

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

	out, err = utils.ExecSh(fmt.Sprintf(`nmcli dev show "%s" | grep "IP4.DNS"`, nic))
	if err != nil {
		return nil, fmt.Errorf("reading network ip for NIC %s: %w %s", nic, err, out)
	}
	lines := strings.Split(out, "\n")

	res := Connection{
		Connected:    true,
		Network:      net,
		IP:           ip,
		MAC:          mac,
		Gateway:      gateway,
		PreferredDns: strings.TrimSpace(strings.Split(lines[0], ":")[1]),
		AlternateDns: strings.TrimSpace(strings.Split(lines[1], ":")[1]),
	}

	return &res, nil
}
