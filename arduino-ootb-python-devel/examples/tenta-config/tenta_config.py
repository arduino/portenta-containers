#!/usr/bin/env python3

# tenta-config is a whiptail-powered hardware configurator
#
# for Rasptenta linux boards!!!
#
# It can also run in a tiny Alpine docker container.
#
# created November 2023
# by Massimo Pennazio

from whiptail import Whiptail
from subprocess import PIPE, Popen
from smbus2 import SMBus
from periphery import GPIO
from time import sleep
import re

### TENTA_CONFIG class definition
class TENTA_CONFIG():
    def __init__(self):
        print("Init")
        self.BREAKOUT = 0
        self.MAX = 1
        self.HAT = 2
        self.MID = 3
        self.AUTO = 4
        self.DUMP = 5
        self.RESET = 6
        self.EXIT = 7

        self.portenta_breakout_carrier = {
            "sku": "ASX00031",
            "name": "breakout",
            "name_full": "Portenta Breakout Carrier",
            "prefix": "ov_carrier_breakout",
            "overlays_base": "ov_som_lbee5kl1dx ov_som_x8h7 " \
                    "ov_carrier_breakout_gpio " \
                    "ov_carrier_breakout_i2s " \
                    "ov_carrier_breakout_sai " \
                    "ov_carrier_breakout_pdm " \
                    "ov_carrier_breakout_pwm " \
                    "ov_carrier_breakout_sdc " \
                    "ov_carrier_breakout_spdif " \
                    "ov_carrier_breakout_spi0 " \
                    "ov_carrier_breakout_spi1 " \
                    "ov_carrier_breakout_uart1 " \
                    "ov_carrier_breakout_uart3 " \
                    "ov_carrier_breakout_usbfs",
            "has_eeprom": False,
            "eeprom_i2c": {"bus": None, "addr": None, "file": None},
            "has_hat": False,
            "hat_eeprom_i2c": {"bus": None, "addr": None},
            "camera_i2c": {"bus": 2, "addr": None},
            "camera_en": {"dev": None, "pin": None}
        }

        self.portenta_max_carrier = {
            "sku": "ABX00043",
            "name": "max",
            "name_full": "Portenta Max Carrier",
            "prefix": "ov_carrier_max",
            "overlays_base": "ov_som_lbee5kl1dx ov_som_x8h7 " \
                    "ov_carrier_enuc_bq24195 " \
                    "ov_carrier_max_usbfs " \
                    "ov_carrier_max_sdc " \
                    "ov_carrier_max_cs42l52 " \
                    "ov_carrier_max_sara-r4 " \
                    "ov_carrier_enuc_lora " \
                    "ov_carrier_max_pcie_mini",
            "has_eeprom": False,
            "eeprom_i2c": {"bus": None, "addr": None, "file": None},
            "has_hat": False,
            "hat_eeprom_i2c": {"bus": None, "addr": None},
            "camera_i2c": {"bus": 2, "addr": None},
            "camera_en": {"dev": "/dev/gpiochip3", "pin": 20}
        }

        self.portenta_hat_carrier = {
            "sku": "ASX00049",
            "name": "rasptenta",
            "name_full": "Portenta HAT Carrier",
            "prefix": "ov_carrier_rasptenta",
            "overlays_base": "ov_som_lbee5kl1dx ov_som_x8h7 ov_carrier_rasptenta_base ov_carrier_rasptenta_spi",
            "overlays_base_no_spidev": "ov_som_lbee5kl1dx ov_som_x8h7 ov_carrier_rasptenta_base",
            "has_eeprom": True,
            "eeprom_i2c": {"bus": 1, "addr": 0x50, "file": "portenta_hat_carrier.txt"},
            "has_hat": True,
            "hat_eeprom_i2c": {"bus": 2, "addr": 0x50},
            "products": {"Pi-CodecZero": "ov_rasptenta_iqaudio_codec"},
            "camera_i2c": {"bus": 1, "addr": None},
            "camera_en": {"dev": "/dev/gpiochip5", "pin": 5}
        }

        self.portenta_mid_carrier = {
            "sku": "ASX00055",
            "name": "mid",
            "name_full": "Portenta Mid Carrier",
            "prefix": "ov_carrier_mid",
            "overlays_base": "ov_som_lbee5kl1dx ov_som_x8h7 ov_carrier_rasptenta_base ov_carrier_mid_pcie_mini",
            "overlays_base_no_pcie": "ov_som_lbee5kl1dx ov_som_x8h7 ov_carrier_rasptenta_base",
            "has_eeprom": False,
            "eeprom_i2c": {"bus": None, "addr": None, "file": None},
            "has_hat": False,
            "hat_eeprom_i2c": {"bus": None, "addr": None},
            "camera_i2c": {"bus": 2, "addr": None},
            "camera_en": {"dev": "/dev/gpiochip5", "pin": 3}
        }

        self.mipi_camera_i2c_addr = {
            0x36: {"name": "ov5647", "ov_apnd": "ov5647_camera_mipi"},
            0x10: {"name": "imx219", "ov_apnd": "imx219_camera_mipi"},
            0x1a: {"name": "imx708", "ov_apnd": "imx708_camera_mipi"}
        }

    def fw_printenv(self, var=None):
        cmd = ["fw_printenv",
            str(var)]
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
        return p.returncode, out, err

    def fw_setenv(self, var=None, value=None):
        cmd = ["fw_setenv",
            str(var),
            str(value)]
        print(cmd)
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
        sleep(0.25)
        if p.returncode:
            raise IOError
        return p.returncode, out, err

    def dump_config(self):
        text = []
        ret, out, err = self.fw_printenv("board_name")
        text.append(str(out, 'utf-8'))
        ret, out, err = self.fw_printenv("carrier_custom")
        text.append(str(out, 'utf-8'))
        ret, out, err = self.fw_printenv("overlays")
        text.append(str(out, 'utf-8'))
        ret, out, err = self.fw_printenv("is_on_carrier")
        text.append(str(out, 'utf-8'))
        ret, out, err = self.fw_printenv("carrier_name")
        text.append(str(out, 'utf-8'))
        ret, out, err = self.fw_printenv("old_carrier_name")
        text.append(str(out, 'utf-8'))
        ret, out, err = self.fw_printenv("has_hat")
        text.append(str(out, 'utf-8'))
        ret, out, err = self.fw_printenv("hat_name")
        text.append(str(out, 'utf-8'))
        return '\n'.join(text)

    def read_env_variable(self, var=None):
        ret, out, err = self.fw_printenv(var)
        out = str(out, 'utf-8')
        return out.split('=')[1].strip('\n')

    def scan_cameras(self, data):
        devices = []
        try:
            bus = data["camera_i2c"]["bus"]
            en_gpiochip = data["camera_en"]["dev"]
            en_pin = data["camera_en"]["pin"]
            en = GPIO(en_gpiochip, en_pin, "out")
            en.write(True)
            sleep(0.25)
        except (OSError, KeyError):
            pass
            return devices

        bus = SMBus(bus)
        for addr in self.mipi_camera_i2c_addr:
            try:
                bus.write_quick(addr)
                devices.append(addr)
            except IOError:
                pass
        bus.close()
        en.write(False)
        return devices

    def set_base_ov(self, data, custom=False):
        try:
            if custom:
                print(self.fw_setenv("carrier_custom", str(int(custom))))
            else:
                print(self.fw_setenv("carrier_custom", ""))
            print(self.fw_setenv("carrier_name", data["name"]))
            print(self.fw_setenv("overlays", data["overlays_base"]))
        except (IOError, KeyError):
            return 1
        return 0

    # Read RPi HAT eeprom using standard RPi tools.
    # @TODO: investigate if a python library to read eeprom HAT format via i2c exists,
    # for example pihat is using cached information created by RPi OS in /proc/device-tree/hat
    # and is not directly accessing via i2c the eeprom
    def parse_eeprom(self, bus, addr):
        cmd = ["eepflash.sh",
            "--read",
            "-y",
            "--device="+str(bus),
            "--address="+hex(addr).split("0x")[1],
            "-t=24c256",
            "-f",
            "eeprom_settings.eep"]
        print(cmd)
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
        if p.returncode:
            raise IOError

        cmd = ["eepdump",
            "eeprom_settings.eep",
            "eeprom_settings.txt"]
        print(cmd)
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
        if p.returncode:
            raise IOError

        product_uuid = None
        product_id = None
        product_ver = None
        vendor = None
        product = None
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
        return product_uuid, product_id, product_ver, vendor, product

    def provision_eeprom(self, bus, addr, eeprom_file):
        cmd = ["eepmake",
            eeprom_file,
            "eeprom_settings.eep"]
        print(cmd)
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
        if p.returncode:
            raise IOError

        cmd = ["eepflash.sh",
            "--write",
            "-y",
            "--device="+str(bus),
            "--address="+hex(addr).split("0x")[1],
            "-t=24c256",
            "-f",
            "eeprom_settings.eep"]
        print(cmd)
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
        if p.returncode:
            raise IOError
        return 0

    def run(self):
        w = Whiptail(title="tenta-config", backtitle="")
        carrier_board = None
        level=0
        modified=False
        while True:
            if level==0:
                option_list = ["Portenta Breakout Carrier Config", "Portenta Max Carrier Config", "Portenta HAT Carrier Config", "Portenta Mid Carrier Config", "Auto-Detect Carrier Board", "Dump Current Hardware Config", "Factory Reset"]
                menu, res = w.menu("", option_list)
                if res==1:
                    break
                else:
                    level = 1
            elif level==1:
                if menu==option_list[self.BREAKOUT]:
                    option_list = ["Enable Breakout Carrier"]
                    submenu, res = w.menu("Breakout Carrier Config", option_list)
                    if submenu==option_list[0]:
                        answer = w.yesno("Enable Breakout Overlays?", default='no')
                        if not answer:
                            ret = self.set_base_ov(self.portenta_breakout_carrier, True)
                            if ret:
                                msgbox = w.msgbox("Failed.")
                            else:
                                msgbox = w.msgbox("Success.")
                    level = 0
                elif menu==option_list[self.MAX]:
                    option_list = ["Enable Max Carrier", "Scan for mipi cameras", "Enable SARA-R412M Modem"]
                    submenu, res = w.menu("Max Carrier Config", option_list)
                    if submenu==option_list[2]:
                        carrier_board = self.portenta_max_carrier
                        level = 2
                    else:
                        level = 0
                elif menu==option_list[self.HAT]:
                    option_list = ["Enable Portenta HAT Carrier", "EEPROM Carrier Provision", "EEPROM Carrier Dump", "Enable/Disable SPI", "Scan for HATs", "Scan for mipi cameras"]
                    submenu, res = w.menu("HAT Carrier Config", option_list)
                    if submenu==option_list[1]:
                        carrier_board = self.portenta_hat_carrier
                        level = 4
                    elif submenu==option_list[2]:
                        carrier_board = self.portenta_hat_carrier
                        level = 5
                    elif submenu==option_list[4]:
                        carrier_board = self.portenta_hat_carrier
                        level = 3
                    elif submenu==option_list[5]:
                        carrier_board = self.portenta_hat_carrier
                        level = 2
                    else:
                        level = 0
                elif menu==option_list[self.MID]:
                    option_list = ["Enable Portenta Mid Carrier", "EEPROM Carrier Provision", "Enable PCIe Mini Connector", "Scan for mipi cameras"]
                    submenu, res = w.menu("Mid Carrier Config", option_list)
                    if submenu==option_list[3]:
                        carrier_board = self.portenta_mid_carrier
                        level = 2
                    else:
                        level = 0
                elif menu==option_list[self.AUTO]:
                    answer = w.yesno("Perform Auto-Detect?", default='no')
                    if not answer:
                        carrier_name = self.read_env_variable("carrier_name")
                        if carrier_name == "breakout":
                            carrier_board = self.portenta_breakout_carrier
                            level = 1
                            menu = option_list[self.BREAKOUT]
                        elif carrier_name == "max":
                            carrier_board = self.portenta_max_carrier
                            level = 1
                            menu = option_list[self.MAX]
                        elif carrier_name == "rasptenta":
                            carrier_board = self.portenta_hat_carrier
                            level = 1
                            menu = option_list[self.HAT]
                        elif carrier_name == "hat":
                            carrier_board = self.portenta_hat_carrier
                            level = 1
                            menu = option_list[self.HAT]
                        else:
                            level = 0
                        if level:
                            msg = "Detected %s" % carrier_board["name_full"]
                            msgbox = w.msgbox(msg)
                        else:
                            msgbox = w.msgbox('The name "%s" was not among the ones currently supported!' % carrier_name)
                    else:
                        level = 0
                elif menu==option_list[self.DUMP]:
                    msg = self.dump_config()
                    msgbox = w.msgbox(msg)
                    level = 0
                elif menu==option_list[self.RESET]:
                    answer = w.yesno("Perform Factory Reset?", default='no')
                    if not answer:
                        msgbox = w.msgbox("Configuration resetted successfully.")
                    level = 0
            elif level==2:
                devices = self.scan_cameras(carrier_board)
                if devices:
                    msg = "I've found a %s mipi camera, activate?" % self.mipi_camera_i2c_addr[devices[0]]["name"]
                    answer = w.yesno(msg, default='no')
                    if not answer:
                        msgbox = w.msgbox("Ok, will activate.")
                    else:
                        msgbox = w.msgbox("Ok, won't activate.")
                else:
                    msgbox = w.msgbox("No camera detected.")
                level = 0
            elif level==3: # HAT EEPROM READ/PARSE
                if carrier_board["has_hat"]:
                    product_uuid, product_id, product_ver, vendor, product = self.parse_eeprom(carrier_board["hat_eeprom_i2c"]["bus"], carrier_board["hat_eeprom_i2c"]["addr"])
                    if product in carrier_board["products"]:
                        msg = "I've found the compatible HAT %s, activate?" % product
                        answer = w.yesno(msg, default='no')
                        if not answer:
                            msgbox = w.msgbox("Ok, will activate.")
                        else:
                            msgbox = w.msgbox("Ok, won't activate.")
                    else:
                        msgbox = w.msgbox("No compatible HAT detected.")
                else:
                    msgbox = w.msgbox("This carrier board does not support HATs.")
                level = 0
            elif level==4: # CARRIER EEPROM WRITE
                if carrier_board["has_eeprom"]:
                    msg = "Proceed writing %s's EEPROM?" % carrier_board["full_name"]
                    answer = w.yesno(msg, default='no')
                    if not answer:
                        ret = 0
                        try:
                            ret = self.provision_eeprom(carrier_board["eeprom_i2c"]["bus"], carrier_board["eeprom_i2c"]["addr"], carrier_board["eeprom_i2c"]["file"])
                        except IOError:
                            pass
                            ret = 1
                        if ret:
                            msgbox = w.msgbox("Failed to provision the EEPROM.")
                        else:
                            msgbox = w.msgbox("EEPROM provisioned.")
                else:
                    msgbox = w.msgbox("This carrier board doesn't have an EEPROM.")
                level = 0
            elif level==5: # CARRIER EEPROM READ/PARSE
                if carrier_board["has_eeprom"]:
                    product_uuid, product_id, product_ver, vendor, product = self.parse_eeprom(carrier_board["eeprom_i2c"]["bus"], carrier_board["eeprom_i2c"]["addr"])
                    if product_uuid and product_id and product_ver and vendor and product:
                        msg = "%s's EEPROM:\n" % carrier_board["name_full"]
                        msg += "product_uuid: %s\nproduct_id: %s\nproduct_ver: %s\nvendor: %s\nproduct: %s" % (product_uuid, product_id, product_ver, vendor, product)
                        msgbox = w.msgbox(msg)
                    else:
                        msgbox = w.msgbox("EEPROM looks empty. Provision it and retry.")
                else:
                    msgbox = w.msgbox("This carrier board does not have an EEPROM to read.")
                level = 0

        if modified:
            msgbox = w.msgbox("New settings will be active after reboot!")

        exit(0)
### End TENTA_CONFIG class definition

### Main program
if __name__ == '__main__':
    TENTA_CONFIG().run()
### End Main program
