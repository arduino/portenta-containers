# Portenta X8 Weather Station

## Environment Data from the Portenta X8 M4 core to the Arduino IoT Cloud

This is the "Portenta X8 Weather Station", a simple weather station that reads environmental data from a BME280 sensor connected via I2C to the M4 MCU and publishes the measures to an Arduino IoT Cloud Thing via authenticated MQTT/S.

The accompaining Arduino sketch must be upload to the M4 via the usual Arduino tools before deploying the application.

You also need to provide a pair of configuration files via Foundries' Secure Configuration mechanism.

**NOTE:** *The application connects to the AIoTC MQTT Broker as 3rd Party/Generic device using username and password MQTT authentication over TLS connection.*

### Notable features

* Communication with the M4 core via RPC (MessagePack-RPC).
* Authenticated connection with Arduino IoT Cloud (AIoTC) MQTT Broker.
* SenML/CBOR data packet format for AIoTC.
* Dynamic configuration via Foundries' Secure Configuration mechanism.

### Circuit

* Arduino Portenta X8
* Arduino Portenta Breakout
* Generic I2C BME280 sensor/breakout

Plug the Portenta X8 on the Breakout board and connect the BME280 sensor to the following pins:

* `GND`: any `GND` pin
* `VIN`: any `3v3` pin
* `SDA`: `PWM8` 
* `SCL`: `PWM6` 

## Configuring the application

To connect to the AIoTC MQTT Broker the application needs a few parameters for generating the configurations for MQTT client and topics.

### Overview

The parameters needed are:

* AIoTC Device Name
* AIoTC Device ID
* AIoTC Device Secret for 3rd Party/Generic devices
* AIoTC Thing ID

The parameters must provided in a pair of JSON configuration files `device.json` and `thing.json`. The configuration files must be upladed to the Portenta X8 at run-time using the Foundries' Secure Configuration mechanism.

The configuration files are deployed in the `/var/run/secrets` directory and the Docker Compose configuration takes care of binding the directory to the container to make the configuration files available to the application.

The configuration files must have the following minimal schema.

Example for minimal `device.json`:
```json
{
    "name": "wheater-station-01",
    "id": "0d31d3d9-f2a4-43c1-9ace-973e1b1a5ad9",
    "secret_key": "ZJYCVOU8RKOXASEMIVE"
}
```

Example for minimal `thing.json`:
```json
{
    "id": "30a4fbb3-6b2b-4081-8327-6a3c3051ef7d"
}
```

### Generating the configuration files

You can to generate the two configuration files by creating the Device and the Thing both with `arduino-cloud-cli` tool or collecting data form the Arduino IoT Cloud web procedure for 3rd Party devices creation.

From `arduino-cloud-cli` command line:
```sh
$ arduino-cloud-cli device create-generic --name <device_name> --format json | tee device.json
$ arduino-cloud-cli thing create --name <thing_name> --template <thing_template.yaml> --format json | tee thing.json
$ aduino-cloud-cli thing bind --id <thing_id> --device-id <device_id>
```

You must provide `<device_name>`, `<thing_name>` and a `<thing_template.yaml>` template file. A valid `thing_template.yaml` template file is provided alongside this README file.

Example for minimal thing template:
```yaml
variables:
    - name: Temperature
      permission: READ_ONLY
      type: FLOAT
      update_parameter: 0
      update_strategy: ON_CHANGE
      variable_name: temperature
    - name: Pressure
      permission: READ_ONLY
      type: FLOAT
      update_parameter: 0
      update_strategy: ON_CHANGE
      variable_name: pressure
    - name: Humidity
      permission: READ_ONLY
      type: FLOAT
      update_parameter: 0
      update_strategy: ON_CHANGE
      variable_name: humidity
```

### Deploying the secure configuration to the device

With `device.json` and `thing.json` in place, you can deploy the configuration to the device the via `fioctl` command.

Open a terminal window and move to the folder containing the configuration files and launch the following command lines setting `<device-name>` according the name of the board you are configuring. (See [Dynamic Configuration File](https://docs.foundries.io/latest/tutorials/configuring-and-sharing-volumes/dynamic-configuration-file.html) for further info).

```sh
$ fioctl devices config set <device-name> device.json==device.json
$ fioctl devices config set <device-name> thing.json==thing.json
```

***Please, note the double `==` equals sign.*** 

## Launching the application

### Loading the M4 sketch

The `arduino` folder contains an Arduino Sketch to be uploaded to the M4 core using the Arduino IDEs or the `arduino-cli` tool.

The sketch exposes three RPC methods – `temperature`, `humidity`, `pressure` – that return the relevant measures from the BME280 when invoked.

## Enabling the X8 application

With the `python-weather-station` application already available in your Targets (see [Creating your first Target](https://docs.foundries.io/latest/tutorials/creating-first-target/creating-first-target.html) for further info), you can deploy it using the following commmand line:

```sh
$ fioctl devices config updates --apps python-weather-station,<any>,<other>,<application> <device-name>
```

## Creating a Weather Dashboard

The application will start streaming data to AIoTC as soon as a valid configuration is found.

Connect to [https://create.arduino.cc/iot/things/<thing_id>](https://create.arduino.cc/iot/things/<thing_id>/setup) thing page to see data stream in.

Go to [Build Dashboard](https://create.arduino.cc/iot/dashboards/new) to create a new dashboard to show the variables: click on **Add** > **Things** and select `<device_name>` to automagically create the widgets for the dashboard.

Enjoy.
