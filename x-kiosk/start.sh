#!/bin/sh

# wait for display
if [ ! -e /sys/class/graphics/fb0 ]; then
    echo "Display not detected.  Will wait for it to show up ..."
fi
while [ ! -e /sys/class/graphics/fb0 ]; do
    sleep 1
done

# use /tmp for config and cache data in read-only mode
mkdir -p ${XDG_CACHE_HOME} ${XDG_CONFIG_HOME}

# Execute all the rest
echo "Starting Chromium: $@"
/usr/bin/chromium \
  --autoplay-policy=no-user-gesture-required \
  --disable \
  --disable-dev-shm-usage \
  --disable-infobars \
  --disable-save-password-bubble \
  --disable-suggestions-service \
  --disable-translate \
  --incognito \
  --kiosk \
  --no-first-run \
  --no-sandbox \
  --start-maximized \
  --temp-profile \
  "$@"
