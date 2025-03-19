#!/bin/bash
set -e

# wait for display
if [ ! -e /sys/class/graphics/fb0 ]; then
  echo "Display not detected.  Will wait for it to show up ..."
fi
while [ ! -e /sys/class/graphics/fb0 ]; do
  sleep 1
done

./arduino-ide $@

