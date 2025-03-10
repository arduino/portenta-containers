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
	"github.com/google/uuid"
	"github.com/maltegrosse/go-modemmanager"
)

const MODEM_MODEL = "QUECTEL Mobile Broadband Module"
const MODEM_MODEL_EU = "EC200A"
const MODEM_INTERFACE_NAME = "cdc-wdm0"
const MODEM_INTERFACE_NAME_EU = "usb0"

func GetModemConnection() (res *ModemConnection, err error) {
	res = &ModemConnection{}
	modem, _, err := GetModem()
	if err != nil {
		return nil, fmt.Errorf("modem not found: %w", err)
	}
	if modem == nil {
		res.State = "No Modem Found"
		return res, nil
	}
	rssi := ""
	rsrq := ""
	res.SerialNumber, _ = modem.GetDeviceIdentifier()
	state, _ := modem.GetState()
	res.State = state.String()
	res.Carrier, _ = modem.GetModel()
	//unlock retries
	unlockRetries, _ := modem.GetUnlockRetries()
	for _, x := range unlockRetries {
		if x.GetLeft().(modemmanager.MMModemLock).String() == "SimPin" {
			res.UnlockRetries = x.GetRight().(uint32)
		}
	}
	//operator name
	accessTechnology, _ := modem.GetAccessTechnologies()
	if len(accessTechnology) > 0 {
		res.AccessTechnology = accessTechnology[0].String()
	}
	location, _ := modem.GetLocation()
	locations, _ := location.GetCurrentLocation()
	res.LocationInfo, res.OperatorName, _ = getCountry(locations.ThreeGppLacCi.Mcc, locations.ThreeGppLacCi.Mnc)
	signal, _ := modem.GetSignal()
	signal.Setup(1)
	sp, _ := signal.GetCurrentSignals()
	for _, s := range sp {
		rssi = fmt.Sprintf("%.2f", s.Rssi)
		rsrq = fmt.Sprintf("%.2f", s.Rsrq)
	}
	//Properties
	bearers, _ := modem.GetBearers()
	for _, b := range bearers {
		properties, err := b.GetProperties()
		if err != nil {
			continue
		}
		//APN
		res.Apn = properties.APN
		//User
		res.User = properties.User
		//Password
		res.Password = properties.Password
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
	modem, manufacturer, err := GetModem()
	if err != nil {
		return fmt.Errorf("cannot get modem: %w", err)
	}
	if modem == nil {
		return fmt.Errorf("no Modem Found")
	}
	err = utils.DeleteConnectionByInterfaceName(MODEM_INTERFACE_NAME)
	if err != nil {
		return fmt.Errorf("cannot delete connection: %w", err)
	}
	err = utils.DeleteConnectionByInterfaceName(MODEM_INTERFACE_NAME_EU)
	if err != nil {
		return fmt.Errorf("cannot delete EU connection: %w", err)
	}
	time.Sleep(1 * time.Second)
	settings, err := gonetworkmanager.NewSettings()
	if err != nil {
		return fmt.Errorf("new connection setting: %w", err)
	}
	gsm := map[string]interface{}{
		"apn": payload.Apn,
	}
	simpleProperties := modemmanager.SimpleProperties{
		Apn: payload.Apn,
	}
	if payload.Pin != nil {
		gsm["pin"] = *payload.Pin
		simpleProperties.Pin = *payload.Pin
	}
	if payload.Username != nil && payload.Password != nil {
		gsm["username"] = *payload.Username
		gsm["password"] = *payload.Password
		simpleProperties.User = *payload.Username
		simpleProperties.Password = *payload.Password
	}

	//For EU modem we can use just a simple connect
	if manufacturer == MODEM_MODEL_EU {
		modemSimple, err := modem.GetSimpleModem()
		if err != nil {
			return fmt.Errorf("get simple connect: %w", err)
		}
		_, err = modemSimple.Connect(simpleProperties)
		if err != nil {
			return fmt.Errorf("modem simple connect: %w", err)
		}
		return nil
	}

	connectionUUID, err := uuid.NewUUID()
	if err != nil {
		return fmt.Errorf("cannot create new uuid: %w", err)
	}
	connection := make(map[string]map[string]interface{})
	coonnectionType := ""
	interfaceName := ""
	coonnectionId := ""
	coonnectionId = "wwan0"
	coonnectionType = "gsm"
	interfaceName = MODEM_INTERFACE_NAME
	connection["gsm"] = gsm
	connection["connection"] = make(map[string]interface{})
	connection["connection"]["id"] = coonnectionId
	connection["connection"]["type"] = coonnectionType
	connection["connection"]["interface-name"] = interfaceName
	connection["connection"]["autoconnect"] = true
	connection["connection"]["uuid"] = connectionUUID.String()

	_, err = settings.AddConnection(connection)
	if err != nil {
		return fmt.Errorf("network manager: cannot add connection %w", err)
	}
	return nil
}
func getIp() (res string, err error) {
	nm, _ := gonetworkmanager.NewNetworkManager()
	devices, _ := nm.GetPropertyAllDevices()
	for _, device := range devices {
		name, _ := device.GetPropertyInterface()
		if name == MODEM_INTERFACE_NAME || name == MODEM_INTERFACE_NAME_EU {
			ipConfig, _ := device.GetPropertyIP4Config()
			if ipConfig != nil {
				addresses, _ := ipConfig.GetPropertyAddressData()
				if len(addresses) > 0 {
					res = addresses[0].Address
				}
			}
		}
	}

	return res, nil
}

func getCountry(mcc string, mnc string) (country string, operatorName string, err error) {
	file, err := os.Open("./mcc-mnc.csv")
	if err != nil {
		return "", "", err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.Comma = ';'

	lines, err := reader.ReadAll()
	if err != nil {
		return "", "", err
	}
	for _, line := range lines {
		if line[0] == mcc && line[1] == mnc {
			return line[4], line[7], nil
		}
	}
	return "", "", fmt.Errorf("mcc not found, mcc :%s", mcc)
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

func GetModem() (res modemmanager.Modem, manufacturer string, err error) {
	mm, err := modemmanager.NewModemManager()
	if err != nil {
		return nil, "", err
	}
	modems, err := mm.GetModems()
	if err != nil {
		return nil, "", err
	}
	if len(modems) == 0 {
		return nil, "", nil
	}
	for _, modem := range modems {
		manufacturer, _ := modem.GetModel()
		if manufacturer == MODEM_MODEL || manufacturer == MODEM_MODEL_EU {
			return modem, manufacturer, nil
		}
	}
	return nil, "", nil
}
