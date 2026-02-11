# Lora node

A simple lora node that sends a small custom packet containing temperature and humidity values gathered from an i2c sensor connected to the ext. m4 controller.
The data is then forwarded by the lora gateway to The Things Network cloud.

## Usage

Run the application with docker compose:
```
$ docker compose up -d
```
