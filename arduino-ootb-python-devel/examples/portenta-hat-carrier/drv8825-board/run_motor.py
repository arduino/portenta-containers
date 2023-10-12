#!/usr/bin/env python3

# Run a stepper motor!

# A simple script for the drv8825 HAT and the Portenta HAT carrier

# Circuit:
# * Place Portenta-X8 on a Portenta HAT carrier
# * Place drv8825 HAT on the Portenta HAT carrier
# * Wire the motor(s) poles using A1-A2, B1-B2 or A3-B3, A4-B4
# * Power-on the board using external power supply VIN-GND
# * Micro-stepping settings via DIPSW on the HAT

# Ref: https://www.waveshare.com/wiki/Stepper_Motor_HAT_(B)

# created 12 October 2023
# by Riccardo Mereu & Massimo Pennazio

import os

if os.environ['CARRIER_NAME'] != "rasptenta":
    print("This script requires Portenta HAT carrier")
    exit(1)

from rpi_python_drv8825.stepper import StepperMotor

motor = StepperMotor(enable_pin, step_pin, dir_pin, mode_pins, step_type, fullstep_delay)

motor.enable(True)        # enables stepper driver
motor.run(6400, True)     # run motor 6400 steps clowckwise
motor.run(6400, False)    # run motor 6400 steps counterclockwise
motor.enable(False)       # disable stepper driver
