# The MIT License (MIT)
#
# Copyright (c) 2022 Arduino SA
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
# This file is part of the Python Arduino IoT Cloud.

import time

try:
    import logging
    import asyncio
except ImportError:
    import uasyncio as asyncio
    import ulogging as logging
if hasattr(time, "strftime"):
    from time import strftime
else:
    from ulogging.ustrftime import strftime
from aiotcloud import AIOTClient
from aiotcloud import Location
from aiotcloud import Schedule
from aiotcloud import ColoredLight
from random import randint, choice

import json

DEBUG_ENABLED = True

KEY_URI = "pkcs11:model=OP-TEE%20TA;manufacturer=Linaro;serial=0000000000000000;token=arduino;object=device-priv-key"
CERT_URI = "pkcs11:model=OP-TEE%20TA;manufacturer=Linaro;serial=0000000000000000;token=arduino;object=device-certificate"
CA_PATH = "/root/ca-root.pem"
JSONFILE = "/var/sota/iot-secrets.json"

async def user_main(aiot):
    """
    Add your code here.
    NOTE: To allow other tasks to run, this function must yield
    execution periodically by calling asyncio.sleep(seconds).
    """
    while True:
        # The composite cloud object's fields can be assigned to individually:
        #aiot["clight"].hue = randint(0, 100)
        #aiot["clight"].bri = randint(0, 100)
        #aiot["user"] = choice(["=^.. ^=", "=^ ..^="])
        await asyncio.sleep(1.0)


async def main():
    success=False
    try:
        with open(JSONFILE) as json_file:
            json_data = json.load(json_file)
            device_id = json_data['device_id']
            success=True
    except (FileNotFoundError, KeyError):
        logging.error("Failed to open/parse %s" % JSONFILE)
        success=False

    if success is True:
        aiot = AIOTClient(
            device_id=str.encode(device_id),
            ssl_params={"pin": "87654321", "keyfile": KEY_URI, "certfile": CERT_URI, "ca_certs": CA_PATH, "module_path": "/usr/lib/libckteec.so.0"},
        )

    # Start the AIoT client.
    await aiot.run(user_main)

if __name__ == "__main__":
    logging.basicConfig(
        datefmt="%H:%M:%S",
        format="%(asctime)s.%(msecs)03d %(message)s",
        level=logging.DEBUG if DEBUG_ENABLED else logging.INFO,
    )
    asyncio.run(main())
