package networking

import (
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"regexp"
	"strings"

	utils "x8-oob/utils"
)

func GetConnection(grep string) (*Connection, error) {
	out, err := utils.ExecSh(fmt.Sprintf("nmcli --terse c show --active | grep %s || true", grep))
	if err != nil {
		return nil, fmt.Errorf("reading all network connections via nmcli: %w", err)
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
			log.Fatal(err)
		}

		net = record[0]
		nic = record[3]
	}

	fmt.Printf("ip -4 -br address | grep %s\n", nic)
	out, err = utils.ExecSh(fmt.Sprintf("ip -o -f inet addr | grep %s", nic))
	if err != nil {
		return nil, fmt.Errorf("reading network ip for NIC %s: %w", nic, err)
	}
	fmt.Println(out)

	var re = regexp.MustCompile(`(?m)inet ((([0-9]{1,3}.){4})\/[0-9]{1,3}) `)
	match := re.FindAllStringSubmatch(out, -1)

	ip := match[0][1]

	out, err = utils.ExecSh(fmt.Sprintf("ip -o -f inet route | grep default | grep %s", nic))
	if err != nil {
		return nil, fmt.Errorf("reading network route: %w", err)
	}

	re = regexp.MustCompile(`(?m)(via (([0-9]{1,3}.){4}))`)
	match = re.FindAllStringSubmatch(out, -1)

	gateway := match[0][2]

	out, err = utils.ExecSh(fmt.Sprintf("ip -o -f inet link | grep %s", nic))
	if err != nil {
		return nil, fmt.Errorf("reading network link: %w", err)
	}

	re = regexp.MustCompile(`(?m)link\/ether (([a-f0-9]{2}\:?){5}[a-f0-9]{2})`)
	match = re.FindAllStringSubmatch(out, -1)

	mac := match[0][1]

	res := Connection{
		Connected: true,
		Network:   net,
		IP:        ip,
		MAC:       mac,
		Gateway:   gateway,
	}

	return &res, nil
}
