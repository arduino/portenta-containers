package factory

import (
	"errors"
	"fmt"
	"os"
	"regexp"
	"x8-oob/utils"

	log "github.com/inconshreveable/log15"
)

type FactoryNameInfo struct {
	DeviceName string `json:"deviceName"`
	UserCode   string `json:"userCode"`
	BrowserURL string `json:"browserURL"`
}

var NameNotFoundError = errors.New("Factory name not found")

func ReadName() (*FactoryNameInfo, error) {
	info := FactoryNameInfo{}

	// Read it from env (does it work?)
	// out, err := utils.ExecSh("echo $DEVICE_FACTORY")
	// if err != nil {
	// 	return nil, fmt.Errorf("reading Factory name: %w", err)
	// }
	// info.DeviceName = strings.Replace(out, "\n", "", 1)

	name, err := os.ReadFile("X8_OBB_FACTORY_NAME")
	if err != nil {
		return nil, fmt.Errorf("reading factory name from file: %w", NameNotFoundError)
	}

	info.DeviceName = string(name)

	return &info, nil
}

func CreateName(name string) (*FactoryNameInfo, error) {
	info := FactoryNameInfo{
		DeviceName: name,
	}

	out, err := utils.ExecSh(fmt.Sprintf("/bin/lmp-device-register -n \"%s\"", name))
	if err != nil {
		return nil, fmt.Errorf("registering factory name \"%s\" via lmp-device-register: %w", name, err)
	}

	log.Debug("Registering factory name", "name", name, "out", out)

	var re = regexp.MustCompile(`(?m)User code: ([a-zA-Z0-9-]*)`)
	m := re.FindAllStringSubmatch(out, -1)
	if len(m) == 0 || len(m[0]) != 2 {
		return nil, fmt.Errorf("parsing lmp-device-register output")
	}
	info.UserCode = m[0][1]

	re = regexp.MustCompile(`(?m)Browser URL: ([a-zA-Z0-9-:\/\._]*)`)
	m = re.FindAllStringSubmatch(out, -1)
	if len(m) == 0 || len(m[0]) != 2 {
		return nil, fmt.Errorf("parsing lmp-device-register output")
	}
	info.BrowserURL = m[0][1]

	// Write the name on file, in order to read it later
	err = os.WriteFile("X8_OBB_FACTORY_NAME", []byte(name), 0600)
	if err != nil {
		return nil, fmt.Errorf("writing factory name file: %w", err)
	}

	return &info, nil

}
