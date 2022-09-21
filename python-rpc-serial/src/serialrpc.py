import sys
import traceback

from serial import Serial
from serial.threaded import LineReader, ReaderThread
from msgpackrpc import Address as RpcAddress, Client as RpcClient, server as RpcServer

# The user-facing, Serial over USB, UART device
user_uart = '/dev/ttyGS0'

# The M4 Proxy address needs to be mapped via Docker's extra hosts
m4_proxy_host = 'm4-proxy'
m4_proxy_register_port = 5000
m4_proxy_call_port = 5001


# Check this port to be published by the docker client and/or in the docker-compose.yml
rpc_server_host = 'localhost'
rpc_server_port = 5002


class LineToRPC(LineReader):
    def __init__(self):
        super().__init__()
        self.rpc_address = RpcAddress(m4_proxy_host, m4_proxy_call_port)

    def connection_made(self, transport):
        super(LineToRPC, self).connection_made(transport)
        sys.stdout.write('port opened\n')

    def handle_line(self, data):
        sys.stdout.write(f'line received: {repr(data)}\n')
        __client = RpcClient(self.rpc_address)
        __client.call('tty', data)
        __client.close()

    def connection_lost(self, exc):
        if exc:
            traceback.print_exc(exc)
        sys.stdout.write('port closed\n')


class SerialRPCOut(object):
    def __init__(self, serial):
        self.rxbuffer = bytearray()
        self.serial = serial

    def tty(self, msg):
        self.rxbuffer += bytearray(msg)
        if self.rxbuffer.endswith(b'\r\n'):
            output = self.rxbuffer
            self.serial.write(output)
            self.rxbuffer.clear()

    def echo(self, msg):
        self.serial.write(msg)


if __name__ == '__main__':

    print(f'Connecting to {m4_proxy_host}:{m4_proxy_register_port}')

    # Start the Serial Line Reader thread
    ser_to_rpc = Serial(user_uart, baudrate=115200, bytesize=8,
                        parity='N', stopbits=1, timeout=None, xonxoff=0, rtscts=0)
    reader = ReaderThread(ser_to_rpc, LineToRPC)
    reader.start()

    # Register to m4-proxy for 'tty' and 'echo' procedures
    client = RpcClient(RpcAddress(m4_proxy_host, m4_proxy_register_port))
    result = client.call('register', rpc_server_port, ['tty', 'echo'])
    client.close()

    # Start the MessagePack-RPC server
    print(f'Starting MsgPackRPC Server on {rpc_server_host}:{rpc_server_port}')
    rpc_server = RpcServer.Server(SerialRPCOut(ser_to_rpc))
    rpc_server_address = RpcAddress(rpc_server_host, rpc_server_port)
    rpc_server.listen(rpc_server_address)
    rpc_server.start()
