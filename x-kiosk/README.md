# X Kiosk

This app run a full screen chromium browser showing the specified website.
It uses linux framebuffer without graphics acceleration.

## Usage

Start the application with docker compose:
```
$ docker compose up -d
```

You can edit the compose file to specify the desired website with the command parameter.
