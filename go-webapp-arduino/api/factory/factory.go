package factory

import (
	"errors"
	"os"
	"x8-ootb/utils"

	"github.com/google/uuid"
	log "github.com/inconshreveable/log15"
)

type FactoryNameInfo struct {
	UserCodeExpiryTimestamp string `json:"userCodeExpiryTimestamp"`
	FactoryName             string `json:"factoryName"`
	UserCode                string `json:"userCode"`
	BrowserURL              string `json:"browserURL"`
	AuthenticationPending   bool   `json:"authenticationPending"`
	AuthenticationExpired   bool   `json:"authenticationExpired"`
	RegistrationComplete    bool   `json:"registrationComplete"`
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
	RegistrationComplete:  false,
}

func GetRegistrationStatus() (*FactoryNameInfo, error) {
	info := FactoryNameInfo{}

	info.AuthenticationPending = deviceRegistration.AuthenticationPending
	info.AuthenticationExpired = deviceRegistration.AuthenticationExpired
	info.RegistrationComplete = deviceRegistration.RegistrationComplete

	if deviceRegistration.RegistrationComplete {
		info.FactoryName = deviceRegistration.opts.Factory
	}

	if deviceRegistration.Claim != nil {
		info.UserCode = deviceRegistration.Claim.UserCode
		info.UserCodeExpiryTimestamp = deviceRegistration.Claim.ExpiresTimestamp
	}

	if deviceRegistration.opts != nil {
		info.FactoryName = deviceRegistration.opts.Factory
	}

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
	deviceRegistration.RegistrationComplete = false
	deviceRegistration.Claim = nil
}
