package main

import (
	"encoding/json"
	"net/http"
)

func handleWiFi(resp http.ResponseWriter, req *http.Request) {
	switch req.Method {

	case http.MethodPost:
		decoder := json.NewDecoder(req.Body)
		w := &WiFi{}

		if err := decoder.Decode(w); err != nil {
			resp.WriteHeader(http.StatusBadRequest)
			return
		}

		go addWiFi(w)

		resp.WriteHeader(http.StatusOK)
		return

	default:
		resp.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
}
