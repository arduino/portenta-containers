# X Kiosk

This app run a full screen chromium brwoser showing the specified website.
It uses linux framebuffer without graphics acceleeration.

## Usage

Start the application with docker compose:
```
$ docker compose up -d
```

You can edit the compose file to specify the desired website with the command parameter.
