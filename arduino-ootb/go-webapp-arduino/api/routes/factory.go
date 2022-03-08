package routes

import (
	"errors"
	"fmt"
	"net/http"
	factory "x8-oob/factory"

	log "github.com/inconshreveable/log15"
	"github.com/labstack/echo/v4"
)

type createFactoryNameBody struct {
	Name string `json:"name" form:"name" query:"name"`
}

func ReadFactoryName(c echo.Context) error {
	info, err := factory.ReadName()
	if err != nil {
		if errors.Is(err, factory.NameNotFoundError) {
			return c.JSON(http.StatusNotFound, err)
		}

		log.Error("Reading Factory name", "err", err)
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, info)
}

func CreateFactoryName(c echo.Context) error {
	b := createFactoryNameBody{}

	err := c.Bind(&b)
	if err != nil {
		return c.JSON(http.StatusBadRequest, fmt.Errorf("parsing body: %w", err))
	}

	info, err := factory.CreateName(b.Name)
	if err != nil {
		log.Error("Creating Factory name", "err", err)
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, info)
}
