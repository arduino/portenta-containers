#!/bin/bash
# wait for display
if [ ! -e /sys/class/graphics/fb0 ]; then
    echo "Display not detected.  Will wait for it to show up ..."
fi
while [ ! -e /sys/class/graphics/fb0 ]; do
    sleep 1
done

# use /tmp for config and cache data in read-only mode
export XDG_CACHE_HOME=/tmp/.cache
export XDG_CONFIG_HOME=/tmp/.config
mkdir -p ${XDG_CACHE_HOME} ${XDG_CONFIG_HOME}

export LC_ALL=en_US.UTF-8
export LD_LIBRARY_PATH=/opt/flutter-elinux/flutter/bin/cache/artifacts/engine/elinux-arm64-debug/
${FIO_HOME}/flutter-embedded-linux/build/flutter-client -b ${FIO_HOME}/gallery/build/linux/arm64/debug/bundle -f
