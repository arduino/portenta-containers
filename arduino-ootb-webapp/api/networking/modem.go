package networking

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
	utils "x8-ootb/utils"

	log "github.com/inconshreveable/log15"
)

func GetModemConnection() (res *ModemConnection, err error) {
	res = &ModemConnection{
		Connected: true,
	}
	isPresent, err := verifyModemConnection()
	if err != nil {
		log.Warn("cannot not connected", "err", err)
	}
	if !isPresent {
		res.Connected = false
		return res, nil
	}
	res.IP, err = getIp()
	if err != nil {
		res.Connected = false
		return res, nil
	}
	err = res.getInfo()
	if err != nil {
		log.Warn("cannot fetch modem info", "err", err)
		return res, err
	}
	err = res.getSignal()
	if err != nil {
		log.Warn("cannot fetch signals", "err", err)
		return res, err
	}
	return res, nil
}

func ModemConnect(payload ModemConnectionPayload) error {
	params := ""
	if payload.Pin != nil {
		params = fmt.Sprintf("gsm.pin %s", *payload.Pin)
	}
	if payload.Username != nil && payload.Password != nil {
		//FIXME
		params = fmt.Sprintf("gsm.pin %s", *payload.Pin)
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
		return "", fmt.Errorf("cannot connect to the modem")
	}
	res = strings.Split(out, "/")[0]
	return res, nil
}
func verifyModemConnection() (isPresent bool, err error) {
	out, err := utils.ExecSh(`mmcli -L | grep "QUECTEL" || echo "not present"`)
	if err != nil {
		return false, fmt.Errorf("cannot feth ip from modem: %w %s", err, out)
	}
	if strings.Trim(out, "\n") == "not present" {
		return false, nil
	}
	return true, nil
}

func (m *ModemConnection) getInfo() (err error) {
	out, err := utils.ExecSh(`mmcli -m 0 --output-json`)
	if err != nil {
		return fmt.Errorf("cannot feth signal from modem: %w %s", err, out)
	}
	jsonData := MmcliParser{}
	err = json.Unmarshal([]byte(out), &jsonData)
	if err != nil {
		return fmt.Errorf("cannot unmarshal json: %w", err)
	}
	if jsonData.Modem.Generic.State == "failed" {
		m.Connected = false
		return nil
	}
	if len(jsonData.Modem.Generic.AccessTechnologies) > 0 {
		m.AccessTecnlogy = jsonData.Modem.Generic.AccessTechnologies[0]
	}
	m.Carrier = jsonData.Modem.Gpp.OperatorName
	m.SerialNumber = jsonData.Modem.Generic.DeviceIdentifier
	if jsonData.Modem.Gpp.OperatorCode != "--" {
		m.LocationInfo, err = getCountry(jsonData.Modem.Gpp.OperatorCode[:3])
		if err != nil {
			return err
		}
	}
	return nil
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

func (m *ModemConnection) getSignal() (err error) {
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
