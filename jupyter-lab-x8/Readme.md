
# Jupyter Lab for Portenta X8

## How to Connect

With the Portenta X8 connected to your PC via the USB port, browse to [http://192.168.7.1:8888/lab?token=\<unique token\>]([http://192.168.7.1:8888/lab?token=<token>]) where `token` is an unique token generated by the running instance of the Jupyter Lab container.

You can get the Jupyter Lab token either from the logs of the compose app or invoking the following command from and USB-connected Portenta X8.

```sh
adb shell 'echo "fio" | sudo -S docker logs jupyter-lab-x8_jupyter-lab-x8_1 2>/dev/null | sed  -n "s/.*token=\(.*\)$/\1/p" | uniq'
```
