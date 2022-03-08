package wsssh

import (
	"fmt"
	"io"
	"io/ioutil"
	"os"

	log "github.com/inconshreveable/log15"
	"golang.org/x/crypto/ssh"
)

type SSHConfig struct {
	HandleStdoutStderr func(stdout io.Reader)
	HandleClose        func()
}

type SSHConnection struct {
	client  *ssh.Client
	session *ssh.Session
	stdin   io.WriteCloser
	config  *SSHConfig
}

// Returns a Signer to authenticate via SSH
func prepareKeys(p string) (ssh.Signer, error) {
	key, err := ioutil.ReadFile(p)
	if err != nil {
		return nil, fmt.Errorf("unable to read private key: %w", err)
	}

	signer, err := ssh.ParsePrivateKey(key)
	if err != nil {
		return nil, fmt.Errorf("unable to parse private key: %w", err)
	}

	return signer, nil
}

// Connects via SSH to the target machine, and creates a session.
func Connect(c *SSHConfig) (*SSHConnection, error) {
	sshHost := os.Getenv("SSH_HOST")
	sshUser := os.Getenv("SSH_USER")
	sshKey := os.Getenv("SSH_KEY")

	log.Info("ssh env variables", "Host", sshHost, "User", sshUser, "Key", sshKey)

	signer, err := prepareKeys(sshKey)
	if err != nil {
		return nil, fmt.Errorf("unable to read the private key: %w", err)
	}

	sshConfig := &ssh.ClientConfig{
		User:            sshUser,
		Auth:            []ssh.AuthMethod{ssh.PublicKeys(signer)},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}

	client, err := ssh.Dial("tcp", sshHost, sshConfig)
	if err != nil {
		return nil, fmt.Errorf("unable to dial SSH host: %w", err)
	}

	log.Info("connected to SSH")

	session, err := client.NewSession()
	if err != nil {
		client.Close()
		return nil, fmt.Errorf("unable to create a SSH session: %w", err)
	}

	log.Info("created a SSH session")

	conn := SSHConnection{
		session: session,
		client:  client,
		config:  c,
	}

	return &conn, err
}

// Creates a Pseudo-terminal
func (s *SSHConnection) CreatePty() error {
	modes := ssh.TerminalModes{
		ssh.ECHO:          1,     // enable echoing
		ssh.TTY_OP_ISPEED: 14400, // input speed = 14.4kbaud
		ssh.TTY_OP_OSPEED: 14400, // output speed = 14.4kbaud
	}

	err := s.session.RequestPty("xterm", 80, 40, modes)
	if err != nil {
		s.session.Close()
		return fmt.Errorf("unable to create PTY: %w", err)
	}

	err = s.setupIO()
	if err != nil {
		s.session.Close()
		return fmt.Errorf("unable setup IO: %w", err)
	}

	return nil
}

func (s *SSHConnection) setupIO() error {
	stdin, err := s.session.StdinPipe()
	if err != nil {
		return fmt.Errorf("unable tu getsStdin pipe: %w", err)
	}

	stdout, err := s.session.StdoutPipe()
	if err != nil {
		return fmt.Errorf("unable tu get stdout pipe: %w", err)
	}

	stderr, err := s.session.StderrPipe()
	if err != nil {
		return fmt.Errorf("unable tu get stderr pipe: %w", err)
	}

	go s.config.HandleStdoutStderr(stdout)
	go s.config.HandleStdoutStderr(stderr)

	s.stdin = stdin

	return nil
}

func (s *SSHConnection) Start() error {
	err := s.session.Shell()
	if err != nil {
		return fmt.Errorf(": %w", err)
	}

	go func() {
		err := s.session.Wait()
		if err != nil {
			log.Warn("session exited", "err", err)
			s.client.Close()
			s.config.HandleClose()
			return
		}

		s.config.HandleClose()
		s.client.Close()

		log.Info("closed SSH session")
	}()

	return nil
}

func (s *SSHConnection) Write(b []byte) error {
	if s.stdin == nil {
		return fmt.Errorf("stdin is nil")
	}

	_, err := s.stdin.Write(b)
	if err != nil {
		return fmt.Errorf("writing to stdin: %w", err)
	}

	return nil
}

func (s *SSHConnection) Disconnect() {
	s.session.Close()
	s.client.Close()
	log.Info("closed SSH session")
}
