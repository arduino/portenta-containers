package factory

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
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

type CreateNameCb func(err error, info *FactoryNameInfo)

type CreateNameResult struct {
	Err  error
	Info *FactoryNameInfo
}

var NameNotFoundError = errors.New("Factory name not found")

var jsonFile = "x8ObbFactoryName.json"

const DefaultOtaTag = "experimental"
const DefaultHardwareId = "portenta-x8"

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

func CreateName(factoryName string, boardName string, ch chan CreateNameResult) {
	info := FactoryNameInfo{
		FactoryName:          factoryName,
		RegistrationComplete: false,
	}

	otaTag := os.Getenv("FACTORY_OTA_TAG")
	if otaTag == "" {
		log.Warn("env variable FACTORY_OTA_TAG is empty, using default", "default", DefaultOtaTag)
		otaTag = DefaultOtaTag
	}

	hardwareId := os.Getenv("FACTORY_HARDWARE_ID")
	if hardwareId == "" {
		log.Warn("env variable FACTORY_HARDWARE_ID is empty, using default", "default", DefaultHardwareId)
		hardwareId = DefaultHardwareId
	}

	opts := DeviceCreateOpts{
		Name:          boardName,
		Factory:       factoryName,
		OtaTag:        otaTag,
		IsProd:        false,
		HardwareId:    hardwareId,
		SotaConfigDir: "/var/sota",
	}

	prompt := func(verificationUri, userCode string) {
		log.Debug("Registering factory name", "verificationUri", verificationUri, "userCode", userCode)

		err := os.Remove(jsonFile)
		if err != nil {
			log.Warn("removing old factory name file", "err", err)
		}

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
		err := NewFioDevice(opts, prompt)
		if err != nil {
			log.Error("creating new device via lmp-device-register", "err", err)

			ch <- CreateNameResult{
				Err: fmt.Errorf("creating new device via lmp-device-register: %w", err),
			}

			return
		}

		info := FactoryNameInfo{
			FactoryName:          factoryName,
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

		out, err := utils.ExecSh("gdbus call --system --dest org.freedesktop.systemd1 --object-path /org/freedesktop/systemd1 --method org.freedesktop.systemd1.Manager.RestartUnit \"aktualizr-lite.service\" \"fail\"")
		if err != nil {
			log.Error("enabling aktualizr-lite service via DBus", "err", err, "out", out)
		}
	}()
}

func DeleteRequest() error {
	err := os.Remove(jsonFile)
	if err != nil {
		log.Error("removing old factory name file", "err", err)
	}
	return err
}
