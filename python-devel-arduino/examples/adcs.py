#!/usr/bin/env python3

# Read all adcs

# A simple script to print all the adcs on
# the corresponding connector of the Breakout carrier

# Circuit:
# * Place Portenta-X8 on a Breakout carrier
# * All adcs accepts 0.0v - 3.3v input range
# * Interface returns raw 16bit adc values

# created 18 March 2022
# by Massimo Pennazio

import os

def read_adc_channel(ch: int):
    value = 0
    if ch < 0 or ch > 7:
        return -1
    path = '/sys/bus/iio/devices/iio:device0/in_voltage%s_raw' % ch
    with open(path) as f:
        value = int(f.read())
    return value

if os.environ['CARRIER_NAME'] != "breakout":
    print("This script requires Breakout carrier")
    exit(1)

for i in range(0, 7):
    print("Channel A%s = %d" % (i, read_adc_channel(i)))

