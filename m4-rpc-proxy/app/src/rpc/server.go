package rpc

import (
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"os/exec"
	"reflect"

	msgpack "github.com/facchinm/msgpack-go"
)

type Server struct {
	resolver     FunctionResolver
	log          *log.Logger
	listeners    []net.Listener
	autoCoercing bool
	lchan        chan int
	port         uint
}

var proxyname string = "m4-proxy"

func (self *Server) Register() {

	// if Proxy is started outside a container, m4-proxy will be localhost
	// ping m4-proxy, if failed then m4-proxy is localhost
	// if ping success, then m4-proxy is m4-proxy
	if err := exec.Command("ping", "-c", "1", proxyname).Run(); err != nil {
		fmt.Println("Proxy is localhost")
		proxyname = "localhost"
	}
	conn, _ := net.Dial("tcp", proxyname+":5000")
	client := NewSession(conn, true)

	client.Call("register", self.port, self.resolver.Functions())
}

// Goes into the event loop to get ready to serve.
func (self *Server) Run() *Server {
	lchan := make(chan int)
	for _, listener := range self.listeners {
		go (func(listener net.Listener) {
			for {
				conn, err := listener.Accept()
				if err != nil {
					self.log.Println(err)
					continue
				}
				if self.lchan == nil {
					conn.Close()
					break
				}
				go (func() {
				NextRequest:
					for {
						data, _, err := msgpack.UnpackReflected(conn)
						if err == io.EOF {
							break
						} else if err != nil {
							self.log.Println(err)
							break
						}
						msgId, funcName, _arguments, msgType, xerr := HandleRPCRequest(data)
						if xerr != nil {
							self.log.Println(xerr)
							continue NextRequest
						}
						f, xerr := self.resolver.Resolve(funcName, _arguments)
						if xerr != nil {
							self.log.Println(xerr)
							SendErrorResponseMessage(conn, msgId, xerr.Error())
							continue NextRequest
						}
						funcType := f.Type()
						if funcType.NumIn() != len(_arguments) {
							msg := fmt.Sprintf("The number of the given arguments (%d) doesn't match the arity (%d)", len(_arguments), funcType.NumIn())
							self.log.Println(msg)
							SendErrorResponseMessage(conn, msgId, msg)
							continue NextRequest
						}
						if funcType.NumOut() != 1 && funcType.NumOut() != 2 {
							self.log.Println("The number of return values must be 1 or 2")
							SendErrorResponseMessage(conn, msgId, "Internal server error")
							continue NextRequest
						}

						arguments := make([]reflect.Value, funcType.NumIn())
						for i, v := range _arguments {
							ft := funcType.In(i)
							vt := v.Type()
							if vt.AssignableTo(ft) {
								arguments[i] = v
							} else if pv, ok := integerPromote(ft, v); ok {
								arguments[i] = pv
							} else if self.autoCoercing && ft != nil && ft.Kind() == reflect.String && (v.Type().Kind() == reflect.Array || v.Type().Kind() == reflect.Slice) && v.Type().Elem().Kind() == reflect.Uint8 {
								arguments[i] = reflect.ValueOf(string(v.Interface().([]byte)))
							} else {
								msg := fmt.Sprintf("The type of argument #%d doesn't match (%s expected, got %s)", i, ft.String(), vt.String())
								self.log.Println(msg)
								SendErrorResponseMessage(conn, msgId, msg)
								continue NextRequest
							}
						}

						retvals := f.Call(arguments)
						if funcType.NumOut() == 1 {
							if msgType == REQUEST {
								SendResponseMessage(conn, msgId, retvals[0])
							}
							continue NextRequest
						}
						var errMsg fmt.Stringer = nil
						_errMsg := retvals[1].Interface()
						if _errMsg != nil {
							var ok bool
							errMsg, ok = _errMsg.(fmt.Stringer)
							if !ok {
								self.log.Println("The second argument must have an interface { String() string }")
								SendErrorResponseMessage(conn, msgId, "Internal server error")
								continue NextRequest
							}
						}
						if errMsg != nil {
							SendErrorResponseMessage(conn, msgId, errMsg.String())
							continue NextRequest
						}
						if self.autoCoercing {
							_retval := retvals[0]
							if _retval.Kind() == reflect.String {
								retvals[0] = reflect.ValueOf([]byte(_retval.String()))
							}
						}
						if msgType == REQUEST {
							SendResponseMessage(conn, msgId, retvals[0])
						}
					}
					conn.Close()
				})()
			}
		})(listener)
	}
	self.lchan = lchan
	<-lchan
	for _, listener := range self.listeners {
		listener.Close()
	}
	return self
}

// integerPromote determines if we can promote v to dType, and if so, return the promoted value.
// This is needed because msgpack always encodes values as the minimum sized int that can hold them.
func integerPromote(dType reflect.Type, v reflect.Value) (reflect.Value, bool) {

	vt := v.Type()
	dsz := dType.Size()
	vtsz := vt.Size()

	if isIntType(dType) && isIntType(vt) && vtsz <= dsz {
		pv := reflect.New(dType).Elem()
		pv.SetInt(v.Int())
		return pv, true
	}

	if isUintType(dType) && isUintType(vt) && vtsz <= dsz {
		pv := reflect.New(dType).Elem()
		pv.SetUint(v.Uint())
		return pv, true
	}

	if isIntType(dType) && isUintType(vt) && vtsz <= dsz {
		pv := reflect.New(dType).Elem()
		pv.SetInt(int64(v.Uint()))
		return pv, true
	}

	if isUintType(dType) && isIntType(vt) && vtsz <= dsz {
		pv := reflect.New(dType).Elem()
		pv.SetUint(uint64(v.Int()))
		return pv, true
	}

	return v, false
}

