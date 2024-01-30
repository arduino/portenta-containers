package networking

import (
	"encoding/csv"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
	utils "x8-ootb/utils"

	"github.com/Wifx/gonetworkmanager/v2"
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
	rssi := ""
	rsrq := ""
	for _, modem := range modems {
		manufacturer, _ := modem.GetModel()
		if manufacturer == MODEM_MODEL {
			res.SerialNumber, _ = modem.GetDeviceIdentifier()
			state, _ := modem.GetState()
			res.Connected = state.String()
			res.Carrier, _ = modem.GetModel()
			accessTecnlogy, _ := modem.GetAccessTechnologies()
			if len(accessTecnlogy) > 0 {
				res.AccessTecnlogy = accessTecnlogy[0].String()
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
	utils.ExecSh("nmcli c delete wwan0")
	time.Sleep(3 * time.Second)
	params := ""
	if payload.Pin != nil {
		params += fmt.Sprintf("pin %s", *payload.Pin)
	}
	if payload.Username != nil && payload.Password != nil {
		params += fmt.Sprintf("username %s password %s ", *payload.Username, *payload.Password)
	}
	out, err := utils.ExecSh(fmt.Sprintf(`nmcli c add type gsm ifname cdc-wdm0 con-name wwan0 apn "%s" %s`, payload.Apn, params))
	if err != nil {
		return fmt.Errorf("connecting to modem: %w %s", err, out)
	}

	return nil
}
func getIp() (res string, err error) {
	nm, _ := gonetworkmanager.NewNetworkManager()
	devices, _ := nm.GetPropertyAllDevices()
	for _, device := range devices {
		name, _ := device.GetPropertyInterface()
		if name == MODEM_DEVICE {
			ipConfig, _ := device.GetPropertyIP4Config()
			addresses, _ := ipConfig.GetPropertyAddressData()
			if len(addresses) > 0 {
				res = addresses[0].Address
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
