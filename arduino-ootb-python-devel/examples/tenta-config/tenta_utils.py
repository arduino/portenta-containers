from subprocess import PIPE, Popen
from periphery import GPIO
from smbus2 import SMBus
from time import sleep
import re

class TentaUtils(object):

    def __init__(self):
        pass

    def scan_cameras(self, en_gpio_info, bus_number, address_list):
        device = None

        try:
            en_gpiochip = f"/dev/gpiochip{en_gpio_info[0]}"
            en_pin = en_gpio_info[1]
            gpio_obj = GPIO(en_gpiochip, en_pin, "out")
            gpio_obj.write(True)
            sleep(0.25)
        except (OSError, KeyError):
            return device

        bus = SMBus(bus_number)
        for address in address_list:
            try:
                bus.write_quick(int(address))
                device = address  
            except IOError:
                pass

        bus.close()
        gpio_obj.write(False)
        gpio_obj.close()

        return device

    # Read RPi HAT eeprom using standard RPi tools.
    # @TODO: investigate if a python library to read eeprom HAT format via i2c exists,
    # for example pihat is using cached information created by RPi OS in /proc/device-tree/hat
    # and is not directly accessing the eeprom via i2c bus
    def parse_eeprom(self, bus, addr):
        product_uuid = None
        product_id = None
        product_ver = None
        vendor = None
        product = None

        cmd = ["eepflash.sh",
            "--read",
            "-y",
            "--device="+str(bus),
            "--address="+hex(addr).split("0x")[1],
            "-t=24c256",
            "-f",
            "eeprom_settings.eep"]
        
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
        if p.returncode:
            return product_uuid, product_id, product_ver, vendor, product

        cmd = ["eepdump",
            "eeprom_settings.eep",
            "eeprom_settings.txt"]
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
        if p.returncode:
            return product_uuid, product_id, product_ver, vendor, product

        with open("eeprom_settings.txt") as file_handle:
            for line in file_handle:
                if line.startswith('product_uuid '):
                    product_uuid = line.split(' ')[1]
                elif line.startswith('product_id '):
                    product_id = line.split(' ')[1]
                elif line.startswith('product_ver '):
                    product_ver = line.split(' ')[1]
                elif line.startswith('vendor '):
                    vendor = re.search('"(.+?)"', line).group(1)
                elif line.startswith('product '):
                    product = re.search('"(.+?)"', line).group(1)
        return (product_uuid, product_id, product_ver, vendor, product)
    
    def provision_eeprom(self, bus, addr, eeprom_file):
        cmd = ["eepmake",
            eeprom_file,
            "eeprom_settings.eep"]
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
        if p.returncode:
            return 1

        cmd = ["eepflash.sh",
            "--write",
            "-y",
            "--device="+str(bus),
            "--address="+hex(addr).split("0x")[1],
            "-t=24c256",
            "-f",
            "eeprom_settings.eep"]
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
        if p.returncode:
            return 1
        return 0
    
    # @TODO: add fields in data to probe only usb devices
    # on pcie mini connector
    def scan_pcie_mini_connector(self):
        lspci_out = None
        lsusb_out = None
        cmd = ["lspci",
            "-t"]
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
        if p.returncode:
            return False, lspci_out, lsusb_out
        lspci_out = str(out,'utf-8')

        cmd = ["lsusb",
            "-t"]
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
        if p.returncode:
            return False, lspci_out, lsusb_out
        lsusb_out = str(out,'utf-8')
        return True, (lspci_out, lsusb_out)
    