package utils

import (
	"bytes"
	"fmt"
	"os/exec"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func ExecSh(command string) (string, error) {
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd := exec.Command("sh", "-c", command)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err := cmd.Run()
	if err != nil {
		return stderr.String(), fmt.Errorf("(command: %s) cmd: %w", command, err)
	}

	return stdout.String(), nil
}
