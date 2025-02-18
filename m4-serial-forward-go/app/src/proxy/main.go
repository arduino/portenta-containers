package main

import (
	"bytes"
	"fmt"
	"io"
	"net"
	"os"
	"reflect"
	"strconv"
	"time"

	"github.com/msgpack-rpc/msgpack-rpc-go/rpc"

	"github.com/facchinm/msgpack-go"
)

const (
	REQUEST      = 0
	RESPONSE     = 1
	NOTIFICATION = 2
)

type Resolver map[string]reflect.Value

func handleConnection(c net.Conn, chardev *os.File, resp chan []byte) {
	data, _, err := msgpack.Unpack(c)
	if err != nil {
		fmt.Println(err)
		return
	}

	var buf bytes.Buffer

	msgpack.Pack(&buf, data.Interface())
	chardev.Write(buf.Bytes())

	msgType := buf.Bytes()[1]

	if msgType == REQUEST {
		// wait to be unlocked by the other reading goroutine
		// TODO: add timeout handling
		select {
		case response := <-resp:
			//chardev.Read(response)
			c.Write(response)
		case <-time.After(1 * time.Second):
			c.Write(nil)
		}
	}
	if msgType == NOTIFICATION {
		// fire and forget
	}

	c.Close()
}

func chardevListener(chardev *os.File, resp chan []byte) {

	for {
		data := make([]byte, 1024)
		response := make([]byte, 1024)

		n, err := chardev.Read(data)

		data = data[:n]

		if err != nil {
			continue
		}
		if n <= 0 {
			continue
		}
		start := 0
		for {
			copy_data := data[start:]
			message, n, err := msgpack.UnpackReflected(bytes.NewReader(copy_data))
			start += n
			if err == io.EOF {
				break
			}

			_req, ok := message.Interface().([]reflect.Value)
			if !ok {
				continue
			}

			msgType := _req[0].Int()

			if msgType == RESPONSE {
				// unlock thread waiting on handleConnection
				resp <- copy_data[:n]
				continue
			}

			var msgFunction reflect.Value

			if msgType == REQUEST {
				msgFunction = _req[2]
			}

			if msgType == NOTIFICATION {
				msgFunction = _req[1]
			}

			method := string(msgFunction.Bytes())
			port := functionToPort(method)

			// REQUEST or NOTIFICATION
			conn, err := net.Dial("tcp", port)
			if err != nil {
				continue
			}
			_, err = conn.Write(copy_data[:n])
			if err != nil {
				fmt.Println(err)
				continue
			}

			if msgType == REQUEST {
				var to_send []byte
				i := 0
				for {
					n, err := conn.Read(response)
					conn.SetReadDeadline(time.Now().Add(100 * time.Millisecond))
					to_send = append(to_send, response[:n]...)
					i += n
					if err != nil {
						break
					}
				}
				chardev.Write(to_send[:i])
			}

			if msgType == NOTIFICATION {
				// fire and forget
			}

			conn.Close()
		}
	}
}

func (self Resolver) Resolve(name string, arguments []reflect.Value) (reflect.Value, error) {
	return self[name], nil
}

func (self Resolver) Functions() []string {
	var functions []string
	for el := range self {
		functions = append(functions, el)
	}
	return functions
}

var functions map[string]int

func functionToPort(function string) string {
	return ":" + strconv.Itoa(functions[function])
}

func register(port uint, arg []reflect.Value) string {
	for _, elem := range arg {
		functions[string(elem.Bytes())] = int(port)
	}
	fmt.Println("Registering service on port ", port, " with functions ", functions)
	return ""
}

func main() {

	functions = make(map[string]int)

	chardev, err := os.OpenFile("/dev/x8h7_ui", os.O_RDWR, 0)
	if (err != nil) {
		fmt.Println(err)
		return
	}

	chardev_reader_chan := make(chan []byte, 1024)

	l, err := net.Listen("tcp4", ":5001")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer l.Close()

	res := Resolver{"register": reflect.ValueOf(register)}

	go chardevListener(chardev, chardev_reader_chan)

	serv := rpc.NewServer(res, true, nil, 5000)
	lx, _ := net.Listen("tcp", ":5000")
	serv.Listen(lx)
	go serv.Run()

	for {
		c, err := l.Accept()
		if err != nil {
			fmt.Println(err)
			return
		}
		go handleConnection(c, chardev, chardev_reader_chan)
	}
}
