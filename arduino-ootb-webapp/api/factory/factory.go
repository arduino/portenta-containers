package factory

import (
	"errors"
	"io/ioutil"
	"os"
	"x8-ootb/utils"

	"github.com/google/uuid"
	log "github.com/inconshreveable/log15"
)

type FactoryNameInfo struct {
	UserCodeExpiresIn     int    `json:"userCodeExpiresIn"`
	FactoryName           string `json:"factoryName"`
	UserCode              string `json:"userCode"`
	BrowserURL            string `json:"browserURL"`
	AuthenticationPending bool   `json:"authenticationPending"`
	AuthenticationExpired bool   `json:"authenticationExpired"`
	RegistrationComplete  bool   `json:"registrationComplete"`
}

type CreateNameResult struct {
	UserCode  string `json:"userCode"`
	ExpiresIn int    `json:"expiresIn"`
}

type CreateNameCb func(err error, info *FactoryNameInfo)

var NameNotFoundError = errors.New("Factory name not found")

const DefaultOtaTag = "experimental"
const DefaultHardwareId = "portenta-x8"

var deviceRegistration = DeviceRegistration{
	AuthenticationPending: false,
	AuthenticationExpired: false,
}

func GetRegistrationStatus() (*FactoryNameInfo, error) {
	info := FactoryNameInfo{}

	if _, err := os.Stat("/var/sota/sota.toml"); err == nil {
		info.RegistrationComplete = true
		log.Debug("Device already registered to a factory.")
	} else {
		info.RegistrationComplete = false
		log.Debug("Device not registered.")
	}

	info.AuthenticationPending = deviceRegistration.AuthenticationPending
	info.AuthenticationExpired = deviceRegistration.AuthenticationExpired

	if deviceRegistration.Claim != nil {
		info.UserCode = deviceRegistration.Claim.UserCode
		info.UserCodeExpiresIn = deviceRegistration.Claim.ExpiresIn
	}

	if deviceRegistration.opts != nil {
		info.FactoryName = deviceRegistration.opts.Factory
	} else {
		if info.RegistrationComplete {
			f, err := ioutil.ReadFile("/var/sota/FACTORY_NAME")
			if err != nil {
				log.Error("reading factory name file", "err", err)
				info.FactoryName = "unknown"
			} else {
				info.FactoryName = string(f)
			}
		}
	}
	log.Debug("Factory name = %s", info.FactoryName)

	return &info, nil
}

func Register(factoryName string, boardName string) (*FactoryNameInfo, error) {

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
	deviceUuid := uuid.NewString()

	err := deviceRegistration.BeginAuthentication(opts, deviceUuid)
	if err != nil {
		log.Error("Requeting the OAuth access token to Foundries", "err", err)
		return nil, err
	}

	go func() {
		token, err := deviceRegistration.CheckToken()
		if err != nil {
			log.Error("Checking Foundries token", "err", err)
			return
		}

		err = deviceRegistration.CreateDevice(token)
		if err != nil {
			log.Error("Creating device", "err", err)
			return
		}

		out, err := utils.ExecSh("gdbus call --system --dest org.freedesktop.systemd1 --object-path /org/freedesktop/systemd1 --method org.freedesktop.systemd1.Manager.RestartUnit \"aktualizr-lite.service\" \"fail\"")
		if err != nil {
			log.Error("Enabling aktualizr-lite service via DBus", "err", err, "out", out)
		}
	}()

	return GetRegistrationStatus()
}

func CancelRegistration() {
	deviceRegistration.opts = nil
	deviceRegistration.csr = nil
	deviceRegistration.AuthenticationPending = false
	deviceRegistration.AuthenticationExpired = false
	deviceRegistration.Claim = nil
}
