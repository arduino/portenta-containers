#!/bin/sh

# FAKE provisioning script, to test the API.

# NOTES:
# - Production api: https://api2.arduino.cc/iot/v1
# - Devel api: https://api-dev.arduino.cc/iot/v2

# Functions
device_provisioning()
{
    if [ $RANDOM%2 -eq 0 ]; then
        echo "Updated json file $JSONFILE correctly"
    fi

    return 0
}

# Main
echo "$0: Started"

JSONFILE="/var/sota/iot-secrets.json"
TEMPLATE="/iot-secrets.template"

if [ $# -ne 3 ]; then
    echo "Please provide CLIENT_ID and SECRET_ID as cmd line args"
    exit 1
fi

CLIENT_ID=$1
CLIENT_SECRET=$2

if [ ! -f $JSONFILE ]; then
    echo "Creating $JSONFILE for the first time..."
    cp $TEMPLATE $JSONFILE

    # Update template file with unique name for this device
    NAME="portenta-x8-"$(cat /sys/devices/soc0/serial_number)
    cat $TEMPLATE | jq --arg name "$NAME" '.name |= $name' > $JSONFILE
fi

device_provisioning $JSONFILE $CLIENT_ID $CLIENT_SECRET
res=$?
if [ $res -ne 0 ]; then
    echo "Failed device provisioning, please change settings and retry"
else
    echo "Device provisioned successfully"
fi

echo "$0: Ended"
