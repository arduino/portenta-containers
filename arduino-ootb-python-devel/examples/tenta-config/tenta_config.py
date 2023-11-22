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
            "prefix": "ov_carrier_breakout",
            "overlays_base": "ov_som_lbee5kl1dx ov_som_x8h7 \
                    ov_carrier_breakout_gpio \
                    ov_carrier_breakout_i2s \
                    ov_carrier_breakout_sai \
                    ov_carrier_breakout_pdm \
                    ov_carrier_breakout_pwm \
                    ov_carrier_breakout_sdc \
                    ov_carrier_breakout_spdif \
                    ov_carrier_breakout_spi0 \
                    ov_carrier_breakout_spi1 \
                    ov_carrier_breakout_uart1 \
                    ov_carrier_breakout_uart3 \
                    ov_carrier_breakout_usbfs",
            "has_eeprom": False,
            "eeprom_i2c": [None, None],
            "has_hat": False,
            "hat_eeprom_i2c": [None, None],
            "camera_i2c": [2, None],
            "camera_en": [None, None]
        }

        self.portenta_max_carrier = {
            "sku": "ABX00043",
            "name": "max",
            "prefix": "ov_carrier_max",
            "overlays_base": "ov_som_lbee5kl1dx ov_som_x8h7 \
                    ov_carrier_enuc_bq24195 \
                    ov_carrier_max_usbfs \
                    ov_carrier_max_sdc \
                    ov_carrier_max_cs42l52 \
                    ov_carrier_max_sara-r4 \
                    ov_carrier_enuc_lora \
                    ov_carrier_max_pcie_mini",
            "has_eeprom": False,
            "eeprom_i2c": [None, None],
            "has_hat": False,
            "hat_eeprom_i2c": [None, None],
            "camera_i2c": [2, None],
            "camera_en": ["/dev/gpiochip3", 20]
        }

        self.portenta_hat_carrier = {
            "sku": "ASX00049",
            "name": "rasptenta",
            "prefix": "ov_carrier_rasptenta",
            "overlays_base": "ov_som_lbee5kl1dx ov_som_x8h7 ov_carrier_rasptenta_base ov_carrier_rasptenta_spi",
            "overlays_base_no_spidev": "ov_som_lbee5kl1dx ov_som_x8h7 ov_carrier_rasptenta_base",
            "has_eeprom": True,
            "eeprom_i2c": [1, 0x57],
            "has_hat": True,
            "hat_eeprom_i2c": [2, 0x50],
            "camera_i2c": [1, None],
            "camera_en": ["/dev/gpiochip5", 5]
        }

        self.portenta_mid_carrier = {
            "sku": "ASX00055",
            "name": "mid",
            "prefix": "ov_carrier_mid",
            "overlays_base": "ov_som_lbee5kl1dx ov_som_x8h7 ov_carrier_rasptenta_base ov_carrier_mid_pcie_mini",
            "overlays_base_no_pcie": "ov_som_lbee5kl1dx ov_som_x8h7 ov_carrier_rasptenta_base",
            "has_eeprom": False,
            "eeprom_i2c": [None, None],
            "has_hat": False,
            "hat_eeprom_i2c": [None, None],
            "camera_i2c": [2, None],
            "camera_en": ["/dev/gpiochip5", 3]
        }

        self.mipi_camera_i2c_addr = {
            0x36: ["ov5647", "ov5647_camera_mipi"],
            0x10: ["imx219", "imx219_camera_mipi"],
            0x1a: ["imx708", "imx708_camera_mipi"]
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
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
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
            bus = data["camera_i2c"][0]
            en_gpiochip = data["camera_en"][0]
            en_pin = data["camera_en"][1]
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

    def run(self):
        w = Whiptail(title="tenta-config", backtitle="")
        level=0
        modified=False
        while True:
            if level==0:
                option_list = ["Portenta Breakout Carrier Config", "Portenta Max Carrier Config", "Portenta HAT Carrier Config", "Portenta Mid Carrier Config", "Auto-Detect Carrier Board", "Dump Current Hardware Config", "Factory Reset", "Exit"]
                menu, res = w.menu("", option_list)
                if menu==option_list[-1] or res==1:
                    break
                else:
                    level = 1
            elif level==1:
                if menu==option_list[self.BREAKOUT]:
                    option_list = ["Enable Breakout Carrier", "../"]
                    submenu, res = w.menu("Breakout Carrier Config", option_list)
                    if submenu==option_list[-1]:
                        level = 0
                elif menu==option_list[self.MAX]:
                    option_list = ["Enable Max Carrier", "Scan for mipi cameras", "Enable SARA-R412M Modem", "../"]
                    submenu, res = w.menu("Max Carrier Config", option_list)
                    if submenu==option_list[-1]:
                        level = 0
                    elif submenu==option_list[2]:
                        devices = self.scan_cameras(self.portenta_max_carrier)
                        if devices:
                            msg = "I've found a %s mipi camera, available actions" % self.mipi_camera_i2c_addr[devices[0]][0]
                            option_list = ["Activate", "Remove", "../"]
                            submenu, res = w.menu(msg, option_list)
                            if menu==option_list[-1] or res==1:
                                print("Ok, won't activate")
                            elif menu==option_list[0]:
                                print("Ok, will activate")
                            elif menu==option_list[1]:
                                print("Ok, will remove")
                        else:
                            msgbox = w.msgbox("No camera detected.")
                        level = 0
                elif menu==option_list[self.HAT]:
                    option_list = ["Enable Portenta HAT Carrier", "EEPROM Carrier Provision", "Scan for HATs", "Scan for mipi cameras", "../"]
                    submenu, res = w.menu("HAT Carrier Config", option_list)
                    if submenu==option_list[-1]:
                        level = 0
                    elif submenu==option_list[3]:
                        devices = self.scan_cameras(self.portenta_hat_carrier)
                        if devices:
                            msg = "I've found a %s mipi camera, available actions" % self.mipi_camera_i2c_addr[devices[0]][0]
                            option_list = ["Activate", "Remove", "../"]
                            submenu, res = w.menu(msg, option_list)
                            if menu==option_list[-1] or res==1:
                                print("Ok, won't activate")
                            elif menu==option_list[0]:
                                print("Ok, will activate")
                            elif menu==option_list[1]:
                                print("Ok, will remove")
                        else:
                            msgbox = w.msgbox("No camera detected.")
                        level = 0
                elif menu==option_list[self.MID]:
                    option_list = ["Enable Portenta Mid Carrier", "EEPROM Carrier Provision", "Enable PCIe Mini Connector", "Scan for mipi cameras", "../"]
                    submenu, res = w.menu("Mid Carrier Config", option_list)
                    if submenu==option_list[-1]:
                        level = 0
                    elif submenu==option_list[3]:
                        devices = self.scan_cameras(self.portenta_mid_carrier)
                        if devices:
                            msg = "I've found a %s mipi camera, available actions" % self.mipi_camera_i2c_addr[devices[0]][0]
                            option_list = ["Activate", "Remove", "../"]
                            submenu, res = w.menu(msg, option_list)
                            if menu==option_list[-1] or res==1:
                                print("Ok, won't activate")
                            elif menu==option_list[0]:
                                print("Ok, will activate")
                            elif menu==option_list[1]:
                                print("Ok, will remove")
                        else:
                            msgbox = w.msgbox("No camera detected.")
                        level = 0
                elif menu==option_list[self.AUTO]:
                    option_list = ["Yes", "No"]
                    submenu, res = w.menu("Perform Auto-Detect?", option_list)
                    if not submenu==option_list[-1] and res==0:
                        continue
                    level = 0
                elif menu==option_list[self.DUMP]:
                    option_list = ["Yes", "No"]
                    submenu, res = w.menu("Perform Config Dump?", option_list)
                    if not submenu==option_list[-1] and res==0:
                        msg = self.dump_config()
                        msgbox = w.msgbox(msg)
                    level = 0
                elif menu==option_list[self.RESET]:
                    option_list = ["Yes", "No"]
                    submenu, res = w.menu("Perform Factory Reset?", option_list)
                    if not submenu==option_list[-1] and res==0:
                        continue
                    level = 0
        if modified:
            msgbox = w.msgbox("New settings will be active after reboot!")

        exit(0)
### End TENTA_CONFIG class definition

### Main program
if __name__ == '__main__':
    TENTA_CONFIG().run()
### End Main program
