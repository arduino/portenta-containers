from flask import Flask, request
import tenta_config as TC
import tenta_utils as TU

app = Flask(__name__)

@app.route('/test')
def home():
    return "test"

@app.route('/tenta/scan_cameras', methods=['GET'])
def tenta_scan_cameras():
    en_gpio = request.args.get('en_gpio', default = None, type = int)
    bus_numer = request.args.get('bus_number', default = None, type = int)
    address_list = request.args.get('address_list', default = None, type = list)

    if en_gpio and bus_numer and address_list:
        device = TU.scan_cameras(en_gpio, bus_numer, address_list)
    else:
        #TODO: return error code
        device = "Invalid request, please provide all parameters"
    
    return f"tenta_scan_cameras [GPIO,BUS] = [{en_gpio},{bus_numer}]\n DEVICE = {device}"

@app.route('/tenta/scan_hats', methods=['GET'])
def tenta_scan_hats():
    bus_numer = request.args.get('bus_number', default = None, type = int)  
    address = request.args.get('address', default = None, type = int)

    if bus_numer and address:
        hat_data_list = TU.parse_eeprom(bus_numer, address)
    else:
        #TODO: return error code
        hat_data_list = "Invalid request, please provide both bus number and address"

    return f"tenta_scan_hats [BUS,ADDRESS] = [{bus_numer},{address}]/n HAT_DATA = {hat_data_list}"

@app.route('/tenta/get_json')
def tenta_get_json():
    with open('hw.json') as json_file:
        json_str = json_file.read()
        json_file.close()
    return json_str

@app.route('/tenta/get_env_var', methods=['GET'])
def tenta_get_env_var():
    var_name = request.args.get('var_name', default = None, type = str)
    if var_name:
        value = TC.read_(var_name)
        #value = os.getenv(var_name, 'Environment variable not found') 
        return value 
    else:
        return "No variable name provided"

@app.route('/tenta/set_env_var', methods=['POST'])
def tenta_set_env_var():
    var_name = request.json.get('var_name')
    var_value = request.json.get('var_value')
    if var_name and var_value:
        if TC.set_env_var(var_name, var_value):
            return f'Successfully set {var_name}'
        else:
            #TODO: return error code
            return f'Failed to set {var_name}'
    else:
        #TODO: return error code
        return "Invalid request, please provide both variable name and value"

if __name__ == '__main__':
    app.run(debug=True)
