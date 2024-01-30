package routes

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"x8-ootb/firmware"
	"x8-ootb/utils"

	"github.com/inconshreveable/log15"
	"github.com/labstack/echo/v4"
)

type ReadFirmwareUpdateAvailableResponse struct {
	UpdateAvailable bool `json:"updateAvailable"`
}

var firmareUpdateResponse = firmware.FirmwareUpdateProgress{}

func InitFirmareUpdateResponse() error {
	apiResponse, err := firmware.GetVersion()
	if err != nil {
		return err
	}
	isDownloaded, err := updateIsDownloaded()
	if err != nil {
		return err
	}
	if isDownloaded {
		latestUpdateExists, err := fileExists(apiResponse.Version)
		if err != nil {
			return err
		}
		if latestUpdateExists {
			firmareUpdateResponse.Status = "download-completed"
			return nil
		}
		firmareUpdateResponse.Status = "download-expired"
		return nil
	}
	firmareUpdateResponse.Status = "idle"
	return nil
}
func ReadFirmwareUpdateAvailable(c echo.Context) error {
	apiResponse, err := firmware.GetVersion()
	if err != nil {
		log15.Error("Response from get version", "response", "err", err)
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Errorf("unmarshalling response: %s", err).Error()})
	}
	version, err := firmware.GetOwnVersion()
	if err != nil {
		log15.Error("reading current-target", "err", err)
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Errorf("reading current-target: %s", err).Error()})
	}
	res := ReadFirmwareUpdateAvailableResponse{
		UpdateAvailable: false,
	}

	if apiResponse.Version > version || version == 0 {
		res.UpdateAvailable = true
	}

	return c.JSON(http.StatusOK, res)
}

func CreateFirmwareDownload(c echo.Context) error {
	apiResponse, err := firmware.GetVersion()
	if err != nil {
		log15.Error("Response from get version", "err", err)
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Errorf("unmarshalling response: %s", err).Error()})
	}

	firmareUpdateResponse = firmware.FirmwareUpdateProgress{
		Percentage: 0,
		Status:     "download-in-progress",
	}

	go firmware.DownloadVersion(apiResponse.Url, apiResponse.Version, &firmareUpdateResponse, apiResponse.Md5sum)

	return c.JSON(http.StatusOK, nil)
}
func CreateFirmwareInstall(c echo.Context) error {
	apiResponse, err := firmware.GetVersion()
	if err != nil {
		log15.Error("Response from get version", "err", err)
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Errorf("unmarshalling response: %s", err).Error()})
	}

	firmareUpdateResponse = firmware.FirmwareUpdateProgress{
		Percentage: 0,
		Status:     "install-in-progress",
	}

	go firmware.UpdateInstall(apiResponse.Url, &firmareUpdateResponse, apiResponse.Md5sum)

	return c.JSON(http.StatusOK, nil)
}

func ReadFirmwareUpdateProgress(c echo.Context) error {
	return c.JSON(http.StatusOK, firmareUpdateResponse)
}

func updateIsDownloaded() (bool, error) {
	files, err := os.ReadDir("/var/sota/")
	if err != nil {
		return false, err
	}
	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".tar.gz") {
			return true, nil
		}
	}
	return false, nil
}

func fileExists(version int) (bool, error) {
	_, err := os.Stat(fmt.Sprintf("/var/sota/update-firmware-%d.tar.gz", version))
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}
