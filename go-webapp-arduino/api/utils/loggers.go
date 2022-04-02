package utils

import (
	"net"
	"time"

	log15 "github.com/inconshreveable/log15"
	"github.com/labstack/echo/v4"
)

func Log15HTTPLogger() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			res := c.Response()

			remoteAddr := req.RemoteAddr
			if ip := req.Header.Get(echo.HeaderXRealIP); ip != "" {
				remoteAddr = ip
			} else if ip = req.Header.Get(echo.HeaderXForwardedFor); ip != "" {
				remoteAddr = ip
			} else {
				remoteAddr, _, _ = net.SplitHostPort(remoteAddr)
			}

			start := time.Now()
			if err := next(c); err != nil {
				c.Error(err)
			}
			stop := time.Now()

			path := req.URL.Path
			if path == "" {
				path = "/"
			}

			log15.Debug("HTTP Request",
				"remoteAddr", remoteAddr,
				"method", req.Method,
				"path", path,
				"status", res.Status,
				"time", stop.Sub(start),
				"size", res.Size)
			return nil
		}
	}
}
