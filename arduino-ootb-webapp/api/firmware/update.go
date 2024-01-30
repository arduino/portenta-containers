package firmware

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"strconv"

	"github.com/inconshreveable/log15"
)

type CreateDevicePayload struct {
	Version int    `json:"version"`
	Url     string `json:"url"`
	Md5sum  string `json:"md5sum"`
}

type jsonPayload struct {
	Latest struct {
		Version string `json:"version"`
		Url     string `json:"url"`
		Md5sum  string `json:"md5sum"`
	}
}

func getJson(url string, target interface{}) error {
	r, err := http.Get(url)
	if err != nil {
		return err
	}
	defer r.Body.Close()

	return json.NewDecoder(r.Body).Decode(target)
}

func GetVersion() (*CreateDevicePayload, error) {
	json := jsonPayload{}
	jsonUri := os.Getenv("UPDATE_JSON_URI")
	fmt.Printf("UPDATE_JSON_URI: %s\n", jsonUri)
	//TODO fix error
	getJson(jsonUri, &json)

	apiResponse := CreateDevicePayload{}
	cast, err := strconv.Atoi(json.Latest.Version)
	apiResponse.Version = cast
	if err != nil {
		return nil, fmt.Errorf("converting version: %w", err)
	}
	apiResponse.Url = json.Latest.Url
	apiResponse.Md5sum = json.Latest.Md5sum

	return &apiResponse, nil
}

func GetOwnVersion() (int, error) {
	file, err := os.ReadFile("/etc/os-release")
	if err != nil {
		log15.Error("reading current-target", "err", err)
		return -1, fmt.Errorf("reading current-target: %w", err)
	}

	var re = regexp.MustCompile(`IMAGE_VERSION=([0-9]+)`)
	match := re.FindAllStringSubmatch(string(file), -1)

	if match == nil {
		return 0, nil
	}

	if match[0] == nil {
		return 0, nil
	}

	version := match[0][1]

	versionInt, err := strconv.Atoi(version)
	if err != nil {
		log15.Error("converting version to int", "err", err)
		return -1, fmt.Errorf("converting version to int: %s", file)
	}

	return versionInt, nil
}
