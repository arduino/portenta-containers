package firmware

import (
	"encoding/json"
	"fmt"
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

func GetVersion() (*CreateDevicePayload, error) {

	//FIXME
	fakeString := `{
		"version": 456,
		"url": "https://downloads.arduino.cc/portentax8image/update-latest.tar.gz",
		"md5sum": "46e594c1b718acfe2584e13bb88e382a"
	}`

	apiResponse := CreateDevicePayload{}
	err := json.Unmarshal([]byte(fakeString), &apiResponse)
	if err != nil {
		log15.Error("Response from fakeString", "response", string(fakeString), "err", err)
		return nil, fmt.Errorf("unmarshalling response: %w", err)
	}

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
