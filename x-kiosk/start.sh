#!/bin/sh
set -x

# Execute all the rest
/usr/bin/chromium --no-sandbox --start-maximized --no-first-run --disable --disable-translate --disable-infobars --disable-suggestions-service --disable-save-password-bubble --incognito --autoplay-policy=no-user-gesture-required "$@" -- -nocursor -s 0 -dpms
