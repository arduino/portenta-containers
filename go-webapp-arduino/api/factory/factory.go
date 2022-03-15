package factory

import (
	"encoding/json"
	"errors"
	"fmt"
	rand "math/rand"
	"os"
	"regexp"
	"time"
	"x8-ootb/utils"

	log "github.com/inconshreveable/log15"
)

type FactoryNameInfo struct {
	RegistrationComplete    bool   `json:"registrationComplete"`
	UserCodeExpiryTimestamp string `json:"userCodeExpiryTimestamp"`
	FactoryName             string `json:"factoryName"`
	UserCode                string `json:"userCode"`
	BrowserURL              string `json:"browserURL"`
}

var NameNotFoundError = errors.New("Factory name not found")

var jsonFile = "x8ObbFactoryName.json"

func ReadName() (*FactoryNameInfo, error) {
	info := FactoryNameInfo{}

	// FIXME:
	// Read it from env (does it work?)
	// out, err := utils.ExecSh("echo $DEVICE_FACTORY")
	// if err != nil {
	// 	return nil, fmt.Errorf("reading Factory name: %w", err)
	// }
	// info.FactoryName = strings.Replace(out, "\n", "", 1)

	res, err := os.ReadFile(jsonFile)
	if err != nil {
		return nil, fmt.Errorf("reading factory name from file: %w", NameNotFoundError)
	}

	err = json.Unmarshal(res, &info)
	if err != nil {
		return nil, fmt.Errorf("unmashalling json file: %w", err)
	}

	// FIXME:
	if rand.Intn(2) > 0 {
		info.RegistrationComplete = true
	} else {
		info.RegistrationComplete = false
	}

	return &info, nil
}

func CreateName(name string) (*FactoryNameInfo, error) {
	info := FactoryNameInfo{
		FactoryName:          name,
		RegistrationComplete: false,
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

	info.UserCodeExpiryTimestamp = time.Now().Add(time.Minute * 15).Format(time.RFC3339)

	res, err := json.Marshal(info)
	if err != nil {
		return nil, fmt.Errorf("writing json file")
	}

	// Write the info to a json file, in order to read it later
	err = os.WriteFile(jsonFile, res, 0600)
	if err != nil {
		return nil, fmt.Errorf("writing factory name file: %w", err)
	}

	return &info, nil
}
