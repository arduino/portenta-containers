package utils

import (
	"bytes"
	"fmt"
	"os/exec"
)

func ExecSh(command string) (string, error) {
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd := exec.Command("sh", "-c", command)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err := cmd.Run()
	if err != nil {
		return stderr.String(), fmt.Errorf("cmd: %w", err)
	}

	return stdout.String(), nil
}
