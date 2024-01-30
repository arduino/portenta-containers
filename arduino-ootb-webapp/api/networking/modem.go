package networking

import (
	"encoding/csv"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/Wifx/gonetworkmanager/v2"
	"github.com/google/uuid"
	"github.com/maltegrosse/go-modemmanager"
)

const MODEM_MODEL = "QUECTEL Mobile Broadband Module"
const MODEM_DEVICE = "cdc-wdm0"

func GetModemConnection() (res *ModemConnection, err error) {
	res = &ModemConnection{}
	mm, err := modemmanager.NewModemManager()
	if err != nil {
		return nil, err
	}
	modems, err := mm.GetModems()
	if err != nil {
		return nil, err
	}
	if len(modems) == 0 {
		res.Connected = "Not connected"
		return res, nil
	}
	rssi := ""
	rsrq := ""
	for _, modem := range modems {
		manufacturer, _ := modem.GetModel()
		if manufacturer == MODEM_MODEL {
			res.SerialNumber, _ = modem.GetDeviceIdentifier()
			state, _ := modem.GetState()
			res.Connected = state.String()
			res.Carrier, _ = modem.GetModel()
			accessTecnology, _ := modem.GetAccessTechnologies()
			if len(accessTecnology) > 0 {
				res.AccessTechnology = accessTecnology[0].String()
			}
			location, _ := modem.GetLocation()
			locations, _ := location.GetCurrentLocation()
			res.LocationInfo, _ = getCountry(locations.ThreeGppLacCi.Mcc)
			signal, _ := modem.GetSignal()
			signal.Setup(1)
			sp, _ := signal.GetCurrentSignals()
			for _, s := range sp {
				rssi = fmt.Sprintf("%.2f", s.Rssi)
				rsrq = fmt.Sprintf("%.2f", s.Rsrq)
			}
		}
	}
	res.IP, err = getIp()
	if err != nil {
		return res, nil
	}

	err = res.getSignal(rssi, rsrq)
	if err != nil {
		return res, err
	}
	return res, nil
}

func ModemConnect(payload ModemConnectionPayload) error {
	settings, _ := gonetworkmanager.NewSettings()
	gsm := map[string]interface{}{
		"apn": payload.Apn,
	}
	if payload.Pin != nil {
		gsm["pin"] = *payload.Pin
	}
	if payload.Username != nil && payload.Password != nil {
		gsm["username"] = *payload.Username
		gsm["password"] = *payload.Password
	}
	conns, _ := settings.ListConnections()
	for _, c := range conns {
		connSetting, _ := c.GetSettings()
		if connSetting["connection"]["id"] == "wwan0" {
			err := c.Delete()
			if err != nil {
				return err
			}
		}
	}

	connectionUUID, err := uuid.NewUUID()
	if err != nil {
		return err
	}

	connection := make(map[string]map[string]interface{})
	connection["connection"] = make(map[string]interface{})
	connection["connection"]["id"] = "wwan0"
	connection["connection"]["type"] = "gsm"
	connection["connection"]["interface-name"] = MODEM_DEVICE
	connection["connection"]["autoconnect"] = true
	connection["connection"]["uuid"] = connectionUUID.String()

	connection["gsm"] = gsm

	_, err = settings.AddConnection(connection)
	if err != nil {
		return err
	}

	return nil
}
func getIp() (res string, err error) {
	nm, _ := gonetworkmanager.NewNetworkManager()
	devices, _ := nm.GetPropertyAllDevices()
	if devices != nil {
		for _, device := range devices {
			name, _ := device.GetPropertyInterface()
			if name == MODEM_DEVICE {
				ipConfig, _ := device.GetPropertyIP4Config()
				if ipConfig != nil {
					addresses, _ := ipConfig.GetPropertyAddressData()
					if len(addresses) > 0 {
						res = addresses[0].Address
					}
				}

			}
		}
	}

	return res, nil
}

func getCountry(mcc string) (country string, err error) {
	file, err := os.Open("./mcc-mnc.csv")
	if err != nil {
		return "", err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.Comma = ';'

	lines, err := reader.ReadAll()
	if err != nil {
		return "", err
	}
	for _, line := range lines {
		if line[0] == mcc {
			return line[4], nil
		}
	}
	return "", fmt.Errorf("mcc not found, mcc :%s", mcc)
}

func (m *ModemConnection) getSignal(rssi string, rsrq string) (err error) {
	if rssi != "" && rsrq != "" {
		m.RxPower = rssi
		qualityStr := strings.Trim(rsrq, "-")

		qualityNumber, err := strconv.ParseFloat(qualityStr, 64)
		if err != nil {
			return fmt.Errorf("converting signal quality: %w", err)
		}
		switch {
		case qualityNumber <= 10:
			m.Quality = "Excellent"
		case qualityNumber <= 15:
			m.Quality = "Good"
		case qualityNumber <= 20:
			m.Quality = "Bad"
		default:
			m.Quality = "No signal"
		}
	}
	if rssi != "" && rsrq == "" {
		m.RxPower = rssi

		qualityStr := strings.Trim(rssi, "-")

		qualityNumber, err := strconv.ParseFloat(qualityStr, 64)
		if err != nil {
			return fmt.Errorf("converting signal quality: %w", err)
		}
		switch {
		case qualityNumber <= 80:
			m.Quality = "Excellent"
		case qualityNumber <= 90:
			m.Quality = "Good"
		case qualityNumber <= 100:
			m.Quality = "Bad"
		default:
			m.Quality = "No signal"
		}
	}

	return nil
}
