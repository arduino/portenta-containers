'''
    Portenta-X8 GPIO Status and Control
'''
from periphery import GPIO
from flask import Flask, render_template, request

app = Flask(__name__)

print("Start hw init...")

#define sensors GPIOs
button1 = GPIO("/dev/gpiochip5", 3, "in")
button2 = GPIO("/dev/gpiochip5", 4, "in")

#define actuators GPIOs
gpio0 = GPIO("/dev/gpiochip5", 0, "out")
gpio1 = GPIO("/dev/gpiochip5", 1, "out")
gpio2 = GPIO("/dev/gpiochip5", 2, "out")

#initialize GPIO status variables
button1Sts = 0
button2Sts = 0
gpio0Sts = 0
gpio1Sts = 0
gpio2Sts = 0

# turn gpios OFF
gpio0.write(False)
gpio1.write(False)
gpio2.write(False)

print("End hw init...")

@app.route("/")
def index():
    # Read GPIO Status
    button1Sts = int(button1.read())
    button2Sts = int(button2.read())
    gpio0Sts = int(gpio0.read())
    gpio1Sts = int(gpio1.read())
    gpio2Sts = int(gpio2.read())

    templateData = {
        'button1' : button1Sts,
        'button2' : button2Sts,
        'gpio0'   : gpio0Sts,
        'gpio1'   : gpio1Sts,
        'gpio2'   : gpio2Sts,
    }
    return render_template('index.html', **templateData)

# The function below is executed when someone requests a URL with the actuator name and action in it:
@app.route("/<deviceName>/<action>")
def action(deviceName, action):
    if deviceName == 'gpio0':
        actuator = gpio0
    if deviceName == 'gpio1':
        actuator = gpio1
    if deviceName == 'gpio2':
        actuator = gpio2

    if action == "on":
        actuator.write(True)
    if action == "off":
        actuator.write(False)

    button1Sts = int(button1.read())
    button2Sts = int(button2.read())
    gpio0Sts = int(gpio0.read())
    gpio1Sts = int(gpio1.read())
    gpio2Sts = int(gpio2.read())

    templateData = {
        'button1' : button1Sts,
        'button2' : button2Sts,
        'gpio0'   : gpio0Sts,
        'gpio1'   : gpio1Sts,
        'gpio2'   : gpio2Sts,
    }
    return render_template('index.html', **templateData)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80, debug=False)
