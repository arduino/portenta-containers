package main

import (
	"fmt"
	"net"
	"os"
	"os/exec"
	"reflect"

	"github.com/msgpack-rpc/msgpack-rpc-go/rpc"
)

type Resolver map[string]reflect.Value

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

func echo(test string) (string, fmt.Stringer) {
	return "Hello, " + test, nil
}

func whoami() (string, fmt.Stringer) {
	out, _ := exec.Command("whoami").Output()
	return string(out), nil
}

func add(a, b uint) (uint, fmt.Stringer) {
	return a + b, nil
}

var proxyname string = "m4-proxy"

func serialportListener(serport *os.File) {
	for {
		data := make([]byte, 1024)
		n, err := serport.Read(data)

		if err != nil {
			continue
		}

		data = data[:n]

		conn, err := net.Dial("tcp", proxyname+":5001")
		client := rpc.NewSession(conn, true)
		xerr := client.Send("tty", data)
		if xerr != nil {
			continue
		}
	}
}

var serport *os.File

func tty(test []reflect.Value) fmt.Stringer {
	var temp []byte
	for _, elem := range test {
		temp = append(temp, byte(elem.Int()))
	}
	serport.Write(temp)
	return nil
}

func led(status uint) fmt.Stringer {
	conn, _ := net.Dial("tcp", proxyname+":5001")
	client := rpc.NewSession(conn, true)
	xerr := client.Send("led", status)
	if xerr != nil {
		fmt.Println(xerr)
	}
	return nil
}

func main() {

	exec.Command("stty", "-F", "/dev/ttyGS0", "raw")
	serport, _ = os.OpenFile("/dev/ttyGS0", os.O_RDWR, 0)

	// if Proxy is started outside a container, m4-proxy will be localhost
	// ping m4-proxy, if failed then m4-proxy is localhost
	// if ping success, then m4-proxy is m4-proxy
	if err := exec.Command("ping", "-c", "1", proxyname).Run(); err != nil {
		fmt.Println("Proxy is localhost")
		proxyname = "localhost"
	}

	// serialportListener listens to the serial port and forwards the data to the proxy

	go serialportListener(serport)

	res := Resolver{"echo": reflect.ValueOf(echo), "add": reflect.ValueOf(add), "tty": reflect.ValueOf(tty), "whoami": reflect.ValueOf(whoami), "led": reflect.ValueOf(led)}

	serv := rpc.NewServer(res, true, nil, 5002)
	l, _ := net.Listen("tcp", ":5002")
	serv.Listen(l)
	serv.Register()
	serv.Run()
}
