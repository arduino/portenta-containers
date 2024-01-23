from subprocess import PIPE, Popen
from time import sleep
import argparse

class TentaConfig(object):
    def __init__(self):
        pass

    def fw_setenv_script(self, script=None):
        cmd = ["fw_setenv",
            "--script",
            str(script)]
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
        sleep(0.25)
        if p.returncode:
            raise IOError
        return p.returncode, out, err

    def set_base_ov(self, path):
        try:
            self.fw_setenv_script(path)
        except (IOError, KeyError):
            return False
        return True

    def read_env_variable(self, var=None):
        ret, out, err = self.fw_printenv(var)
        return out.split('=')[1].strip('\n')

    def fw_printenv(self, var=None):
        cmd = ["fw_printenv",
            str(var)]
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
        out = out.decode('utf-8')
        return p.returncode, out, err
    
    def fw_setenv(self, var=None, value=None):
        cmd = ["fw_setenv",
            str(var),
            str(value)]
        p = Popen(cmd, stdout=PIPE)
        out, err = p.communicate()
        sleep(0.25)
        if p.returncode:
            raise IOError
        return p.returncode, out, err
    
    def add_ov(self, name):
        if name in self.fw_printenv("overlays")[1]:
            return True
        else:
            overlays = self.read_env_variable("overlays")
            overlays = overlays + ' ' + name
            try:
                self.fw_setenv("overlays", overlays)
            except IOError:
                pass
                return False
            return True

    def rm_ov(self, name):
        if name in self.fw_printenv("overlays")[1]:
            overlays = self.read_env_variable("overlays")
            overlays_list = overlays.split(' ')
            overlays_list.remove(name)
            overlays = ' '.join(overlays_list)
            try:
                self.fw_setenv("overlays", overlays)
            except IOError:
                pass
                return False
            return True
        else:
            return False

    def find_ov(self, name):
        overlays_list = self.read_env_variable("overlays").split(' ')
        for item in overlays_list:
            if name in item:
                return item
        return None
    
    def factory_reset(self):
        try:
            self.fw_setenv("carrier_custom", None)
        except (IOError, KeyError):
            return False
        return True
    
    def load_uboot_env(self, variables):
        env = {}
        for var in variables:
            out= self.read_env_variable(var)
            env[var] = out
        
        return env

    def save_uboot_env(self, env):
        okay = True

        for key in env.keys():
            try:
                ret, out, err = self.fw_setenv(key, env[key])
            except IOError:
                okay = False
                continue
            
        return okay
    
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Manage overlays.')
    parser.add_argument('--add', metavar='N', type=str, help='an overlay to add')
    parser.add_argument('--remove', metavar='N', type=str, help='an overlay to remove')
    parser.add_argument('--find', metavar='N', type=str, help='an overlay to find')
    parser.add_argument('--reset', action='store_true', help='reset to factory settings')
    parser.add_argument('--set-base', metavar='N', type=str, help='set a base overlay')

    args = parser.parse_args()

    tc = TentaConfig()  

    if args.add:
        tc.add_ov(args.add)
    elif args.remove:
        tc.rm_ov(args.remove)
    elif args.find:
        tc.find_ov(args.find)
    elif args.reset:
        tc.factory_reset()
    elif args.set_base:
        tc.set_base_ov(args.set_base)