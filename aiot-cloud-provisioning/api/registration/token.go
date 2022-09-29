package registration

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

type ReadTokenResponse struct {
	AccessToken string `json:"access_token"`
}

func ReadToken(ClientID string, ClientSecret string) (*string, error) {
	client := &http.Client{
		Timeout: time.Second * 10,
	}

	data := url.Values{}
	data.Set("grant_type", "client_credentials")
	data.Set("client_id", ClientID)
	data.Add("client_secret", ClientSecret)
	data.Add("audience", "https://api2.arduino.cc/iot")
	encodedData := data.Encode()

	req, err := http.NewRequest("POST", "https://api-dev.arduino.cc/iot/v1/clients/token", strings.NewReader(encodedData))
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Add("Content-Length", strconv.Itoa(len(data.Encode())))

	response, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("doing request %w", err)
	}

	b, err := io.ReadAll(response.Body)
	if err != nil {
		log.Fatalln(err)
	}

	j := ReadTokenResponse{}
	err = json.Unmarshal(b, &j)
	if err != nil {
		return nil, fmt.Errorf("unmarshalling response: %w", err)
	}

	defer response.Body.Close()
	return &j.AccessToken, nil
}
