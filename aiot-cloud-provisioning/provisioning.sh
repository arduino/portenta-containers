#!/bin/sh

# NOTES:
# - Production api: https://api2.arduino.cc/iot/v1
# - Devel api: https://api-dev.arduino.cc/iot/v2

# Functions
device_provisioning()
{
    JSONFILE=$1
    CLIENT_ID=$2
    CLIENT_SECRET=$3

    echo $JSONFILE
    set -ex
    # Generate a private key compatible with ArduinoIoTCloud
    pkcs11-tool --module /usr/lib/libckteec.so.0 --init-token --label arduino --so-pin 12345678
    pkcs11-tool --module /usr/lib/libckteec.so.0 --init-pin --label arduino --so-pin 12345678 --pin 87654321
    pkcs11-tool --module /usr/lib/libckteec.so.0 --keypairgen --key-type EC:prime256v1 --label device-priv-key --token-label arduino --pin 87654321
    # Get private key URI
    p11tool --provider=/usr/lib/libckteec.so.0 --list-tokens
    p11tool --provider=/usr/lib/libckteec.so.0 --list-all pkcs11:model=OP-TEE%20TA;manufacturer=Linaro;serial=0000000000000000;token=arduino
    # Provision the device
    ## Get an usable token from the cloud
    RESPONSE=$(curl --location --request POST "https://api-dev.arduino.cc/iot/v1/clients/token" \
    --header "content-type: application/x-www-form-urlencoded" \
    --data-urlencode "grant_type=client_credentials" \
    --data-urlencode "client_id=${CLIENT_ID}" \
    --data-urlencode "client_secret=${CLIENT_SECRET}" \
    --data-urlencode "audience=https://api2.arduino.cc/iot")
    echo "Response: $RESPONSE"
    ACCESS_TOKEN=$(echo $RESPONSE | jq '.access_token' | tr -d '"')
    res=$?
    if [ $res -eq 0 ]; then
        echo "ACCESS_TOKEN: success"
        echo ACCESS_TOKEN=$ACCESS_TOKEN
    else
        echo "ACCESS_TOKEN: fail"
        return 1
    fi

    NAME=$(cat $JSONFILE | jq '.name' | tr -d '"')
    res1=$?
    TYPE=$(cat $JSONFILE | jq '.type' | tr -d '"')
    res2=$?
    if [ $res1 -eq 0 ] && [ $res2 -eq 0 ]; then
        echo "NAME and TYPE success"
    else
        echo "Failed to obtain NAME and TYPE from json file, aborting"
        return 1
    fi

    ## Get a device id from the cloud
    RESPONSE=$(curl --location --request PUT "https://api-dev.arduino.cc/iot/v2/devices" \
    --header "Authorization: Bearer ${ACCESS_TOKEN}" \
    --header "Content-Type: application/json" \
    --data-raw "{\"name\": \"${NAME}\",\"type\": \"${TYPE}\"}")
    echo "Response: $RESPONSE"
    DEVICE_ID=$(echo $RESPONSE | jq '.id' | tr -d '"')
    res=$?
    if [ $res -eq 0 ]; then
        echo "DEVICE_ID: success"
        echo DEVICE_ID=$DEVICE_ID
    else
        echo "DEVICE_ID: fail"
        return 1
    fi

    ## Generate CSR
    OPENSSL_CONF=./openssl.conf openssl req -new -engine pkcs11 -keyform engine -passin pass:87654321 -key label_device-priv-key -out csr.csr -subj "/CN=${DEVICE_ID}"
    res=$?
    if [ $res -eq 0 ]; then
        echo "Generate CSR: success"
        CSR=$(cat csr.csr | awk '{print $0"\\n"}' | tr -d '\n')
    else
        echo "Generate CSR: fail"
        return 1
    fi

    ## Get device certificate
    RESPONSE=$(curl --location --request PUT "https://api-dev.arduino.cc/iot/v2/devices/${DEVICE_ID}/certs" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${ACCESS_TOKEN}" \
    --data-raw "{\"ca\":\"Arduino\",\"csr\":\"${CSR}\",\"enabled\":true}")
    echo "Response: $RESPONSE"
    DEVICE_CERT=$(echo $RESPONSE | jq '.pem' | tr -d '"')
    res=$?
    if [ $res -eq 0 ]; then
        echo "DEVICE_CERT: success"
        echo DEVICE_CERT=$DEVICE_CERT
    else
        echo "DEVICE_CERT: fail"
        return 1
    fi

    ## Create device certificate der file
    echo $DEVICE_CERT | sed 's/\\n/\n/g' > device-certificate.pem
    openssl x509 -outform DER -in device-certificate.pem -out device-certificate.der

    ## Store device certificate
    pkcs11-tool --module /usr/lib/libckteec.so.0  --login --pin 87654321 --write-object device-certificate.der --type cert --slot 0 --label device-certificate

    ## Update json file with DEVICE_ID
    cat $JSONFILE | jq --arg device_id "$DEVICE_ID" '.device_id |= $device_id' > /tmp/iot-secrets.json
    res=$?
    if [ $res -eq 0 ]; then
        cp /tmp/iot-secrets.json $JSONFILE
        echo "Updated json file $JSONFILE correctly"
    else
        echo "Failed to update json file $JSONFILE"
        return 1
    fi

    return 0
}

# Main
echo "$0: Started"

JSONFILE="/var/sota/iot-secrets.json"
TEMPLATE="/iot-secrets.template"

if [ $# -ne 2 ]; then
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
