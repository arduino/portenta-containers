package networking

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"log"
	"regexp"
	"strconv"
	"strings"

	utils "x8-ootb/utils"
)

var NetworkConnectionFailed = errors.New("cannot connect wifi network")

func WlanNetworks() ([]Network, error) {
	out, err := utils.ExecSh("nmcli --fields SSID,SIGNAL,SECURITY,BSSID --colors no --terse device wifi list --rescan yes")
	if err != nil {
		return nil, fmt.Errorf("searching networks: %w", err)
	}

	out = strings.ReplaceAll(out, "\\:", "--")

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
			BSSID:    record[3],
			Signal:   int(signal),
			Security: record[2],
		}
	}

	for _, v := range m {
		networks = append(networks, Network{
			SSID:     v.SSID,
			BSSID:    strings.ReplaceAll(v.BSSID, "--", ":"),
			Signal:   v.Signal,
			Security: v.Security,
		})
	}

	return networks, nil
}

func WlanConnect(ssid string, password string) error {
	out, err := utils.ExecSh("nmcli --terse connection show | grep 802-11-wireless | cut -d : -f 1 | while read name; do echo nmcli connection delete \"$name\"; done")
	if err != nil {
		return fmt.Errorf("deleting existing wifi connections: %w %s", err, out)
	}

	out, err = utils.ExecSh(fmt.Sprintf("nmcli dev wifi connect \"%s\" password \"%s\"", ssid, password))
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

func GetWlanConnection() (*Connection, error) {
	return GetConnection("802-11-wireless")
}
