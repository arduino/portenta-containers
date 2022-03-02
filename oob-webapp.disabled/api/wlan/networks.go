package wlan

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"log"
	"regexp"
	"strconv"
	"strings"

	utils "x8-oob/utils"
)

type Network struct {
	SSID     string `json:"ssid"`
	Signal   int    `json:"signal"`
	Security string `json:"security"`
}

type Connection struct {
	Connected bool   `json:"connected"`
	Network   string `json:"network"`
	IP        string `json:"ip"`
	MAC       string `json:"mac"`
	Gateway   string `json:"gateway"`
}

var NetworkConnectionFailed = errors.New("cannot connect wifi networ")

func Networks() ([]Network, error) {
	out, err := utils.ExecSh("nmcli --fields SSID,SIGNAL,SECURITY --colors no --terse device wifi list --rescan yes")
	if err != nil {
		return nil, fmt.Errorf("searching networks: %w", err)
	}

	r := csv.NewReader(strings.NewReader(out))
	r.Comma = ':'

	networks := []Network{}
	m := make(map[string]Network)

	for {
		record, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatal(err)
		}

		signal, err := strconv.ParseInt(record[1], 10, 8)
		if err != nil {
			return nil, fmt.Errorf("parsing network signal: %w", err)
		}

		m[record[0]] = Network{
			SSID:     record[0],
			Signal:   int(signal),
			Security: record[2],
		}
	}

	for _, v := range m {
		networks = append(networks, Network{
			SSID:     v.SSID,
			Signal:   v.Signal,
			Security: v.Security,
		})
	}

	return networks, nil
}

func Connect(ssid string, password string) error {
	out, err := utils.ExecSh(fmt.Sprintf("nmcli dev wifi connect \"%s\" password \"%s\"", ssid, password))
	if err != nil {
		return fmt.Errorf("connecting network \"%s\": %w", ssid, NetworkConnectionFailed)
	}

	var re = regexp.MustCompile(`(?m) successfully activated with '[a-z0-9-]*'\.`)
	m := re.FindAllString(out, -1)
	if len(m) > 0 {
		return nil
	}

	return fmt.Errorf("connecting network \"%s\": unknown error", ssid)
}

func GetConnection() (*Connection, error) {
	out, err := utils.ExecSh("nmcli --terse c show --active | grep 802-11-wireless || true")
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
