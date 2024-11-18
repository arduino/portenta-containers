`portentax8-m4-proxy`
=====================
[![Spell Check](https://github.com/arduino/portentax8-m4-proxy/actions/workflows/spell-check.yml/badge.svg)](https://github.com/arduino/portentax8-m4-proxy/actions/workflows/spell-check.yml)
[![Sync Labels status](https://github.com/arduino/portentax8-m4-proxy/actions/workflows/sync-labels.yml/badge.svg)](https://github.com/arduino/portentax8-m4-proxy/actions/workflows/sync-labels.yml)

#### How-to-use 
* Compile and upload [`PortentaX8_EchoServer`](https://github.com/arduino/ArduinoCore-mbed/blob/main/libraries/RPC/examples/PortentaX8_EchoServer/PortentaX8_EchoServer.ino)
```bash
arduino-cli compile -b arduino:mbed_portenta:portenta_x8 -v libraries/RPC/examples/PortentaX8_EchoServer -u
```
* Build the Go [`example`](example/sample_mprpc.go) application and upload to Portenta X8
```bash
cd example
GOOS=linux GOARCH=arm64 go build
adb push example /home/fio
```
* Login your Portenta X8 and execute the `example` application
```bash
adb shell
./example
```
* On your PC open a terminal via the Portenta X8's `tty/ACMx` serial interface and interact with the M4 sketch
```bash
ll /dev/serial/by-id/*
lrwxrwxrwx 1 root root 13 Jän 19 07:43 /dev/serial/by-id/usb-Arduino_Portenta_X8_2D16BA09DAB6FAD9-if02 -> ../../ttyACM0
minicom -D /dev/ttyACM0
...
```

#### How-to-debug
**Note**: the [`proxy`](proxy/main.go) is built into the Yocto image via this [recipe](https://github.com/arduino/meta-partner-arduino/blob/main/recipes-connectivity/m4-proxy/m4-proxy.bb). Should it become necessary to debug and build a custom version you can also build it on your PC and then push and execute it on the Portenta X8.
```bash
cd proxy
GOOS=linux GOARCH=arm64 go build
adb push proxy /home/fio
```
Before starting the locally built proxy make sure that the one automatically started as a service is disabled.
```bash
ps -A | grep m4_proxy             
   3159 pts/0    00:05:17 m4_proxy
sudo killall m4_proxy
sudo ./proxy
```
