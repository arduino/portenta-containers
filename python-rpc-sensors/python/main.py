import time
from msgpackrpc import Address as RpcAddress, Client as RpcClient, error as RpcError

# Fixed configuration parameters
publish_interval = 5

# The M4 Proxy address needs to be mapped via Docker's extra hosts
m4_proxy_host = 'm4-proxy'
m4_proxy_call_port = 5001

def get_data_from_m4(rpc_client):
    """Get data from the M4 via RPC (MessagePack-RPC)

    The Arduino sketch on the M4 must implement the following methods
    returning the suitable values from the attached sensor:

    * `temperature`
    * `humidity`
    * `pressure`
    * `gas`
    * `altitude`

    """
    data = ()
    try:
        temperature = rpc_client.call('temperature')
        humidity = rpc_client.call('humidity')
        pressure = rpc_client.call('pressure')
        gas = rpc_client.call('gas')
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
        rpc_address = RpcAddress(m4_proxy_host, m4_proxy_call_port)
        rpc_client = RpcClient(rpc_address)
        while True:
            data = get_data_from_m4(rpc_client)
            if len(data) > 0:
                print("Temperature: ", data[0])
                print("Humidity: ", data[1])
                print("Pressure: ", data[2])
                print("Gas: ", data[3])
                print("Altitude: ", data[4])
            time.sleep(publish_interval)
    except Exception as e:
        print(f"Failed to create RpcClient: {e}")
