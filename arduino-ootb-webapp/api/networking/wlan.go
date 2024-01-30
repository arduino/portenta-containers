package networking

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"log"
	"strconv"
	"strings"

	utils "x8-ootb/utils"

	"github.com/Wifx/gonetworkmanager/v2"
	"github.com/google/uuid"
)

var NetworkConnectionFailed = errors.New("cannot connect wifi network")

const WLAN_INTERFACE_NAME = "wlan0"

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
	settings, err := gonetworkmanager.NewSettings()
	if err != nil {
		return err
	}

	err = utils.DeleteConnectionByInterfaceName(WLAN_INTERFACE_NAME)
	if err != nil {
		return err
	}

	connection := make(map[string]map[string]interface{})

	connection["802-11-wireless"] = make(map[string]interface{})
	connection["802-11-wireless"]["auto-negotiate"] = false
	connection["802-11-wireless"]["ssid"] = ssid
	connection["connection"] = make(map[string]interface{})
	connection["connection"]["id"] = ssid
	connection["connection"]["type"] = "802-11-wireless"
	connectionUUID, err := uuid.NewUUID()
	if err != nil {
		return err
	}
	connection["connection"]["uuid"] = connectionUUID.String()
	connection["connection"]["interface-name"] = WLAN_INTERFACE_NAME
	connection["connection"]["autoconnect"] = true
	settings.AddConnection(connection)

	/* out, err := utils.ExecSh(`nmcli --terse connection show |
	 grep 802-11-wireless |
	 cut -d : -f 1 |
	 while read name;
	 do echo nmcli connection delete
	 \"$name\"; done`)
	if err != nil {
		return fmt.Errorf("deleting existing wifi connections: %w %s", err, out)
	}

	out, err = utils.ExecSh(fmt.Sprintf("nmcli dev wifi connect \"%s\" password \"%s\"", ssid, password))
	if err != nil {
		return fmt.Errorf("connecting network \"%s\": %w", ssid, NetworkConnectionFailed)
	}

	var re = regexp.MustCompile(`(?m) successfully activated with '[a-z0-9-]*'\.`)
	m := re.FindAllString(out, -1)
	if len(m) == 0 {
		return fmt.Errorf("connecting network \"%s\": unknown error", ssid)
	} */

	return nil
}

func GetWlanConnection() (*Connection, error) {
	return GetConnection(true, false)
}
