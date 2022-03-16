package factory

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"time"

	log "github.com/inconshreveable/log15"
)

type FactoryNameInfo struct {
	RegistrationComplete    bool   `json:"registrationComplete"`
	UserCodeExpiryTimestamp string `json:"userCodeExpiryTimestamp"`
	FactoryName             string `json:"factoryName"`
	UserCode                string `json:"userCode"`
	BrowserURL              string `json:"browserURL"`
}

type CreateNameCb func(err error, info *FactoryNameInfo)

type CreateNameResult struct {
	Err  error
	Info *FactoryNameInfo
}

var NameNotFoundError = errors.New("Factory name not found")

var jsonFile = "x8ObbFactoryName.json"

func ReadName() (*FactoryNameInfo, error) {
	info := FactoryNameInfo{}

	res, err := os.ReadFile(jsonFile)
	if err != nil {
		return nil, fmt.Errorf("reading factory name from file: %w", NameNotFoundError)
	}

	err = json.Unmarshal(res, &info)
	if err != nil {
		return nil, fmt.Errorf("unmashalling json file: %w", err)
	}

	return &info, nil
}

func CreateName(name string, ch chan CreateNameResult) {
	info := FactoryNameInfo{
		FactoryName:          name,
		RegistrationComplete: false,
	}

	opts := DeviceCreateOpts{
		Factory:       name,
		OtaTag:        "master",
		IsProd:        true,
		HardwareId:    "intel",
		SotaConfigDir: "/var/sota",
	}

	prompt := func(verificationUri, userCode string) {
		log.Debug("Registering factory name", "verificationUri", verificationUri, "userCode", userCode)

		info.UserCode = userCode
		info.BrowserURL = verificationUri

		info.UserCodeExpiryTimestamp = time.Now().Add(time.Minute * 15).Format(time.RFC3339)

		res, err := json.Marshal(info)
		if err != nil {
			ch <- CreateNameResult{
				Err: fmt.Errorf("marshalling json file"),
			}

			return
		}

		// Write the info to a json file, in order to read it later
		err = os.WriteFile(jsonFile, res, 0600)
		if err != nil {
			ch <- CreateNameResult{
				Err: fmt.Errorf("writing factory name file: %w", err),
			}
			return
		}

		ch <- CreateNameResult{
			Info: &info,
		}
	}

	// NewFioDevice keeps running checking if the device hs been effectively registered
	go func() {
		_ = NewFioDevice(opts, prompt)

		info := FactoryNameInfo{
			FactoryName:          name,
			RegistrationComplete: true,
		}

		res, err := json.Marshal(info)
		if err != nil {
			log.Error("marshalling json file", "err", err)
			return
		}

		err = os.WriteFile(jsonFile, res, 0600)
		if err != nil {
			log.Error("writing factory name file", "err", err)
		}
	}()
}
