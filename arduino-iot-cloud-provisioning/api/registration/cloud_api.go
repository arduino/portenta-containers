package registration

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/inconshreveable/log15"
)

type CloudAPI struct {
	ApiURL string
	Client *http.Client
}

type ReadTokenResponse struct {
	AccessToken string `json:"access_token"`
}

func (a CloudAPI) ReadToken(ClientID string, ClientSecret string) (*string, error) {
	data := url.Values{}
	data.Set("grant_type", "client_credentials")
	data.Set("client_id", ClientID)
	data.Add("client_secret", ClientSecret)
	data.Add("audience", "https://api2.arduino.cc/iot")
	encodedData := data.Encode()

	url := fmt.Sprintf("%s/iot/v1/clients/token", a.ApiURL)

	req, err := http.NewRequest("POST", url, strings.NewReader(encodedData))
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Add("Content-Length", strconv.Itoa(len(data.Encode())))

	response, err := a.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("doing request %w", err)
	}

	log15.Info("response", "res", response.StatusCode)

	b, err := io.ReadAll(response.Body)
	if err != nil {
		log.Fatalln(err)
	}

	j := ReadTokenResponse{}
	err = json.Unmarshal(b, &j)
	if err != nil {
		log15.Error("Response from /v1/clients/token", "response", string(b), "err", err)
		return nil, fmt.Errorf("unmarshalling response: %w", err)
	}

	defer response.Body.Close()
	return &j.AccessToken, nil
}

type CreateDevicePayload struct {
	Name   string `json:"name"`
	Type   string `json:"type"`
	Serial string `json:"serial"`
	Fqbn   string `json:"fqbn"`
}

type CreateDeviceResponse struct {
	ID string `json:"id"`
}

func (a CloudAPI) CreateDevice(payload *CreateDevicePayload, token string) (*string, error) {
	reqJ, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshalling payload: %w", err)
	}

	req, err := http.NewRequest("PUT", fmt.Sprintf("%s/iot/v2/devices", a.ApiURL), bytes.NewReader(reqJ))
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", token))

	response, err := a.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("doing request %w", err)
	}

	b, err := io.ReadAll(response.Body)
	if err != nil {
		log.Fatalln(err)
	}

	resJ := CreateDeviceResponse{}
	err = json.Unmarshal(b, &resJ)
	if err != nil {
		return nil, fmt.Errorf("unmarshalling response: %w", err)
	}

	defer response.Body.Close()
	return &resJ.ID, nil
}

type CreateDeviceCertPayload struct {
	CA      string `json:"ca"`
	CSR     string `json:"csr"`
	Enabled bool   `json:"enabled"`
}

type CreateDeviceCertResponse struct {
	PEM string `json:"pem"`
}

func (a CloudAPI) CreateDeviceCert(payload *CreateDeviceCertPayload, deviceId string, token string) (*string, error) {
	reqJ, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshalling payload: %w", err)
	}

	req, err := http.NewRequest("PUT", fmt.Sprintf("%s/iot/v2/devices/%s/certs", a.ApiURL, deviceId), bytes.NewReader(reqJ))
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", token))

	response, err := a.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("doing request %w", err)
	}

	b, err := io.ReadAll(response.Body)
	if err != nil {
		log.Fatalln(err)
	}

	resJ := CreateDeviceCertResponse{}
	err = json.Unmarshal(b, &resJ)
	if err != nil {
		return nil, fmt.Errorf("unmarshalling response: %w", err)
	}

	defer response.Body.Close()
	return &resJ.PEM, nil
}

type IoTDeviceResponseThing struct {
	DeviceID   string `json:"device_id"`
	DeviceName string `json:"device_name"`
	ID         string `json:"id"`
	Name       string `json:"name"`
}
type IoTDeviceResponse struct {
	Thing IoTDeviceResponseThing `json:"thing"`
}

func (a CloudAPI) ReadIoTDevice(deviceID string, token string) (*IoTDeviceResponse, error) {
	url := fmt.Sprintf("%s/iot/v2/devices/%s", a.ApiURL, deviceID)
	req, err := http.NewRequest("GET", url, strings.NewReader(""))
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", token))

	response, err := a.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("doing request %w", err)
	}

	b, err := io.ReadAll(response.Body)
	if err != nil {
		log.Fatalln(err)
	}

	j := IoTDeviceResponse{}
	err = json.Unmarshal(b, &j)
	if err != nil {
		return nil, fmt.Errorf("unmarshalling response: %w", err)
	}

	defer response.Body.Close()
	return &j, nil
}

type IoTDashboardVariable struct {
	ThingID string `json:"thing_id"`
}

type IoTDashboardWidget struct {
	Variables []IoTDashboardVariable `json:"variables"`
}

type IoTDashboardDashboard struct {
	ID      string               `json:"id"`
	Name    string               `json:"name"`
	Widgets []IoTDashboardWidget `json:"widgets"`
}

func (a CloudAPI) ReadIoTDashboards(token string) (*[]IoTDashboardDashboard, error) {
	url := fmt.Sprintf("%s/iot/v2/dashboards", a.ApiURL)
	req, err := http.NewRequest("GET", url, strings.NewReader(""))
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", token))

	response, err := a.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("doing request %w", err)
	}

	b, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("reading body: %w", err)
	}

	j := []IoTDashboardDashboard{}
	err = json.Unmarshal(b, &j)
	if err != nil {
		return nil, fmt.Errorf("unmarshalling response: %w", err)
	}

	defer response.Body.Close()
	return &j, nil
}
