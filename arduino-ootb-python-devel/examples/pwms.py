#!/usr/bin/env python3

# Set all pwms to 1k frequency and 50% duty

# A simple script to set all the pwms on
# the corresponding connector of the Breakout carrier

# Circuit:
# * Place Portenta-X8 on a Breakout carrier
# * All pwms have 0.0v - 3.3v output range

# created 18 March 2022
# by Massimo Pennazio

import os
from periphery import PWM

if os.environ['CARRIER_NAME'] != "breakout":
    print("This script requires Breakout carrier")
    exit(1)

from periphery import PWM

pwm = [None] * 10
for i in range(0, 9):
    pwm[i] = PWM(0, i)
    pwm[i].frequency = 1e3
    pwm[i].duty_cycle = 0.5
    pwm[i].enable()
