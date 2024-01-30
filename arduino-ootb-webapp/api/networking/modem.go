package networking

import (
	"fmt"
	utils "x8-ootb/utils"
)

func GetModemConnection() (*ModemConnection, error) {
	res := &ModemConnection{}
	//Signal Strength
	out, err := utils.ExecSh(`mmcli -m 0 --signal`)
	if err != nil {
		return nil, fmt.Errorf("cannot feth signal from modem: %w %s", err, out)
	}
	res.SignalStrength = out
	//Location
	out, err = utils.ExecSh(`mmcli -m 0 --location-status`)
	if err != nil {
		return nil, fmt.Errorf("cannot feth location from modem: %w %s", err, out)
	}
	res.LocationInfo = out
	return res, nil
}

func ModemConnect(payload ModemConnectionPayload) error {
	if payload.Pin != nil {
		out, err := utils.ExecSh(fmt.Sprintf(`mmcli -m 0 --pin=%s `, *payload.Pin))
		if err != nil {
			return fmt.Errorf("cannot unlock sim: %w %s", err, out)
		}
	}
	out, err := utils.ExecSh(fmt.Sprintf(`nmcli c add type gsm ifname cdc-wdm0 con-name wwan0 apn "%s" `, payload.Apn))
	if err != nil {
		return fmt.Errorf("connecting to modem: %w %s", err, out)
	}

	return nil
}
