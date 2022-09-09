#!/usr/bin/env python3

from bluepy.btle import Scanner, DefaultDelegate
import os

class ScanDelegate(DefaultDelegate):
    def __init__(self):
        DefaultDelegate.__init__(self)

    def handleDiscovery(self, dev, isNewDev, isNewData):
        if isNewDev:
            print(f'Discovered device {dev.addr}')
        elif isNewData:
            print(f'Received new data from {dev.addr}')

os.system('hciconfig hci0 up')

scanner = Scanner().withDelegate(ScanDelegate())
devices = scanner.scan(10.0)

for dev in devices:
    print(f'Device {dev.addr} ({dev.addrType}), RSSI={dev.rssi} dB')
    for (adtype, desc, value) in dev.getScanData():
        # print " %s = %s" % (desc, value)
        print(f'{desc} = {value}') 
