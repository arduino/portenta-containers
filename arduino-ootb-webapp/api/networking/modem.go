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
	m.SignalStrength = jsonData.Modem.Generic.SignalQuality.Value
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
	if jsonData.SignalModem.Signal.Lte.RSSI != "--" {
		m.RxPower = jsonData.SignalModem.Signal.Lte.RSSI
	}
	if jsonData.SignalModem.Signal.Lte.RSRQ != "--" {
		qualityStr := strings.Trim(jsonData.SignalModem.Signal.Lte.RSRQ, "-")

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

	return nil
}
