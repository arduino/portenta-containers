#!/usr/bin/env python3

# Read all gpios

# A simple script to print all the gpios on
# the 40-pin connector of the Portenta HAT carrier

# Circuit:
# * Place Portenta-X8 on a Portenta HAT carrier
# * All gpios accepts 0.0v - 3.3v input range
# * Internal pull up are enabled by default on all input pins

# created 12 October 2023
# by Riccardo Mereu & Massimo Pennazio

import os

if os.environ['CARRIER_NAME'] != "rasptenta":
    print("This script requires Portenta HAT carrier")
    exit(1)

import Portenta.GPIO as GPIO

GPIO.setmode(GPIO.BCM)

all_pins_in_header = [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27]

GPIO.setup(all_pins_in_header, GPIO.IN)

for pin in all_pins_in_header:
    try:
        print(GPIO.input(pin))
    except RuntimeError as e:
        print("Error reading GPIO %s: %s" % (str(pin), str(e)))

GPIO.cleanup()
