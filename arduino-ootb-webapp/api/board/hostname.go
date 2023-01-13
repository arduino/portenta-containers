package board

import (
	"fmt"
	"strings"
	"x8-ootb/utils"
)

func ReadHostname() (string, error) {
	// @TODO: here we can use usb0 ip which is known, however
	// this imply board is connected through usb to user's Pc
	out, err := utils.ExecSh("avahi-resolve -a 192.168.7.1 | cut -f 2 | awk -F \".\" '{print $1}'")
	if err != nil {
		return "", fmt.Errorf("reading avahi hostname: %w", err)
	}

	return strings.Replace(out, "\n", "", 1), err
}

func UpdateHostname(hostname string) (string, error) {
	// @TODO: this is not persistent accross daemon restarts. To make it persistent
	// need to add host-name= to /etc/avahi/avahi-daemon.conf
	_, err := utils.ExecSh(fmt.Sprintf("avahi-set-host-name %s", hostname))
	if err != nil {
		return "", fmt.Errorf("updating avahi hostname: %w", err)
	}

	return ReadHostname()
}
