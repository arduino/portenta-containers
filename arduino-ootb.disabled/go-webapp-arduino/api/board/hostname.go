package board

import (
	"fmt"
	"strings"
	"x8-oob/utils"
)

func ReadHostname() (string, error) {
	// @TODO: we need to know our ip address for this command to work
	// out, err := utils.ExecSh("avahi-resolve -a 192.168.1.198 | cut -f 2")
	out, err := utils.ExecSh("hostname")
	if err != nil {
		return "", fmt.Errorf("getting avahi hostname: %w", err)
	}

	return strings.Replace(out, "\n", "", 1), err
}

func UpdateHostname(hostname string) (string, error) {
	_, err := utils.ExecSh(fmt.Sprintf("avahi-set-host-name %s", hostname))
	if err != nil {
		return "", fmt.Errorf("updating avahi hostname: %w", err)
	}

	return ReadHostname()
}
