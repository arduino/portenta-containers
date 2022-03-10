#!/bin/sh

# Mock script to emulate Foundries lmp-device-register
# https://docs.foundries.io/84/getting-started/register-device/index.html

sleep 4s

cat <<EOF
    Registering device, test, to factory gavin.
    Device UUID: $(cat /proc/sys/kernel/random/uuid)

    ----------------------------------------------------------------------------
    Visit the link below in your browser to authorize this new device. This link
    will expire in 15 minutes.
      Device Name: $2
      User code: SQRD-PLBN
      Browser URL: https://app.foundries.io/activate/
EOF