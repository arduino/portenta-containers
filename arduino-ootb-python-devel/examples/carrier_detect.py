#!/usr/bin/env python3

# Carrier board detect

# A simple script to print the carrier board model name
# detected during boot

# Circuit:
# * Place Portenta-X8 on a carrier

# created 18 March 2022
# by Massimo Pennazio

import os

print("Detected board: %s" % os.environ['BOARD'])
print("Are we on a carrier board? %s" % os.environ['IS_ON_CARRIER'])
if os.environ['IS_ON_CARRIER'] == "yes":
    print("Detected carrier board: %s" % os.environ['CARRIER_NAME'])
else:
    print("No carrier board detected.")
