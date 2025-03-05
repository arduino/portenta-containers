# This file is part of the Python Arduino IoT Cloud.
# Any copyright is dedicated to the Public Domain.
# https://creativecommons.org/publicdomain/zero/1.0/
import time
import logging
from time import strftime
from arduino_iot_cloud import ArduinoCloudClient
from arduino_iot_cloud import Location
from arduino_iot_cloud import Schedule
from arduino_iot_cloud import ColoredLight
from arduino_iot_cloud import Task
from random import uniform
import argparse
import arduino_iot_cloud.ussl as ssl
import json

CA_CERT_FILE = "/etc/ssl/certs/ca-cert-Arduino.pem"
ARDUINO_IOT_CLOUD_CONFIG_FILE = "/var/sota/iot-config.json"

def get_cpu_temp():
    # Read CPU temperature from sysfs
    tempFile = open( "/sys/class/thermal/thermal_zone0/temp" )
    cpu_temp = tempFile.read()
    tempFile.close()
    return round(float(cpu_temp)/1000, 2)

def user_task(client):
    # NOTE: this function should not block.
    # This is a user-defined task that updates the colored light. Note any registered
    # cloud object can be accessed using the client object passed to this function.
    client["led"] ^= 1
    client["temperature"] = get_cpu_temp()

if __name__ == "__main__":
    # Parse command line args.
    parser = argparse.ArgumentParser(description="arduino_iot_cloud.py")
    parser.add_argument("-d", "--debug", action="store_true",  help="Enable debugging messages")
    args = parser.parse_args()

    # Assume the host has an active Internet connection.

    # Configure the logger.
    # All message equal or higher to the logger level are printed.
    # To see more debugging messages, pass --debug on the command line.
    logging.basicConfig(
        datefmt="%H:%M:%S",
        format="%(asctime)s.%(msecs)03d %(message)s",
        level=logging.DEBUG if args.debug else logging.INFO,
    )

    # Load configuration from iot-config.json file
    try:
        with open(ARDUINO_IOT_CLOUD_CONFIG_FILE) as json_file:
            json_data = json.load(json_file)
            device_id = str.encode(json_data['device_id'])
            pin = json_data['pin']
            key_uri = json_data['key_uri']
            cert_uri = json_data['cert_uri']
    except (FileNotFoundError, KeyError):
        logging.error("Failed to load configuratio from %s" % ARDUINO_IOT_CLOUD_CONFIG_FILE)
        logging.error("Register your board before running this script")
        exit()

    # Create a client object to connect to the Arduino IoT cloud.
    # To use a secure element, set the token's "pin" and URI in "keyfile" and "certfile", and
    # the CA certificate (if any) in "ssl_params". Alternatively, a username and password can
    # be used to authenticate, for example:
    #   client = ArduinoCloudClient(device_id=b"DEVICE_ID", username=b"DEVICE_ID", password=b"SECRET_KEY")
    client = ArduinoCloudClient(
        device_id=device_id,
        ssl_params={
            "pin": pin,
            "keyfile": key_uri, "certfile": cert_uri, "cafile": CA_CERT_FILE, "cert_reqs": ssl.CERT_REQUIRED,
            "module_path": "/usr/lib/libckteec.so.0"
        },
    )

    # Register cloud objects.
    client.register("led", value=True)
    client.register("temperature")

    # The client can also schedule user code in a task and run it along with the other cloud objects.
    # To schedule a user function, use the Task object and pass the task name and function in "on_run"
    # to client.register().
    client.register(Task("user_task", on_run=user_task, interval=1.0))

    # Start the Arduino IoT cloud client.
    client.start()
