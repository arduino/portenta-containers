"""
This is the Portenta X8/M4 to Arduino IoT Cloud Python application,
a simple weather station that reads environmental data from a BME280
sensor connected via I2C to the M4 MCU and publish the measures to
an Arduino IoT Cloud Thing via authenticated MQTT/S.

The accompaining Arduino sketch must be upload to the M4 via the usual
Arduino tools before deploying the application.

You also need to provide a pair of configuration files via the `fioctl`
secure configuration mechanism.
"""

import time
import json

from certifi import where as CaCerts

from msgpackrpc import Address as RpcAddress, Client as RpcClient, error as RpcError

from kpn_senml import SenmlPack, SenmlRecord, SenmlNames

from paho.mqtt import client as MqttClient


# Fixed configuration parameters
broker = 'mqtts-sa.iot.arduino.cc'
port = 8884
publish_interval = 5

# The M4 Proxy address needs to be mapped via Docker's extra hosts
m4_proxy_address = 'm4-proxy'
m4_proxy_port = 5001


def read_config_files():
    """Read configuration from `devices.json` and `thing.json`.

    You need to generate the two configuration files while creating
    the Device and the Thing both with `arduino-cloud-cli` tool or following
    the Arduino IoT Cloud web procedure.

    The application expects the configuration files in the `config` directory,
    bound to `/app/config` by docker-compose from `fioctl`'s `/var/run/secrets`
    configuration directory

    Please, refer to README for further information.
    """

    config = {}

    print('Looking for device.json and thing.json configuration files...')

    try:
        with open('config/device.json', 'r') as d, open('config/thing.json', 'r') as t:
            config['device'] = json.load(d)
            config['thing'] = json.load(t)
    except FileNotFoundError:
        print('Configuration files not found.')
        print('Please, use fioctl to set configuration files...')
    except json.decoder.JSONDecodeError:
        print('Error in configuration files.')
        print('Please, check and update...')

    return config


def get_config():
    """Render the configuration parameters from the secret config files"""
    config = {}
    ret = ()

    config = read_config_files()

    if config:
        try:
            device_name = config['device']['name']
            device_id = config['device']['id']

            password = config['device']['secret_key']

            thing_id = config['thing']['id']

            topic = f'/a/t/{thing_id}/e/o'
            client_id = f'a:app:{device_id}:{device_name}'

            ret = client_id, device_id, password, topic

        except KeyError:
            print('Wrong format of configuration files.')
            print('Please, use arduino-cloud-cli to generate them.')

    return ret


def get_data_from_m4():
    """Get data from the M4 via RPC (MessagePack-RPC)

    The Arduino sketch on the M4 must implement the following methods
    returning the suitable values from the attached sensor:

    * `temperature`
    * `humidity`
    * `pressure`

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

        data = temperature, humidity, pressure

    except RpcError.TimeoutError:
        print("Unable to retrive data from the M4.")

    return data


def create_senml_cbor():
    """Read the data from the M4 and generate the SenML/CBOR message"""
    pack = SenmlPack('')

    data = get_data_from_m4()
    if not data:
        return b''

    temperature, humidity, pressure = data

    temperature_senml = SenmlRecord(
        SenmlNames.KPN_SENML_TEMPERATURE, value=temperature)
    humidity_senml = SenmlRecord(
        SenmlNames.KPN_SENML_HUMIDITY, value=humidity)
    pressure_senml = SenmlRecord(
        SenmlNames.KPN_SENML_PRESSURE, value=pressure)

    pack.add(temperature_senml)
    pack.add(humidity_senml)
    pack.add(pressure_senml)

    cbor = pack.to_cbor()

    return cbor


def connect_mqtt(client_id, username, password):
    """Create an MQTT/S connection to the Arduino IoT Cloud MQTT Broker"""
    def on_connect(_client, _userdata, _flags, rc):
        if rc == 0:
            print('Connected.')
        else:
            print(f'Unable to connect [{rc}].')

    client = MqttClient.Client(client_id, clean_session=True)
    client.on_connect = on_connect

    # Mandatory for TLS connection
    client.tls_set(CaCerts())

    client.username_pw_set(username, password)
    client.connect(broker, port)

    return client


def publish(client, topic, data):
    """Publish the SenML/CBOR message to the Arduino IoT Cloud MQTT Broker"""
    if not data:
        print('No data to send. Please, check the M4 sketch and RPC.')
        return

    result = client.publish(topic, data)
    status = result[0]
    if status == 0:
        print(f'Sent {len(data)} bytes: {data.hex()}')
    else:
        print(f"Failed to send message [{status}]")


if __name__ == '__main__':

    print()
    print("============================================")
    print("==       Portenta X8 Weather Station      ==")
    print("== An M4 to Arduino IoT Cloud application ==")
    print("============================================")
    print()

    config = ()

    while not config:
        config = get_config()
        time.sleep(5)

    client_id, username, password, topic = config

    print("Connecting to Arduino IoT Cloud Broker...")
    print(f'Client ID: {client_id}')
    print(f'Username: {username}')
    client = connect_mqtt(client_id, username, password)
    client.loop_start()

    while not client.is_connected():
        print("Waiting for broker connection...")
        time.sleep(1)

    print(f'Start publishing data every {publish_interval} seconds to {topic}')
    try:
        while True:
            data = create_senml_cbor()
            publish(client, topic, data)
            time.sleep(publish_interval)
    except KeyboardInterrupt:
        print('Stopped.')
