package registration

import (
	"bytes"
	"fmt"
	"os/exec"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func shellout(args ...string) (string, string, error) {
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	a := append([]string{"-c"}, args...)
	cmd := exec.Command("sh", a...)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err := cmd.Run()
	fmt.Println(stdout.String())
	fmt.Println(stderr.String())
	return stdout.String(), stderr.String(), err
}
