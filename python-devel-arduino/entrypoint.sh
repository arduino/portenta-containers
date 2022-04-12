#!/bin/sh

echo "Setting correct permissions to ssh keys"
mkdir -p /root/.ssh
cat /tmp/keys/id_rsa.pub > /root/.ssh/authorized_keys
chmod 700 /root/.ssh
chmod 600 /root/.ssh/authorized_keys

echo "Importing hw info env"
export $(grep -v '^#' /run/arduino_hw_info.env | xargs)

echo "Adding env variables to profile"
PROFILE="/etc/profile"

VAR="export BOARD=\"$BOARD\""
if  grep -q "$VAR" "$PROFILE" ; then
  echo "$BOARD"
else
  echo "$VAR" >> "$PROFILE";
fi

VAR="export IS_ON_CARRIER=\"$IS_ON_CARRIER\""
if  grep -q "$VAR" "$PROFILE" ; then
  echo "$IS_ON_CARRIER"
else
  echo "$VAR" >> "$PROFILE";
fi

VAR="export CARRIER_NAME=\"$CARRIER_NAME\""
if  grep -q "$VAR" "$PROFILE" ; then
  echo "$CARRIER_NAME"
else
  echo "$VAR" >> "$PROFILE";
fi

echo "Starting dropbear ssh server"
dropbear -F -E -R -s -j -k
