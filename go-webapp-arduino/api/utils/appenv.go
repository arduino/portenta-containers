package utils

import (
	"log"
	"os"
)

func AppEnvIsDevelopment() bool {
	development := true
	env := os.Getenv("APP_ENV")
	if env == "production" {
		log.Println("Running api server in production mode")
		development = false
	} else {
		log.Println("Running api server in dev mode")
	}

	return development
}
