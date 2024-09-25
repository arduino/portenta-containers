import time
from msgpackrpc import Address as RpcAddress, Client as RpcClient, error as RpcError

# Fixed configuration parameters
port = 8884
publish_interval = 5

# The M4 Proxy address needs to be mapped via Docker's extra hosts
m4_proxy_address = 'm4-proxy'
m4_proxy_port = 5005

def get_data_from_m4():
    """Get data from the M4 via RPC (MessagePack-RPC)

    The Arduino sketch on the M4 must implement the following methods
    returning the suitable values from the attached sensor:

    * `temperature`
    * `humidity`
    * `pressure`
    * `gas`
    * `altitude`

    """
    rpc_address = RpcAddress(m4_proxy_address, m4_proxy_port)
    data = ()
    try:
        rpc_client = RpcClient(rpc_address)
        temperature = rpc_client.call('temperature')

        rpc_client = RpcClient(rpc_address)
        humidity = rpc_client.call('humidity')

        rpc_client = RpcClient(rpc_address)
        pressure = rpc_client.call('pressure')

        rpc_client = RpcClient(rpc_address)
        gas = rpc_client.call('gas')

        rpc_client = RpcClient(rpc_address)
        altitude = rpc_client.call('altitude')

        data = temperature, humidity, pressure, gas, altitude
    except RpcError.TimeoutError:
        print("Unable to retrive data from the M4.")

    return data

if __name__ == '__main__':

    print()
    print("============================================")
    print("==       Portenta X8 Sensor reading       ==")
    print("============================================")
    print()

    try:
        while True:
            data = get_data_from_m4()
            if len(data) > 0:
                print("Temperature: ", data[0])
                print("Humidity: ", data[1])
                print("Pressure: ", data[2])
                print("Gas: ", data[3])
                print("Altitude: ", data[4])
            time.sleep(publish_interval)
    except KeyboardInterrupt:
        print('Stopped.')
