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

# @TODO: read all gpios
