# M4 serial foward (go)

This demo go application allow to forward the m4 serial port to the usb serial gadget of portenta x8 board.

## Devices

* /dev/ttyGS0: name of gadget device on portenta x8 board
* /dev/ttyACM0: name of serial gadget device in the linux host machine connected with usb to portenta x8

## Usage

To start the application run:
```
$ docker compose up -d
```

You also need to deploy the associated arduino sketch to the m4 board.


