import time
from umqtt import MQTTClient
from kpn_senml import SenmlPack, SenmlRecord, SenmlNames

DEVICE_ID = b"6f5725f5-2254-4688-a084-7944c825b98e"

THING_ID = b"8b6ba1d5-51e3-47cd-8cf0-f1d23083f3ae"
THING_TOPIC_IN = b"/a/t/8b6ba1d5-51e3-47cd-8cf0-f1d23083f3ae/e/i"
THING_TOPIC_OUT = b"/a/t/8b6ba1d5-51e3-47cd-8cf0-f1d23083f3ae/e/o"

PKCS_URI="pkcs11:model=OP-TEE%20TA;manufacturer=Linaro;serial=0000000000000000;token=arduino"
KEY_URI="pkcs11:model=OP-TEE%20TA;manufacturer=Linaro;serial=0000000000000000;token=arduino;object=device-priv-key"
CERT_URI="pkcs11:model=OP-TEE%20TA;manufacturer=Linaro;serial=0000000000000000;token=arduino;object=device-certificate"
CA_PATH="ca-root.pem"

counter_val = 0
bool_val = True
control_val = True
pack = SenmlPack('')

def on_control_change(record):
    global control_val
    control_val = record.value
    print("Message from control widget received")

def sub_cb(topic, msg):
    global pack
    print((topic, msg))

    pack.from_cbor(msg)

def create_senml_cbor():
    global counter_val
    global control_val
    global bool_val
    global pack
    string_val = "Test Message "
    
    pack = SenmlPack('')

    temperature_senml = SenmlRecord("counter", value=counter_val)
    bool_senml = SenmlRecord("led", value=bool_val)

    string_val = string_val + str(counter_val)
    string_senml = SenmlRecord("message", value=string_val)

    control_senml = SenmlRecord("control", value=control_val, callback=on_control_change)

    counter_val += 1
    bool_val = not bool_val

    pack.add(temperature_senml)
    pack.add(bool_senml)
    pack.add(string_senml)
    pack.add(control_senml)

    cbor = pack.to_cbor()

    return cbor

def main():
    print("Connecting to Arduino IoT Cloud Broker...")
    c = MQTTClient(DEVICE_ID, "mqtts-sa.iot.oniudra.cc", port=8883, ssl=True,
            ssl_params={
            "ca_certs":CA_PATH,
            "certfile":CERT_URI,
            "keyfile":KEY_URI,
            "pin":"87654321",
            "ciphers":None})
    c.set_callback(sub_cb)
    c.connect()
    print("Subscribing to Arduino IoT Cloud thing topic...")
    c.subscribe(THING_TOPIC_IN)
    while True:
        print("Check data from Arduino IoT...")
        c.check_msg()
        print("Send data to Arduino IoT...")
        data = create_senml_cbor()
        c.publish(THING_TOPIC_OUT,data)
        time.sleep(1)

    c.disconnect()


if __name__ == "__main__":
    main()
