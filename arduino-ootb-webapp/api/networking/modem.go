package networking

import (
	"encoding/csv"
	"fmt"
	"os"
	"strings"
	"time"
	utils "x8-ootb/utils"

	"github.com/maltegrosse/go-modemmanager"
)

const MODEL_NAME = "QUECTEL Mobile Broadband Module"

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

	for _, modem := range modems {
		manufacturer, _ := modem.GetModel()
		if manufacturer == MODEL_NAME {
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
			sp, _ := signal.GetCurrentSignals()
			for _, s := range sp {
				res.RxPower += s.Rssi
			}
			res.Quality, _, _ = modem.GetSignalQuality()
		}
	}
	res.IP, err = getIp()
	if err != nil {
		return res, nil
	}

	/* err = res.getSignal()
	if err != nil {
		log.Warn("cannot fetch signals", "err", err)
		return res, err
	} */
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
	out, err := utils.ExecSh(`nmcli c show wwan0  | grep "IP4.ADDRESS" |  awk '{print $2}'`)
	if err != nil {
		return "", fmt.Errorf("cannot feth ip from modem: %w %s", err, out)
	}
	if out == "" {
		return "", nil
	}
	res = strings.Split(out, "/")[0]
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

type Interval struct {
	Start int
	End   int
}

/* func (m *ModemConnection) getSignal() (err error) {
	out, err := utils.ExecSh(`mmcli -m 0 --signal-get --output-json`)
	if err != nil {
		return fmt.Errorf("cannot feth signal data from modem: %w %s", err, out)
	}
	jsonData := MmcliSignalParser{}
	err = json.Unmarshal([]byte(out), &jsonData)
	if err != nil {
		return fmt.Errorf("cannot unmarshal json: %w", err)
	}
	if jsonData.SignalModem.Signal.RefreshSignal.Rate == "0" {
		out, err := utils.ExecSh(`mmcli -m 0 --signal-setup=1`)
		if err != nil {
			return fmt.Errorf("cannot set signl refresh rate modem: %w %s", err, out)
		}
		time.Sleep(1 * time.Second)
		return m.getSignal()

	}
	rssi := ""
	rsrq := ""

	if jsonData.SignalModem.Signal.Conn5g.RSSI != nil && *jsonData.SignalModem.Signal.Conn5g.RSSI != "--" {
		rssi = *jsonData.SignalModem.Signal.Conn5g.RSSI
		rsrq = *jsonData.SignalModem.Signal.Conn5g.RSRQ
	}
	if jsonData.SignalModem.Signal.Cdma1x.RSSI != nil && *jsonData.SignalModem.Signal.Cdma1x.RSSI != "--" {
		rssi = *jsonData.SignalModem.Signal.Cdma1x.RSSI
		rsrq = *jsonData.SignalModem.Signal.Cdma1x.RSRQ
	}
	if jsonData.SignalModem.Signal.Evdo.RSSI != nil && *jsonData.SignalModem.Signal.Evdo.RSSI != "--" {
		rssi = *jsonData.SignalModem.Signal.Evdo.RSSI
		rsrq = *jsonData.SignalModem.Signal.Evdo.RSRQ
	}
	if jsonData.SignalModem.Signal.Gsm.RSSI != nil && *jsonData.SignalModem.Signal.Gsm.RSSI != "--" {
		rssi = *jsonData.SignalModem.Signal.Gsm.RSSI
		rsrq = *jsonData.SignalModem.Signal.Gsm.RSRQ
	}
	if jsonData.SignalModem.Signal.Lte.RSSI != nil && *jsonData.SignalModem.Signal.Lte.RSSI != "--" {
		rssi = *jsonData.SignalModem.Signal.Lte.RSSI
		rsrq = *jsonData.SignalModem.Signal.Lte.RSRQ
	}
	if jsonData.SignalModem.Signal.Umts.RSSI != nil && *jsonData.SignalModem.Signal.Umts.RSSI != "--" {
		rssi = *jsonData.SignalModem.Signal.Umts.RSSI
		rsrq = *jsonData.SignalModem.Signal.Umts.RSRQ
	}
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
*/
