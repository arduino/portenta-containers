package registration

import (
	"bytes"
	"os/exec"
)

type ErrorResponse struct {
	Error error `json:"error"`
}

func shellout(args ...string) (string, string, error) {
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	a := append([]string{"-c"}, args...)
	cmd := exec.Command("bash", a...)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}
