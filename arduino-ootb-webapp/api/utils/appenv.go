package utils

import (
	"os"

	"github.com/inconshreveable/log15"
)

func AppEnvIsDevelopment() bool {
	development := true
	env := os.Getenv("APP_ENV")
	if env == "production" {
		log15.Debug("Running api server in production mode")
		development = false
	} else {
		log15.Debug("Running api server in dev mode")
	}

	return development
}
