package routes

import (
	"errors"
	"fmt"
	"net/http"
	factory "x8-ootb/factory"

	log "github.com/inconshreveable/log15"
	"github.com/labstack/echo/v4"
)

type createFactoryNameBody struct {
	FactoryName string `json:"factoryName" form:"factoryName" query:"factoryName"`
	BoardName   string `json:"boardName" form:"boardName" query:"boardName"`
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

	ch := make(chan factory.CreateNameResult)

	factory.CreateName(b.FactoryName, b.BoardName, ch)

	infoResult := <-ch

	if infoResult.Err != nil {
		log.Error("Creating Factory name", "err", err)
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, infoResult.Info)
}

func DeleteRequest(c echo.Context) error {
	err := factory.DeleteRequest()

	if err != nil {
		log.Error("Deleting Factory name creation request", "err", err)
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, "")
}
