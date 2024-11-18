import time
from msgpackrpc import Address as RpcAddress, Client as RpcClient, error as RpcError

# Fixed configuration parameters
publish_interval = 5

# The M4 Proxy address needs to be mapped via Docker's extra hosts
m4_proxy_host = 'm4-proxy'
m4_proxy_call_port = 5001

def get_data_from_m4(rpc_address):
    """Get data from the M4 via RPC (MessagePack-RPC)

    The Arduino sketch on the M4 must implement the following methods
    returning the suitable values from the attached sensor:

    * `temperature`
    * `humidity`
    * `pressure`
    * `gas`
    * `altitude`

    WARNING: due to a known issue with msgpackrpc library, we can only
    make a single call after RpcClient. If we need to make multiple calls,
    we need to create a new RpcClient instance for each call.

    """
    data = ()
    sensors = ('temperature', 'humidity', 'pressure', 'gas', 'altitude')
    try:
        get_value = lambda value: RpcClient(rpc_address).call(value)
        data = tuple(get_value(measure) for measure in sensors)

    except RpcError.TimeoutError:
        print("Unable to retrieve data from the M4.")
    return data

if __name__ == '__main__':

    print()
    print("============================================")
    print("==       Portenta X8 Sensor reading       ==")
    print("============================================")
    print()

    try:
        rpc_address = RpcAddress(m4_proxy_host, m4_proxy_call_port)
        while True:
            data = get_data_from_m4(rpc_address)
            if len(data) > 0:
                print("Temperature: ", data[0])
                print("Humidity: ", data[1])
                print("Pressure: ", data[2])
                print("Gas: ", data[3])
                print("Altitude: ", data[4])
            time.sleep(publish_interval)
    except Exception as e:
        print(f"Failed to create RpcClient: {e}")
