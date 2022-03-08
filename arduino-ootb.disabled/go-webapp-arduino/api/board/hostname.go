package board

import (
	"fmt"
	"strings"
	"x8-oob/utils"
)

func ReadHostname() (string, error) {
	out, err := utils.ExecSh("hostname")
	if err != nil {
		return "", fmt.Errorf("reading Factory name: %w", err)
	}

	return strings.Replace(out, "\n", "", 1), err
}

func UpdateHostname(hostname string) (string, error) {
	_, err := utils.ExecSh(fmt.Sprintf("hostname %s", hostname))
	if err != nil {
		return "", fmt.Errorf("reading Factory name: %w", err)
	}

	return ReadHostname()
}
