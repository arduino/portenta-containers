package main

import (
	"fmt"

	socketio "github.com/googollee/go-socket.io"
)

type Soc struct {
	*socketio.Server
}

func newSoc() *Soc {
	s, _ := socketio.NewServer(nil)
	soc := &Soc{s}

	soc.OnConnect("", func(c socketio.Conn) error {
		fmt.Println("connected:", c.ID())
		soc.JoinRoom("/", "bcast", c)
		soc.broadcast("log", "New connection")
		return nil
	})

	return soc
}

func (s *Soc) broadcast(e string, m string) {
	s.BroadcastToRoom("/", "bcast", e, m)
}
