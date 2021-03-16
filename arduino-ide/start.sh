#!/bin/sh
set -x

# setup preferences.txt
mkdir -p ${ARDUINO_HOME}/.arduino15
if [ ! -f /home/fio/.arduino15/preferences.txt ]; then
    cp /arduino/lib/preferences.txt ${ARDUINO_HOME}/.arduino15/
fi

VIRT_SIZE=$(cat /sys/class/graphics/fb0/virtual_size)
VIRT_WIDTH=$(echo "${VIRT_SIZE}" | cut -d "," -f 1)
VIRT_HEIGHT=$(echo "${VIRT_SIZE}" | cut -d "," -f 2)
sed -i -e "s/editor.window.width.default.*/editor.window.width.default=${VIRT_WIDTH}/g" ${ARDUINO_HOME}/.arduino15/preferences.txt
sed -i -e "s/editor.window.height.default.*/editor.window.height.default=${VIRT_HEIGHT}/g" ${ARDUINO_HOME}/.arduino15/preferences.txt

# Execute all the rest
/arduino/arduino "$@"
