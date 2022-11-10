package routes

import (
	"errors"
	"fmt"
	"net/http"
	"regexp"
	factory "x8-ootb/factory"

	log "github.com/inconshreveable/log15"
	"github.com/labstack/echo/v4"
)

type createFactoryNameBody struct {
	FactoryName string `json:"factoryName" form:"factoryName" query:"factoryName"`
	BoardName   string `json:"boardName" form:"boardName" query:"boardName"`
}

type CreateNameResult struct {
	UserCode  string `json:"userCode"`
	ExpiresIn int    `json:"expiresIn"`
}

func ReadRegistration(c echo.Context) error {
	info, err := factory.GetRegistrationStatus()
	if err != nil {
		if errors.Is(err, factory.NameNotFoundError) {
			return c.JSON(http.StatusNotFound, err)
		}

		log.Error("Reading Factory name", "err", err)
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, info)
}

func CreateRegistration(c echo.Context) error {
	b := createFactoryNameBody{}

	err := c.Bind(&b)
	if err != nil {
		return c.JSON(http.StatusBadRequest, fmt.Errorf("parsing body: %w", err))
	}

	match, err := regexp.Match(`(?i)^[a-z0-9-_]{1,64}$`, []byte(b.FactoryName))
	if err != nil || !match {
		return c.JSON(http.StatusOK, "The Factory Name can only contain alphanumeric characters, hyphens (-) and underscores (_)")
	}

	match, err = regexp.Match(`(?i)^[a-z0-9-_]{1,64}$`, []byte(b.BoardName))
	if err != nil || !match {
		return c.JSON(http.StatusOK, "The Board Name can only contain alphanumeric characters, hyphens (-) and underscores (_)")
	}

	info, err := factory.Register(b.FactoryName, b.BoardName)

	if err != nil {
		log.Error("Reading Factory name", "err", err)
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, info)
}

func DeleteRegistration(c echo.Context) error {
	factory.CancelRegistration()
	return c.JSON(http.StatusOK, "")
}
