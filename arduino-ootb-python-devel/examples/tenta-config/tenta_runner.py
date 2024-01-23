# Description: This file is the main file for the tenta runner
from tenta_config import TentaConfig
from tenta_utils import TentaUtils
from whiptail import Whiptail
import json

class TentaRunner(object):
    def __init__(self):
        self.run_loop = True

        self.env_vars = []
        
        self.carriers_names = []
        self.carrier_list = []
        self.carriers_dict = {}
        
        self.cameras_dict = {}
        self.cameras_addresses = []

        self.w = None
        self.TC = TentaConfig()
        self.TU = TentaUtils()

        self._load_hw_from_json()

        self.local_env = self.TC.load_uboot_env(self.env_vars)
        pass

    def _load_hw_from_json(self):
        with open('hw.json') as json_file:
            json_dict = json.load(json_file)

            self.carrier_list = json_dict["carrier_info"]["keys"]

            for carrier in self.carrier_list:
                self.carriers_dict[carrier] = json_dict["carrier_info"][carrier]   
                self.carriers_names.append(json_dict["carrier_info"][carrier]["name_full"]) 

            self.cameras_addresses = json_dict["cameras_info"]["keys"]

            for address in self.cameras_addresses:
                self.cameras_dict[address] = json_dict["cameras_info"][address]

            self.env_vars = json_dict["env_vars"]
        pass

    def _pcie_routine(self):
        res, pcie_data = self.TU.scan_pcie_mini_connector()

        if res:
            self.w.msgbox(f"PCIe Devices:\n\
                          {pcie_data[0] if len(pcie_data) > 0 else 'None'}\n\n\
                          USB Devices:\n\
                          {pcie_data[1] if len(pcie_data) > 1 else 'None'}")
        else:
            self.w.msgbox("Error Scanning PCIe Mini Connector")
        pass

    def _eeprom_routine(self, operation, carrier_dict):
        i2c_bus = carrier_dict["eeprom_i2c"]
        hat_i2c = carrier_dict["hat_eeprom_i2c"]
        if operation == "provision":
            _name = carrier_dict["name_full"]
            proceed = self.w.yesno(f"Are you sure you want to provision the {_name} EEPROM?",
                                   default="no")
            
            if proceed == 0:
                ret = self.TU.provision_eeprom(i2c_bus["bus"], i2c_bus["addr"], i2c_bus["file"])
                if ret == 0:
                    self.w.msgbox("EEPROM Provisioned Successfully")
                else:
                    self.w.msgbox("Error Provisioning EEPROM")
        elif operation == "dump":
            eprom_data = self.TU.parse_eeprom(i2c_bus["bus"], i2c_bus["addr"])
            if eprom_data[0] and eprom_data[1] and eprom_data[2] and eprom_data[3] and eprom_data[4]:
                self.w.msgbox(f"EEPROM Data:\n\
                                Product UUID {eprom_data[0]}\n\
                                Product ID {eprom_data[1]}\n\
                                Product Version {eprom_data[2]}\n\
                                Vendor {eprom_data[3]}\n\
                                Product {eprom_data[4]}")
            else: 
                self.w.msgbox("EEPROM looks empty")
        elif operation == "hat":
            hats_dict = carrier_dict["hats"]
            eprom_data = self.TU.parse_eeprom(hat_i2c["bus"], hat_i2c["addr"])
            if eprom_data[4] in hats_dict.keys():
                answer = self.w.yesno(f"Activate {eprom_data[4]}?", default="no")
                if answer == 0:
                    if eprom_data[4] in hats_dict.keys():
                        self._add_entry_to_local_var("overlays", hats_dict[eprom_data[4]]["ov"])
                        self.w.msgbox("HAT Activated")
                    else:
                        self.w.msgbox("HAT Detected but not currently supported.")
                else:
                    self.w.msgbox("HAT Not Activated")
            else:
                self.w.msgbox("No HAT Detected")
        else:
            print("Invalid EEPROM Operation")
    pass

    def _camera_routine(self, carrier_dict):
        camera_bus_data = carrier_dict["camera"]
        camera = self.TU.scan_cameras((camera_bus_data["en_gpiochip"], camera_bus_data["en_gpio_pin"]), 
                                      camera_bus_data["i2c_bus"], self.cameras_addresses)
        if camera:
            answer = self.w.yesno(f"Found {self.cameras_dict[camera]['name']} camera!\nActivate?", default="no")
            if answer == 0:
                self._remove_entry_from_local_var("overlays", "_camera_mipi")

                prefix = carrier_dict["prefix"]
                suffix = self.cameras_dict[camera]["ov_apnd"]
                new_overlay = f"{prefix}_{suffix}" 
                self._add_entry_to_local_var("overlays", new_overlay)
                
                self.w.msgbox("Camera Activated")
            else:
                self.w.msgbox("Camera Not Activated")
        else:
            self.w.msgbox("No Camera Detected")
        
        return
    
    #TODO: disclaimer if carrier custom is 1
    def _autodetect_routine(self):
        answer = self.w.yesno("Auto-Detecting Carrier Board, proceed?", default="no")
        
        if answer == 0:
            carrier = self.TC.read_env_variable("carrier_name")
            
            if carrier in self.carrier_list:
                self.w.msgbox(f"Carrier Detected: {self.carriers_dict[carrier]['name_full']}")
                self._load_carrier_view(carrier)
            else:
                self.w.msgbox(f"Carrier {carrier} Detected but not currently supported.")
        pass

    def _factory_reset(self):
        answer = self.w.yesno("Are you sure you want to reset to factory settings?", default="no")
        if answer == 0:
            result = self.TC.factory_reset()
            if result:
                self.w.msgbox("Factory Reset Successful")
            else:
                self.w.msgbox("Error Resetting to Factory Settings")
        pass

    def _alternative_ov_routine(self, carrier_dict):
        options = []
        
        for key in carrier_dict["alternative_ov"].keys():
            options.append(carrier_dict["alternative_ov"][key]["description"])

        menu, res = self.w.menu("Alternative overlays", options)

        if res == 1 or res == 255:
            return
        else:
            answer = self.w.yesno(f"Are you sure you want to enable selected alternative overlay?",
                                  default="no")
            if answer == 0:
                tmp_key = ""
                for key in carrier_dict["alternative_ov"].keys():
                    if menu == carrier_dict["alternative_ov"][key]["description"]:
                        tmp_key = key
                        break
                
                if tmp_key == "":
                    self.w.msgbox("Error enabling alternative overlay")
                    return
                
                if carrier_dict["alternative_ov"][tmp_key]["rm_ov"]:
                    self._remove_entry_from_local_var("overlays", carrier_dict["alternative_ov"][tmp_key]["rm_ov"])
                if carrier_dict["alternative_ov"][tmp_key]["add_ov"]:
                    self._add_entry_to_local_var("overlays", carrier_dict["alternative_ov"][tmp_key]["add_ov"])
                
                self.w.msgbox("Alternative overlay enabled")
        pass

    def _load_carrier_view(self, carrier_key):
        try:
            _current_carrier = self.carriers_dict[carrier_key]
        except KeyError:
            print("KeyError")
            return
        
        _name = _current_carrier["name_full"]

        options = [f"Enable {_name} standard overlays"]
        if(_current_carrier["has_eeprom"]):
            options.extend(["EEPROM Carrier Provision", "EEPROM Carrier Dump"])
        if(_current_carrier["has_hat"]):
            options.append("Scan HAT EEPROM")
        if(_current_carrier["has_pcie"]):
            options.append("Scan PCIe Mini Connector")
        if(_current_carrier["has_camera"]):
            options.append("Scan Camera Connector")
        if(_current_carrier["has_alternative_ov"]):
            options.append("Enable alternative overlays")

        menu, res = self.w.menu(f"{_name} Config", options)

        if res == 1 or res == 255:
            return
        else:
            if menu == f"Enable {_name}":
                enable = self.w.yesno(f"Are you sure you want to enable {_name}?", default="no")
                if enable == 0:
                    self.local_env["carrier_custom"] = "1"
                    self.local_env["carrier_name"] = carrier_key
                    self.local_env["is_on_carrier"] = "yes"
                    self.local_env["overlays"] = _current_carrier["overlays_base"]

                    self.w.msgbox(f"{_name} configuration saved in local environment.\n"+
                                  "In order to make it permanent, save the environment!")
                pass
            elif menu == "EEPROM Carrier Provision":
                self._eeprom_routine("provision", _current_carrier)
                pass
            elif menu == "EEPROM Carrier Dump":
                self._eeprom_routine("dump", _current_carrier)
                pass
            elif menu == "Scan HAT EEPROM":
                self._eeprom_routine("hat", _current_carrier)    
                pass
            elif menu == "Scan PCIe Mini Connector":
                self._pcie_routine()
                pass
            elif menu == "Scan Camera Connector":
                self._camera_routine(_current_carrier)
            elif "Enable alternative overlays" in menu:
                self._alternative_ov_routine(_current_carrier)
                pass
            else:
                pass
    
        return

    def _remove_entry_from_local_var(self, var, entry):
        try:
            if (var in self.env.keys()):
                if (entry in self.env[var]):
                    self.env[var].replace(f" {entry}", "")
        except Exception:
            pass

        return

    def _add_entry_to_local_var(self, var, entry):
        if var in self.local_env.keys():
            if (entry not in self.local_env[var]):
                self.local_env[var] += f" {entry}"
        return

    def _print_env(self, env):
        string = ""
        for key in env.keys():
            if " " in env[key]:
                ov_list = env[key].split(" ")
                string += f"{key}:\n"
                for ov in ov_list:
                    string += f"\t* {ov}\n"
            else:
                string += f"{key}: {env[key]}\n\n"
        
        return string
    
    def _show_diff(self, env):
        curr_env = self.TC.load_uboot_env(self.env_vars)

        message_str = ""

        for key in env.keys():
            if curr_env[key] != env[key]:
                message_str += f"------------------------------------------------\n\n"
                message_str += f"Variable: {key}\n\n"
                message_str += f"New configuration:\n{env[key]}\n\n"
                message_str += f"Old configuration:\n{curr_env[key]}\n\n"
                message_str += f"------------------------------------------------\n\n"

        return message_str

    def _manual_edit_routine(self):
        menu, ret = self.w.menu("", self.env_vars)

        if ret == 1 or ret == 255:
            return
        else:
            var_content, ret = self.w.inputbox(menu, f"{self.local_env[menu]}")
            self.local_env[menu] = var_content
        pass

    def _load_main_view(self):
        options = []
        options.extend(self.carriers_names)
        options.extend(["Auto-Detect Carrier Board", "Dump Current Hardware Config", 
                        "Manual variable edit", "Save local envirnoment", "Factory Reset"])
        menu, res = self.w.menu("", options)

        if res == 1 or res == 255:
            self.run_loop = False
            return
        else:
            if menu in self.carriers_names:
                carrier_index = self.carriers_names.index(menu)
                self._load_carrier_view(self.carrier_list[carrier_index])
            else:
                if menu == "Auto-Detect Carrier Board":
                    self._autodetect_routine()
                    pass
                elif menu == "Dump Current Hardware Config":
                    environment = self.TC.load_uboot_env(self.env_vars)
                    string = self._print_env(environment)
                    self.w.msgbox(string)
                    pass
                elif menu == "Manual variable edit":
                    self._manual_edit_routine()            
                    pass
                elif menu == "Save local envirnoment":
                    answer = self.w.yesno("Are you sure you want to save the local environment?", default="no")
                    if answer == 0:
                        if(self.TC.save_uboot_env(self.local_env)):
                            self.w.msgbox("**********************************************\n"+
                                      "*             Envirnoment saved              *\n"+
                                      "* Reboot in order to apply new configuration *\n"+
                                      "**********************************************")
                        else:
                            self.w.msgbox("Error Saving Environment")
                    pass
                elif menu == "Factory Reset":
                    self._factory_reset()
                    pass
                else:
                    pass
        return

    def run(self):
        self.w = Whiptail(title="tenta-config", backtitle="")
        while True:
            while self.run_loop:
                self._load_main_view()

            diff = self._show_diff(self.local_env)

            if len(diff) > 0:
                message = "        * DIFFERENCES *\n\n"
                message += diff
                self.w.msgbox(message)
                
                answer = self.w.yesno("Save new environment?", default="no")
                if answer == 0:
                    if (self.TC.save_uboot_env(self.local_env)):
                        self.w.msgbox("**********************************************\n"+
                                      "*             Envirnoment saved              *\n"+
                                      "* Reboot in order to apply new configuration *\n"+
                                      "**********************************************")
                    else:
                        self.w.msgbox("Error Saving Environment")
                else:
                    self.w.msgbox("Environment Not Saved")

            answer = self.w.yesno("Do you want to exit?", default="no")
            if answer == 0:
                break 
            else:
                self.run_loop = True

if __name__ == '__main__':
    TentaRunner().run()