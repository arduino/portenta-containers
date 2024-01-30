package networking

import (
	"fmt"
	"strings"
	utils "x8-ootb/utils"

	log "github.com/inconshreveable/log15"
)

func GetModemConnection() (res *ModemConnection, err error) {
	res = &ModemConnection{
		Connected: true,
	}
	res.IP, err = getIp()
	if err != nil {
		res.Connected = false
		log.Warn("cannot fetch modem ip", "err", err)
	}
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
func getIp() (res string, err error) {
	out, err := utils.ExecSh(`nmcli c show wwan0  | grep "IP4.ADDRESS" |  awk '{print $2}'`)
	if err != nil {
		return "", fmt.Errorf("cannot feth signal from modem: %w %s", err, out)
	}
	if out == "" {
		return "", fmt.Errorf("cannot connect to the modem")
	}
	res = strings.Split(out, "/")[0]
	return res, nil
}
