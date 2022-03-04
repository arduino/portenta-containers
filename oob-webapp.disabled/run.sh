#!/bin/sh

docker build -t oob . && docker run \
  -p 1323:1323 \
  --cap-add NET_ADMIN \
  --volume /run/dbus:/run/dbus \
  --mount type=bind,source=$(pwd)/test/lmp-device-register,destination=/bin/lmp-device-register \
  --mount type=bind,source=$(pwd)/test/python-test-container/keys,destination=/bin/keys \
  -e DBUS_SYSTEM_BUS_ADDRESS=unix:path=/run/dbus/system_bus_socket \
  -e SSH_HOST=172.20.0.2:22 \
  -e SSH_USER=pytest \
  -e SSH_KEY=/bin/keys/id_rsa \
  -e SSH_KEY_PUB=/bin/keys/id_rsa.pub \
  --network host \
  --privileged \
  --hostname portenta-x8-af4a7d \
  oob