package routes

import (
	"fmt"
	"net/http"
	"x8-ootb/firmware"
	"x8-ootb/utils"

	"github.com/inconshreveable/log15"
	"github.com/labstack/echo/v4"
)

type ReadFirmwareUpdateAvaliableResponse struct {
	UpdateAvailable bool `json:"updateAvailable"`
}

var firmareUpdateResponse = firmware.FirmwareUpdateProgress{
	Percentage: 0,
	Status:     "idle",
}

func ReadFirmwareUpdateAvaliable(c echo.Context) error {
	firmareUpdateResponse = firmware.FirmwareUpdateProgress{
		Percentage: 0,
		Status:     "idle",
	}

	apiResponse, err := firmware.GetVersion()

	if err != nil {
		log15.Error("Response from fakeString", "response", "err", err)
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Errorf("unmarshalling response: %s", err).Error()})
	}

	version, err := firmware.GetOwnVersion()
	if err != nil {
		log15.Error("reading current-target", "err", err)
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Errorf("reading current-target: %s", err).Error()})
	}

	res := ReadFirmwareUpdateAvaliableResponse{
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
		log15.Error("Response from fakeString", "err", err)
		return c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Errorf("unmarshalling response: %s", err).Error()})
	}

	firmareUpdateResponse = firmware.FirmwareUpdateProgress{
		Percentage: 0,
		Status:     "donwload-in-progress",
	}

	go firmware.DownloadVersion(apiResponse.Url, &firmareUpdateResponse, apiResponse.Md5sum)

	return c.JSON(http.StatusOK, nil)
}
func CreateFirmwareInstall(c echo.Context) error {
	apiResponse, err := firmware.GetVersion()
	if err != nil {
		log15.Error("Response from fakeString", "err", err)
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
