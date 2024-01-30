package utils

import (
	"bytes"
	"errors"
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
		if errors.Is(err, err.(*exec.ExitError)) {
			return "", nil
		}
		return stderr.String(), fmt.Errorf("cmd: %w", err)
	}

	return stdout.String(), nil
}