type kinder interface {
	Kind() reflect.Kind
}

func isIntType(t kinder) bool {
	return t.Kind() == reflect.Int ||
		t.Kind() == reflect.Int8 ||
		t.Kind() == reflect.Int16 ||
		t.Kind() == reflect.Int32 ||
		t.Kind() == reflect.Int64
}

func isUintType(t kinder) bool {
	return t.Kind() == reflect.Uint ||
		t.Kind() == reflect.Uint8 ||
		t.Kind() == reflect.Uint16 ||
		t.Kind() == reflect.Uint32 ||
		t.Kind() == reflect.Uint64
}

// Lets the server quit the event loop
func (self *Server) Stop() *Server {
	if self.lchan != nil {
		lchan := self.lchan
		self.lchan = nil
		lchan <- 1
	}
	return self
}

// Listens on the specified transport.  A single server can listen on the
// multiple ports.
func (self *Server) Listen(listener net.Listener) *Server {
	self.listeners = append(self.listeners, listener)
	return self
}

// Creates a new Server instance. raw bytesc are automatically converted into
// strings if autoCoercing is enabled.
func NewServer(resolver FunctionResolver, autoCoercing bool, _log *log.Logger, port uint) *Server {
	if _log == nil {
		_log = log.New(os.Stderr, "msgpack: ", log.Ldate|log.Ltime)
	}
	return &Server{resolver, _log, make([]net.Listener, 0), autoCoercing, nil, port}
}

// This is a low-level function that is not supposed to be called directly
// by the user.  Change this if the MessagePack protocol is updated.
func HandleRPCRequest(req reflect.Value) (int, string, []reflect.Value, int, error) {
	for {
		_req, ok := req.Interface().([]reflect.Value)
		if !ok {
			break
		}
		index := 0
		if len(_req) > 4 && len(_req) < 3 {
			break
		}
		msgType := _req[index]
		typeOk := msgType.Kind() == reflect.Int || msgType.Kind() == reflect.Int8 || msgType.Kind() == reflect.Int16 || msgType.Kind() == reflect.Int32 || msgType.Kind() == reflect.Int64
		if !typeOk {
			fmt.Println("msgType")
			fmt.Println(msgType)
			break
		}
		index++
		var msgId reflect.Value
		if msgType.Int() == REQUEST {
			msgId = _req[index]
			idOk := msgId.Kind() == reflect.Int || msgId.Kind() == reflect.Int8 || msgId.Kind() == reflect.Int16 || msgId.Kind() == reflect.Int32 || msgId.Kind() == reflect.Int64 || msgId.Kind() == reflect.Uint32
			if !idOk {
				fmt.Println("msgId")
				fmt.Println(msgId)
				fmt.Println(msgId.Kind())
				break
			}
			index++
		}
		_funcName := _req[index]
		funcOk := _funcName.Kind() == reflect.Array || _funcName.Kind() == reflect.Slice
		if !funcOk {
			fmt.Println("_funcName")
			fmt.Println(_funcName)
			break
		}
		funcName, ok := _funcName.Interface().([]uint8)
		if !ok {
			fmt.Println("funcName not ok")
			break
		}
		if msgType.Int() != REQUEST && msgType.Int() != NOTIFICATION {
			break
		}
		index++
		_arguments := _req[index]
		var arguments []reflect.Value
		if _arguments.Kind() == reflect.Array || _arguments.Kind() == reflect.Slice {
			elemType := _req[index].Type().Elem()
			_elemType := elemType
			ok := isUintType(_elemType)
			if !ok || _elemType.Kind() != reflect.Uint8 {
				arguments, ok = _arguments.Interface().([]reflect.Value)
			} else {
				arguments = []reflect.Value{reflect.ValueOf(string(_req[index].Interface().([]byte)))}
			}
		} else {
			arguments = []reflect.Value{_req[index]}
		}
		if isUintType(msgId) {
			return int(msgId.Uint()), string(funcName), arguments, int(msgType.Int()), nil
		} else if isIntType(msgId) {
			return int(msgId.Int()), string(funcName), arguments, int(msgType.Int()), nil
		} else {
			return int(0), string(funcName), arguments, int(msgType.Int()), nil
		}
	}
	return 0, "", nil, 0, errors.New("Invalid message format")
}

// This is a low-level function that is not supposed to be called directly
// by the user.  Change this if the MessagePack protocol is updated.
func SendResponseMessage(writer io.Writer, msgId int, value reflect.Value) error {

	_, err := writer.Write([]byte{0x94})
	if err != nil {
		return err
	}
	_, err = msgpack.PackInt8(writer, RESPONSE)
	if err != nil {
		return err
	}
	_, err = msgpack.PackInt(writer, msgId)
	if err != nil {
		return err
	}
	_, err = msgpack.PackNil(writer)
	if err != nil {
		return err
	}
	_, err = msgpack.PackValue(writer, value)
	return err
}

// This is a low-level function that is not supposed to be called directly
// by the user.  Change this if the MessagePack protocol is updated.
func SendErrorResponseMessage(writer io.Writer, msgId int, errMsg string) error {
	_, err := writer.Write([]byte{0x94})
	if err != nil {
		return err
	}
	_, err = msgpack.PackInt8(writer, RESPONSE)
	if err != nil {
		return err
	}
	_, err = msgpack.PackInt(writer, msgId)
	if err != nil {
		return err
	}
	_, err = msgpack.PackBytes(writer, []byte(errMsg))
	if err != nil {
		return err
	}
	_, err = msgpack.PackNil(writer)
	return err
}
