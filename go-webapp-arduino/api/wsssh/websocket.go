package wsssh

import (
	"fmt"
	"io"
	"net/http"

	"github.com/gorilla/websocket"
	log "github.com/inconshreveable/log15"
	"github.com/labstack/echo/v4"
)

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
)

func scanStdout(sshConnClosed chan bool, stdout io.Reader, ws *websocket.Conn) error {
	for {

		// Read the output, at maximum 4096 bites at a time
		buffer := make([]byte, 4096)
		lenght, err := stdout.Read(buffer)
		if err != nil {
			return fmt.Errorf("reading ouput: %w", err)
		}

		// If the SSH connection is closed colse the WS
		// Forward the output to the WS otherwise
		select {
		case closed := <-sshConnClosed:
			if closed {
				ws.Close()
				return nil
			}
		default:
			if lenght > 0 {
				log.Debug("Sending SSH output to WS", "data", fmt.Sprintf("%+q\n", buffer[:lenght]))

				err = ws.WriteMessage(websocket.TextMessage, buffer[:lenght])
				if err != nil {
					fmt.Println(": %w", err)
				}
			}
		}

	}
}

func HandleWebsocket(c echo.Context) error {
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return fmt.Errorf("unable to upgrade websocket: %w", err)
	}

	// Close WS connection after the main loop terminated
	defer ws.Close()

	// Channel to notify gotroutines waiting for SSH output that the
	// SSH connection closed
	sshConnClosed := make(chan bool)

	config := SSHConfig{
		HandleStdoutStderr: func(stdout io.Reader) {
			err := scanStdout(sshConnClosed, stdout, ws)
			if err != nil {
				log.Error("sending SSH output to WS", err, err)
			}
		},
		HandleClose: func() {
			sshConnClosed <- true
			log.Debug("connection closed by client")
			ws.Close()
		},
	}

	session, err := Connect(&config)
	if err != nil {
		log.Error("connect via SSH", "err", err)
	}

	err = session.CreatePty()
	if err != nil {
		log.Error("create PTY", "err", err)
	}

	err = session.Start()
	if err != nil {
		log.Error("start SSH session", "err", err)
	}

	defer session.Disconnect()

	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			log.Error("Error during message reading:", "err", err)
			break
		}

		log.Debug("Sending WS input to SSH", "data", fmt.Sprintf("%+q\n", message))

		err = session.Write([]byte(message))
		if err != nil {
			log.Error("write WS message to SSH", "err", err)
			break
		}
	}

	return nil
}
