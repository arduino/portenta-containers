package registration

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"
	"x8-aiot-cp-api/env"

	"github.com/inconshreveable/log15"
	"github.com/labstack/echo/v4"
)

var token = ""

type IoTConfigFile struct {
	Name     *string `json:"name"`
	Type     *string `json:"type"`
	DeviceID *string `json:"device_id"`
	Pin      string  `json:"pin"`
	SoPin    string  `json:"so_pin"`
	Slot     string  `json:"slot"`
	KeyUri   string  `json:"key_uri"`
	CertUri  string  `json:"cert_uri"`
}

type IoTCloudDeviceStatus struct {
	DeviceName          *string `json:"deviceName"`
	DeviceNameSuggested bool    `json:"deviceNameSuggested"`
	DeviceID            *string `json:"deviceId"`
	ThingID             *string `json:"thingId"`
	ThingName           *string `json:"thingName"`
	DashboardID         *string `json:"dashboardId"`
	DashboardName       *string `json:"dashboardName"`
	Registered          bool    `json:"registered"`
}

type RegisterToIOTCloudBody struct {
	ClientID       string `json:"clientId"`
	ClientSecret   string `json:"clientSecret"`
	OrganizationId string `json:"organizationId"`
	DeviceName     string `json:"deviceName"`
}

type RegistrationApi struct {
	Env env.EnvVariables
}

func (ra RegistrationApi) readIoTConfig() (*IoTConfigFile, error) {
	// Secrets file not found, the device is not registered
	if _, err := os.Stat(ra.Env.IoTConfigPath); err != nil {
		log15.Warn("IoT config file does not exist", "err", err)

		if errors.Is(err, os.ErrNotExist) {
			templateFile := IoTConfigFile{}

			content, err := os.ReadFile("/root/iot-config.template")
			if err != nil {
				log15.Error("reading iot-config.json file", "err", err)
				return nil, fmt.Errorf("reading iot-config.json file: %w", err)
			}

			// Parse the JSON file
			err = json.Unmarshal(content, &templateFile)
			if err != nil {
				log15.Error("unmarshalling iot-config.json file", "err", err)
				return nil, fmt.Errorf("unmarshalling iot-config.json file: %w", err)
			}

			b, err := json.MarshalIndent(templateFile, "", "  ")
			if err != nil {
				log15.Error("Cannot write IoT config file", "path", ra.Env.IoTConfigPath, "err", err)
				return nil, err
			}

			err = os.WriteFile(ra.Env.IoTConfigPath, b, 0644)
			if err != nil {
				log15.Error("Cannot write IoT config file", "path", ra.Env.IoTConfigPath, "err", err)
				return nil, err
			}
		}
	}

	// Read the JSON file
	content, err := os.ReadFile(ra.Env.IoTConfigPath)
	if err != nil {
		log15.Error("reading iot-config.json file", "err", err)
		return nil, fmt.Errorf("reading iot-config.json file: %w", err)
	}

	// Parse the JSON file
	sf := IoTConfigFile{}
	err = json.Unmarshal(content, &sf)
	if err != nil {
		log15.Error("unmarshalling iot-config.json file", "err", err)
		return nil, fmt.Errorf("unmarshalling iot-config.json file: %w", err)
	}

	return &sf, nil
}

func (ra RegistrationApi) writeIoTSecrets(file *IoTConfigFile) error {

	// Secrets file not found, the device is not registered
	if _, err := os.Stat(ra.Env.IoTConfigPath); errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("checking iot-config file exists: %w", err)
	}

	m, err := json.MarshalIndent(file, "", "  ")
	if err != nil {
		return fmt.Errorf("parsing iot-config file to json: %w", err)
	}

	err = os.WriteFile(ra.Env.IoTConfigPath, []byte(m), 0644)
	if err != nil {
		return fmt.Errorf("writing iot-config file: %w", err)
	}

	return nil
}

