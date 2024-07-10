package main

import (
	"bytes"
	"fmt"
	"os/exec"
)

const ShellToUse = "sh"

// WiFi contains wifi credentials
type WiFi struct {
	SSID string
	Pass string
}

func (w WiFi) log() {
	fmt.Printf("Save credentials: %s %s\n", w.SSID, w.Pass)
}

func addWiFi(w *WiFi) {
	w.log()
	err := removeAllWiFi()
	if err != nil {
		fmt.Println(err.Error())
		soc.broadcast("wifi", "{\"operation\" : \"connection\", \"status\" : \"error\"}")
		return
	}

	app := "nmcli"
	args := []string{"device", "wifi", "connect", w.SSID, "password", w.Pass}
	cmd := exec.Command(app, args...)
	stdout, err := cmd.Output()

	if err != nil {
		fmt.Println(err.Error())
		soc.broadcast("wifi", "{\"operation\" : \"connection\", \"status\" : \"error\"}")
		return
	}

	soc.broadcast("wifi", "{\"operation\" : \"connection\", \"status\" : \"done\"}")
	fmt.Print(string(stdout))
	return
}

func removeAllWiFi() (error) {
	fmt.Printf("Removing all wifi connections\n")
	stdout, err, stderr := Shellout("nmcli --terse connection show | grep wireless | cut -d : -f 1 | while read name; do echo nmcli connection delete \"$name\"; done")
	_ = stderr
	if err == nil {
		fmt.Print(string(stdout))
	}
	return err
}

func Shellout(command string) (string, error, string) {
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd := exec.Command(ShellToUse, "-c", command)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err := cmd.Run()
	return stdout.String(), err, stderr.String()
}
