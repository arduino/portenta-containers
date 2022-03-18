#!/usr/bin/env python3

# Read all gpios

# A simple script to print all the gpios on
# the corresponding connector of the Breakout carrier

# Circuit:
# * Place Portenta-X8 on a Breakout carrier
# * All gpios accepts 0.0v - 3.3v input range
# * Internal pull up are enabled by default on all input pins

# created 18 March 2022
# by Massimo Pennazio

import os
from periphery import GPIO

if os.environ['CARRIER_NAME'] != "breakout":
    print("This script requires Breakout carrier")
    exit(1)

gpio0 = GPIO("/dev/gpiochip5", 0, "in")
gpio1 = GPIO("/dev/gpiochip5", 1, "in")
gpio2 = GPIO("/dev/gpiochip5", 2, "in")
gpio3 = GPIO("/dev/gpiochip5", 3, "in")
gpio4 = GPIO("/dev/gpiochip5", 4, "in")
gpio5 = GPIO("/dev/gpiochip5", 5, "in")
gpio6 = GPIO("/dev/gpiochip5", 6, "in")

value0 = int(gpio0.read())
value1 = int(gpio1.read())
value2 = int(gpio2.read())
value3 = int(gpio3.read())
value4 = int(gpio4.read())
value5 = int(gpio5.read())
value6 = int(gpio6.read())

print("GPIO0 = %d" % value0)
print("GPIO1 = %d" % value1)
print("GPIO2 = %d" % value2)
print("GPIO3 = %d" % value3)
print("GPIO4 = %d" % value4)
print("GPIO5 = %d" % value5)
print("GPIO6 = %d" % value6)
