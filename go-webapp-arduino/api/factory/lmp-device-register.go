package factory

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/asn1"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	log "github.com/inconshreveable/log15"
)

type AuthPrompt func(verificationUri, userCode string)

type DeviceCreateOpts struct {
	Factory       string
	OtaTag        string
	IsProd        bool
	HardwareId    string
	SotaConfigDir string
}

func NewFioDevice(opts DeviceCreateOpts, prompt AuthPrompt) error {
	deviceUuid := uuid.NewString()
	pkey, csr, err := genKey(opts.Factory, deviceUuid, opts.IsProd)
	if err != nil {
		return err
	}

	path := filepath.Join(opts.SotaConfigDir, "pkey.pem")
	if err = ioutil.WriteFile(path, pkey, 0o644); err != nil {
		return err
	}

	token, err := getAccessToken(opts.Factory, deviceUuid, prompt)
	if err != nil {
		return err
	}
	return createDevice(opts, deviceUuid, token, csr)
}

func genKey(factory, uuid string, production bool) ([]byte, []byte, error) {
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return nil, nil, err
	}

	subject := pkix.Name{
		CommonName:         uuid,
		OrganizationalUnit: []string{factory},
	}
	rawSubj := subject.ToRDNSequence()
	businessCategoryOid := asn1.ObjectIdentifier{2, 5, 4, 15}
	if production {
		rawSubj = append(rawSubj, []pkix.AttributeTypeAndValue{
			{Type: businessCategoryOid, Value: "production"},
		})
	}
	asn0Subj, _ := asn1.Marshal(rawSubj)

	digitalSignature, _ := asn1.Marshal(asn1.BitString{
		Bytes: []byte{128},
	})
	tlsWebClientAuth, _ := asn1.Marshal(
		[]asn1.ObjectIdentifier{asn1.ObjectIdentifier([]int{1, 3, 6, 1, 5, 5, 7, 3, 2})},
	)

	template := x509.CertificateRequest{
		RawSubject: asn0Subj,
		ExtraExtensions: []pkix.Extension{
			{
				Id:       asn1.ObjectIdentifier([]int{2, 5, 29, 15}),
				Critical: true,
				Value:    digitalSignature,
			},
			{
				Id:       asn1.ObjectIdentifier([]int{2, 5, 29, 37}),
				Critical: true,
				Value:    tlsWebClientAuth,
			},
		},
	}
	csr, err := x509.CreateCertificateRequest(rand.Reader, &template, key)
	if err != nil {
		return nil, nil, err
	}
	block := &pem.Block{
		Type:  "CERTIFICATE REQUEST",
		Bytes: csr,
	}
	csrPem := pem.EncodeToMemory(block)

	privBytes, err := x509.MarshalECPrivateKey(key)
	if err != nil {
		return nil, nil, err
	}
	block = &pem.Block{
		Type:  "EC PRIVATE KEY",
		Bytes: privBytes,
	}
	keyPem := pem.EncodeToMemory(block)

	return keyPem, csrPem, nil
}

func readResponse(res *http.Response) ([]byte, error) {
	defer res.Body.Close()
	return ioutil.ReadAll(res.Body)
}

func getAccessToken(factory, deviceUuid string, prompt AuthPrompt) (string, error) {
	form := url.Values{"client_id": {deviceUuid}}
	res, err := http.PostForm("https://app.foundries.io/oauth/authorization/device/", form)
	if err != nil {
		return "", err
	}
	body, err := readResponse(res)
	if err != nil {
		return "", err
	} else if res.StatusCode != 200 {
		return "", fmt.Errorf("HTTP_%d: %s", res.StatusCode, string(body))
	}

	type oauthClaim struct {
		DeviceCode      string `json:"device_code"`
		UserCode        string `json:"user_code"`
		VerificationUri string `json:"verification_uri"`
		Interval        int    `json:"interval"`
		ExpiresIn       int    `json:"expires_in"`
	}
	var claim oauthClaim
	if err = json.Unmarshal(body, &claim); err != nil {
		return "", err
	}

	prompt(claim.VerificationUri, claim.UserCode)

	form = url.Values{
		"grant_type":  {"urn:ietf:params:oauth:grant-type:device_code"},
		"device_code": {claim.DeviceCode},
		"client_id":   {deviceUuid},
		"scope":       {factory + ":devices:create"},
	}

	i := 0
	// WHEELS := []byte{'|', '/', '-', '\\'}
	for {
		res, err := http.PostForm("https://app.foundries.io/oauth/token/", form)
		if err != nil {
			log.Error("lmp-device-register getAccessToken", "Unable to check for token:", err)
		} else {
			body, err := readResponse(res)
			if err != nil {
				fmt.Println("Unable to read HTTP response:", err)
			} else if res.StatusCode == 200 {
				type Token struct {
					AccessToken string `json:"access_token"`
				}
				var token Token
				if err = json.Unmarshal(body, &token); err != nil {
					return "", err
				}
				// fmt.Println()
				return token.AccessToken, nil
			} else if res.StatusCode == 400 {
				// fmt.Printf("Waiting for authorization %c\r", WHEELS[i%len(WHEELS)])
				i += 1
			} else {
				return "", fmt.Errorf("HTTP_%d: %s", res.StatusCode, string(body))
			}
		}
		time.Sleep(time.Duration(claim.Interval) * time.Second)
	}
}

type PacmanOverrides struct {
	Type            string `json:"type"`
	Tag             string `json:"tags"`
	ComposeAppsRoot string `json:"compose_apps_root"`
	ComposeApps     string `json:"compose_apps,omitempty"`
}
type Overrides struct {
	Pacman PacmanOverrides `json:"pacman"`
}
type deviceCreateRequest struct {
	Name        string    `json:"name"`
	Uuid        string    `json:"uuid"`
	Csr         string    `json:"csr"`
	HardwareId  string    `json:"hardware-id"`
	SotaConfDir string    `json:"sota-config-dir"`
	Overrides   Overrides `json:"overrides"`
}

func createDevice(opts DeviceCreateOpts, uuid, token string, csr []byte) error {
	dc := deviceCreateRequest{
		Name:        uuid,
		Uuid:        uuid,
		Csr:         string(csr),
		HardwareId:  opts.HardwareId,
		SotaConfDir: opts.SotaConfigDir,
		Overrides: Overrides{
			Pacman: PacmanOverrides{
				Type:            "\"ostree+compose_apps\"",
				Tag:             "\"" + opts.OtaTag + "\"",
				ComposeAppsRoot: "\"" + filepath.Join(opts.SotaConfigDir, "compose-apps") + "\"",
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
		path := filepath.Join(opts.SotaConfigDir, name)
		if err = ioutil.WriteFile(path, []byte(content), 0o644); err != nil {
			return err
		}
	}
	return nil
}

// func main() {
// 	opts := DeviceCreateOpts{
// 		Factory:       "andy-corp",
// 		OtaTag:        "master",
// 		IsProd:        true,
// 		HardwareId:    "intel",
// 		SotaConfigDir: "/var/sota",
// 	}

// 	prompt := func(verificationUri, userCode string) {
// 		fmt.Printf("Please vist %s and enter \"%s\" as the user code\n", verificationUri, userCode)
// 	}
// 	err := NewFioDevice(opts, prompt)
// 	if err != nil {
// 		panic(err)
// 	}
// }
