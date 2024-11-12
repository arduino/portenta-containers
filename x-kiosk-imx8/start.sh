#!/bin/sh

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

# Execute all the rest
# kiosk: --kiosk --no-first-run --incognito
echo "Starting Chromium: $@"
/usr/lib/chromium/chrome \
  --disable-features=VizDisplayCompositor \
  --disk-cache-size=33554432 \
  --in-process-gpu \
  --ozone-platform=wayland \
  --no-sandbox \
  --start-maximized \
  --use-gl=egl \
  "$@"
