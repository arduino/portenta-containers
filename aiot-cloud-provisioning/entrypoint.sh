#!/bin/sh

# NOTES:
# - Production api: https://api2.arduino.cc/iot/v1
# - Devel api: https://api-dev.arduino.cc/iot/v2

# Functions
device_provisioning()
{
    JSONFILE=$1
    set -ex
    # Generate a private key compatible with ArduinoIoTCloud
    pkcs11-tool --module /usr/lib/libckteec.so.0 --init-token --label arduino --so-pin 12345678
    pkcs11-tool --module /usr/lib/libckteec.so.0 --init-pin --label arduino --so-pin 12345678 --pin 87654321
    pkcs11-tool --module /usr/lib/libckteec.so.0 --keypairgen --key-type EC:prime256v1 --label device-priv-key --token-label arduino --pin 87654321
    # Get private key URI
    p11tool --provider=/usr/lib/libckteec.so.0 --list-tokens
    p11tool --provider=/usr/lib/libckteec.so.0 --list-all pkcs11:model=OP-TEE%20TA;manufacturer=Linaro;serial=0000000000000000;token=arduino
    # Provision the device
    ## Get a device id from the cloud
    CLIENT_ID=$(cat $JSONFILE | jq '.client_id' | tr -d '"')
    res1=$?
    CLIENT_SECRET=$(cat $JSONFILE | jq '.client_secret' | tr -d '"')
    res2=$?
    res=`expr $res1 + $res2`
    if [ $res -eq 0 ]; then
    else
        echo "Failed to obtain CLIENT_ID and CLIENT_SECRET from json file, aborting"
        return 1
    fi

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
    res=`expr $res1 + $res2`
    if [ $res -eq 0 ]; then
    else
        echo "Failed to obtain NAME and TYPE from json file, aborting"
        return 1
    fi

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
    OPENSSL_CONF=./openssl.conf openssl req -new -engine pkcs11 -keyform engine -key device-priv-key -out csr.csr -subj "/CN=${DEVICE_ID}"
    CSR=$?

    ## Get device certificate
    RESPONSE=$(curl --location --request PUT "https://api-dev.arduino.cc/iot/v2/devices/\"${DEVICE_ID}\"/certs" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${ACCESS_TOKEN}" \
    --data-raw "{"ca":"Arduino","csr":\"${CSR}\","enabled":true}")
    echo "Response: $RESPONSE"
    DEVICE_CERT=$(echo $RESPONSE | jq '.der' | tr -d '"')
    res=$?
    if [ $res -eq 0 ]; then
        echo "DEVICE_CERT: success"
        echo DEVICE_CERT=$DEVICE_CERT
    else
        echo "DEVICE_CERT: fail"
        return 1
    fi

    ## Store device certificate
    pkcs11-tool --module /usr/lib/libckteec.so.0  --login --pin 87654321 --write-object $DEVICE_CERT --type cert --slot 0 --label device-certificate

    ## Update json file with DEVICE_ID
    cat $JSONFILE | jq --arg device_id "$DEVICE_ID" '.device_id |= $device_id' > $JSONFILE
    res=$?
    if [ $res -eq 0 ]; then
        echo "Failed to update json file $JSONFILE"
        return 1
    fi

    return 0
}

# Main
echo "Entrypoint for arduino-iot-cloud-provisioning: started"

JSONFILE="/var/secrets/iot-secrets/iot-secrets.json"
TEMPLATE="/var/secrets/iot-secrets/iot-secrets.template"

mkdir -p /var/secrets/iot-secrets

NAME="portenta-x8-"$(cat /sys/devices/soc0/serial_number)

# Update template file with unique name for this device
cat iot-secrets.template | jq --arg name "$NAME" '.name |= portenta-x8-$name' > $TEMPLATE

while [ ! -f $JSONFILE ]
do
    echo "Waiting for $JSONFILE to be created..."
    sleep 5
done

echo "File $JSONFILE created, verifying..."

DEVICE_ID=$(cat $JSONFILE | jq '.device_id' | tr -d '"')

if [ DEVICE_ID == "" ]; then
    echo "Device not provisioned, aiot cloud provisioning: started"
    res=device_provisioning $JSONFILE
    if [ $res == 1 ]; then
        echo "Failed device provisioning, please change settings and retry"
    else
        echo "Device provisioned successfully"
    fi
else
    echo "Device already provisioned, skipping..."
fi

# Enter forever loop, task finished
while :
do
    sleep 5
done