func (ra RegistrationApi) ReadIoTDevice(c echo.Context) error {
	// // Read device serial number
	// boardSerialNumber, err := os.ReadFile(ra.Env.SerialNumberPath)
	// if err != nil {
	// 	return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: fmt.Errorf("reading /sys/devices/soc0/serial_number: %w", err).Error()})
	// }

	// suggestedName := fmt.Sprintf("portenta-x8-%s", strings.TrimSuffix(string(boardSerialNumber), "\n"))
	suggestedName := "portenta-x8"

	res := IoTCloudDeviceStatus{
		DeviceName:          &suggestedName,
		DeviceNameSuggested: true,
		Registered:          false,
		DeviceID:            nil,
	}

	iotConfigFile, err := ra.readIoTConfig()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	// Device name not found, the device is not registered
	if iotConfigFile == nil || iotConfigFile.Name == nil || *iotConfigFile.Name == "" || *iotConfigFile.DeviceID == "" {
		return c.JSON(http.StatusOK, res)
	}

	res.DeviceName = iotConfigFile.Name
	res.DeviceID = iotConfigFile.DeviceID

	if iotConfigFile.Name != nil {
		res.Registered = true
	}

	res.DeviceNameSuggested = false

	return c.JSON(http.StatusOK, res)
}

func (ra RegistrationApi) RegisterToIOTCloud(c echo.Context) error {
	cloudAPI := CloudAPI{
		ApiURL: ra.Env.IoTAPIURL,
		Client: &http.Client{
			Timeout: time.Second * 10,
		},
	}

	iotSecrets, err := ra.readIoTConfig()
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{Error: fmt.Errorf("reading iot-config.json: %w", err).Error()})
	}

	b := RegisterToIOTCloudBody{}
	err = c.Bind(&b)
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{Error: fmt.Errorf("parsing body: %w", err).Error()})
	}

	dat, err := os.ReadFile(ra.Env.SerialNumberPath)
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{Error: fmt.Errorf("reading serial number: %w", err).Error()})
	}
	serialNumber := string(dat)

	cmd := fmt.Sprintf("./provisioning.sh -k %s %s %s", iotSecrets.SoPin, iotSecrets.Pin, iotSecrets.Slot)
	_, outerr, err := shellout(cmd)
	if err != nil {
		log15.Error("Shellout failed", "cmd", cmd, "outErr", outerr, "err", err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "test" + outerr + err.Error()})
	}

	// Get an usable token from the cloud
	t, err := cloudAPI.ReadToken(b.ClientID, b.ClientSecret)
	if err != nil {
		log15.Error("Reading token from API", "t", t, "err", err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: fmt.Errorf("getting token: %w", err).Error()})
	}
	token = *t

	// Get an usable token from the cloud
	createDevicePayload := CreateDevicePayload{
		Name:   b.DeviceName,
		Type:   *iotSecrets.Type,
		Serial: serialNumber,
		Fqbn:   ra.Env.IoTFQBN,
	}

	d, err := cloudAPI.CreateDevice(&createDevicePayload, b.OrganizationId, token)
	if err != nil {
		log15.Error("Creating device", "result", d, "err", err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: fmt.Errorf("creating device token: %w", err).Error()})
	}
	deviceId := *d

	// Generate CSR
	cmd = fmt.Sprintf("./provisioning.sh -c %s %s", iotSecrets.Pin, deviceId)
	log15.Info("Executing shell script", "cmd", cmd)
	out, outerr, err := shellout(cmd)
	if err != nil {
		log15.Error("Shellout failed", "out", out, "outErr", outerr, "err", err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: outerr})
	}

	csrBytes, err := os.ReadFile("/tmp/csr.csr")
	if err != nil {
		log15.Error("reading csr", "cmd", cmd, "outErr", outerr, "err", err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: fmt.Errorf("reading csr: %s", outerr).Error()})

	}

	// Get device certificate
	createDeviceCertPayload := CreateDeviceCertPayload{
		CA:      "Arduino",
		CSR:     string(csrBytes),
		Enabled: true,
	}
	d, err = cloudAPI.CreateDeviceCert(&createDeviceCertPayload, deviceId, b.OrganizationId, token)
	if err != nil {
		log15.Error("Creating device cert", "result", d, "err", err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: fmt.Errorf("getting token: %w", err).Error()})
	}
	pem := *d

	err = os.WriteFile("/tmp/device-certificate.pem", []byte(pem), os.ModeAppend)
	if err != nil {
		log15.Error("writing certificate failed", "err", err, "pem", pem)
		return nil
	}

	// Store device certificate
	cmd = fmt.Sprintf("./provisioning.sh -s %s \"%s\" %s", iotSecrets.Pin, "/tmp/device-certificate.pem", iotSecrets.Slot)
	log15.Info("Executing shell script", "cmd", cmd)
	_, outerr, err = shellout(cmd)
	if err != nil {
		log15.Error("Shellout failed", "cmd", cmd, "outErr", outerr, "err", err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: outerr})
	}

	err = os.Remove("/tmp/device-certificate.pem")
	if err != nil {
		log15.Error("removing temporary PEM file", "err", err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: fmt.Errorf("removing temporary PEM file: %s", outerr).Error()})
	}

	iotSecrets, err = ra.readIoTConfig()
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{Error: fmt.Errorf("reading iot-config.json: %w", err).Error()})
	}

	// Update json file with DEVICE_ID
	iotSecrets.DeviceID = &deviceId

	err = ra.writeIoTSecrets(iotSecrets)
	if err != nil {
		log15.Error("Writing iot config", "d", d, "err", err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: fmt.Errorf("writing iot-config: %w", err).Error()})
	}

	// Create default thing and dashboard
	cmd = fmt.Sprintf("./provisioning.sh -t %s %s %s %s %s %s", b.ClientID, b.ClientSecret, b.DeviceName, deviceId, ra.Env.IoTAPIURL, b.OrganizationId)
	log15.Info("Executing shell script", "cmd", cmd)
	_, outerr, err = shellout(cmd)
	if err != nil {
		log15.Error("Shellout failed", "cmd", cmd, "outErr", outerr, "err", err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: outerr})
	}

	iotSecrets, err = ra.readIoTConfig()
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{Error: fmt.Errorf("reading iot-config.json: %w", err).Error()})
	}

	log15.Info("Reading iot device", "deviceID", iotSecrets.DeviceID, "OrganizationId", b.OrganizationId, "token", token)

	device, err := cloudAPI.ReadIoTDevice(*iotSecrets.DeviceID, b.OrganizationId, token)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
	}

	res := IoTCloudDeviceStatus{
		DeviceNameSuggested: false,
		Registered:          true,
		DeviceID:            &device.Thing.DeviceID,
		DeviceName:          &device.Thing.DeviceName,
		ThingID:             &device.Thing.ID,
		ThingName:           &device.Thing.Name,
	}

	dashboards, err := cloudAPI.ReadIoTDashboards(b.OrganizationId, token)
	if err != nil {
		log15.Error("Reading IoT dashboards", "err", err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{Error: fmt.Errorf("reading IoT dashboards: %w", err).Error()})
	}

	for _, d := range *dashboards {
		// Find a dahsboard whose name is the same as the thing name
		log15.Info("Finding dashboard", "dashboard.id", d.ID, "dashboard.name", d.Name, "thing.name", device.Thing.Name, "thing.id", device.Thing.ID)
		dashboard := d
		if d.Name == device.Thing.Name {
			res.DashboardID = &dashboard.ID
			res.DashboardName = &dashboard.Name
		}
	}

	return c.JSON(http.StatusOK, res)
}

// func UnregisterFromIOTCloud(c echo.Context) error {
// 	err := writeDeviceNameToFile("")
// 	if err != nil {
// 		return c.JSON(http.StatusBadRequest, ErrorResponse{Error: fmt.Errorf("writing device name to file: %w", err)})
// 	}

// 	return c.String(http.StatusOK, "")
// }
