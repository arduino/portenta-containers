package factory

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"path/filepath"
	"time"

	log "github.com/inconshreveable/log15"
)

type DeviceRegistration struct {
	deviceUuid            string
	opts                  *DeviceCreateOpts
	csr                   []byte
	AuthenticationPending bool
	AuthenticationExpired bool
	RegistrationComplete  bool
	Claim                 *OauthClaim
}

type OauthClaim struct {
	DeviceCode      string `json:"device_code"`
	UserCode        string `json:"user_code"`
	VerificationUri string `json:"verification_uri"`
	Interval        int    `json:"interval"`
	ExpiresIn       int    `json:"expires_in"`
}

// https://www.oauth.com/oauth2-servers/device-flow/token-request/

// Check the OAuth endpoint every n seconds (n is from the previous request)
// until it returns 200, with the authentication token
// The authentication token will be used to register the device
func (f *DeviceRegistration) CheckToken() (string, error) {
	if f.Claim == nil {
		return "", fmt.Errorf("Claim is nil")
	}

	form := url.Values{
		"grant_type":  {"urn:ietf:params:oauth:grant-type:device_code"},
		"device_code": {f.Claim.DeviceCode},
		"client_id":   {f.deviceUuid},
		"scope":       {f.opts.Factory + ":devices:create"},
	}

	i := 0
	for {
		res, err := http.PostForm("https://app.foundries.io/oauth/token/", form)
		if err != nil {
			log.Error("lmp-device-register getAccessToken", "Unable to check for token:", err)
		} else {
			body, err := readResponse(res)
			if err != nil {
				log.Error("Unable to read HTTP response:", "err", err)
			} else if res.StatusCode == 200 {
				type Token struct {
					AccessToken string `json:"access_token"`
				}
				var token Token
				if err = json.Unmarshal(body, &token); err != nil {
					return "", err
				}
				// fmt.Println()
				log.Info("OAuth token retrieved")
				f.AuthenticationPending = false
				return token.AccessToken, err
			} else if res.StatusCode == 400 {
				// fmt.Printf("Waiting for authorization %c\r", WHEELS[i%len(WHEELS)])
				i += 1
				log.Info("OAuth token not retrieved yet")
			} else {
				log.Error("lmp-device-register getAccessToken", "code", res.StatusCode, "req", fmt.Sprintf("%v", form), "res", string(body))
				return "", fmt.Errorf("HTTP_%d: %s", res.StatusCode, string(body))
			}
		}

		if f.Claim == nil {
			return "", fmt.Errorf("claim is nil, maybe the token expired")
		}

		f.Claim.ExpiresIn = f.Claim.ExpiresIn - int(time.Duration(f.Claim.Interval))

		if f.Claim.ExpiresIn <= 0 {
			return "", fmt.Errorf("access token timed out")
		}

		time.Sleep(time.Duration(f.Claim.Interval) * time.Second)
	}
}

// Start the OAuth authentication process
// This will return the user_code to be returned to the user
func (f *DeviceRegistration) BeginAuthentication(opts DeviceCreateOpts, deviceUuid string) error {
	f.AuthenticationPending = true
	f.deviceUuid = deviceUuid
	f.opts = &opts

	pkey, csr, err := GenKey(opts.Factory, deviceUuid, opts.IsProd)
	if err != nil {
		return err
	}

	f.csr = csr

	path := filepath.Join(opts.SotaConfigDir, "pkey.pem")
	if err = ioutil.WriteFile(path, pkey, 0o644); err != nil {
		return err
	}

	form := url.Values{"client_id": {deviceUuid}}

	res, err := http.PostForm("https://app.foundries.io/oauth/authorization/device/", form)
	if err != nil {
		return err
	}

	body, err := readResponse(res)
	if err != nil {
		return err
	} else if res.StatusCode != 200 {
		return fmt.Errorf("HTTP_%d: %s", res.StatusCode, string(body))
	}

	var claim OauthClaim
	if err = json.Unmarshal(body, &claim); err != nil {
		return err
	}

	t := time.NewTimer(time.Duration(claim.ExpiresIn) * time.Second)

	log.Debug("Registering factory name", "verificationUri", claim.VerificationUri, "userCode", claim.UserCode)

	// Mark the authentication process as expired when the OAuth timeout is over
	go func() {
		<-t.C
		f.AuthenticationExpired = true
		f.AuthenticationPending = false
	}()

	f.Claim = &claim
	f.AuthenticationPending = true

	return err
}

// Create the device, using the valid token and the certificate request
// from the authentication process
func (f *DeviceRegistration) CreateDevice(token string) error {
	dc := deviceCreateRequest{
		Name:        f.opts.Name,
		Uuid:        f.deviceUuid,
		Csr:         string(f.csr),
		HardwareId:  f.opts.HardwareId,
		SotaConfDir: f.opts.SotaConfigDir,
		Overrides: Overrides{
			Pacman: PacmanOverrides{
				Type:            "\"ostree+compose_apps\"",
				Tag:             "\"" + f.opts.OtaTag + "\"",
				ComposeAppsRoot: "\"" + filepath.Join(f.opts.SotaConfigDir, "compose-apps") + "\"",
			},
		},
	}

	data, err := json.Marshal(dc)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://api.foundries.io/ota/devices/", bytes.NewBuffer(data))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json; charset=UTF-8")
	req.Header.Set("Authorization", "Bearer "+token)
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	body, err := readResponse(res)
	if err != nil {
		return err
	} else if res.StatusCode != 201 {
		return fmt.Errorf("HTTP_%d: %s", res.StatusCode, string(body))
	}
	var files map[string]string
	if err = json.Unmarshal(body, &files); err != nil {
		return err
	}
	for name, content := range files {
		path := filepath.Join(f.opts.SotaConfigDir, name)
		if err = ioutil.WriteFile(path, []byte(content), 0o644); err != nil {
			return err
		}
	}

	f.RegistrationComplete = true

	return nil
}
