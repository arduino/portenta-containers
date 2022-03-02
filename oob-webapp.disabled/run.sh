#!/bin/sh

docker build -t oob . && docker run \
  -p 1323:1323 \
  --cap-add NET_ADMIN \
  --volume /run/dbus:/run/dbus \
  --mount type=bind,source=$(pwd)/test/lmp-device-register,destination=/bin/lmp-device-register \
  -e DBUS_SYSTEM_BUS_ADDRESS=unix:path=/run/dbus/system_bus_socket \
  --network host \
  --privileged \
  --hostname portenta-x8-af4a7d \
  oob