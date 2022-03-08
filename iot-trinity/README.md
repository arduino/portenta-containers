# IoT Trinity Application

An example application composed by InfluxDB, Node-Red and Grafana, all running locally on the Portenta X8.

The following steps show how to interconnect the applications and configure them to:

- Collect data locally from a few Arduino boards
- Display data on a local dashboard
- Relay data to the Arduino IoT Cloud
- Display data on an AIoTC dashboard

## Deploy the application

Update your device adding the `iot-trinity` application the deployed apps

    fioctl device config update --apps your,list,of,apps,iot-trinity <device>

Wait for application to be deployed, then move to the next step.

## Connect to the services

The `iot-trinity` exposes three web services on the following ports:

- InfluxDB: `8086` (TCP)
- Node-Red: `1880` (TCP)
- Grafana: `3000` (TCP)

You can reach the services pointing your web browser to `IP` address or domain name of your Portenta X8, eg:

- InfluxDB: [http://portenta-x8.local:8086](http://portenta-x8.local:8086) (TCP)
- Node-Red: [http://portenta-x8.local:1880](http://portenta-x8.local:1880) (TCP)
- Grafana: [http://portenta-x8.local:3000](http://portenta-x8.local:3000) (TCP)

> NOTE: you can retrieve the `IP Address` of the target machine with `ping <hostname>`, eg.:

    $ ping portenta-x8.local
    PING portenta-x8.local (192.168.1.111): 56 data bytes

Use the following credentials for first-time login:

- InfluxDB: `arduino`/`x8trinity`
- Node-Red: N/A
- Grafana: `admin`/`admin`

## Setup InfluxDB

The `iot-trinity` comes with an already configured database:

- Organization: `arduino`
- Bucket: `x8-iot`

### Generate API tokens

- Connect to your InfluxDB Web interface
- Navigate to *Data -> API Tokens*
- Generate the following **Read/Write** API Tokens
  - Arduino Board (1+)
  - Grafana (1x)
  - Node-Red (1x)

## Setup the Arduino board

A few examples sketches for WiFi Arduino boards are available at [iot-trinity/sketches](https://source.foundries.io/factories/arduino/containers.git/tree/iot-trinity/sketches?h=experimental).

### InfluxDB_WiFi
Download the [InfluxDB_WiFi](https://source.foundries.io/factories/arduino/containers.git/tree/iot-trinity/sketches/InfluxDB_WiFi?h=experimental) sketch and open it with your favourite Arduino editor. You need to change the value of a few defines and variables.

> NOTE: The sketches use the the `WiFiNINA` library. YMMV.

#### Changes to `arduino_secrets.h`

* Add your WiFi credentials: `SECRET_SSID` and `SECRET_PASS`
* Add the InfluxDB API Token: `INFLUXDB_TOKEN`

#### Changes to `InfluxDB_WiFi.ino`

- Insert the correct `IP address` of the Portenta X8 in the `influxDbAddress` variable. 

> NOTE: you can retrieve the `IP Address` of the target machine with `ping <hostname>`, eg.:

    $ ping portenta-x8.local
    PING portenta-x8.local (192.168.1.111): 56 data bytes

Upload the sketch and open the Serial Monitor to get the logs.

## Visualize the data

### InfluxDB

Connect to the InfluxDB web intarface and select *Explore* in the navigation menu on the left and create a query.

- Create the Flux query
    - Select `x8-iot` in the `FROM` panel
    - Select `wifi_status` in the first `Filter` panel
    - Select `rssi` as `_field` in the next `Filter` panel
    - Select `Group` as panel type in the next panel, and select `device`
- Submit the query
    - Click on the `Submit` button on the right to subit the query
    - See the data showing on the graph panel above
- Save the query in a dashboard
    - Click on the `Save As` button on the top right to persist the panel in a dashboard.

### Grafana

TODO

### Node-Red

TODO


### Arduino IoT Cloud

TODO
