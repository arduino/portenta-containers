#!/bin/sh

# FAKE provisioning script, to test the API.

# NOTES:
# - Production api: https://api2.arduino.cc
# - Devel api: https://api-dev.arduino.cc

# Functions
device_provisioning()
{
    JSONFILE=$1
    CLIENT_ID=$2
    CLIENT_SECRET=$3
    THING_NAME=$4
    API_URL=$5

    echo $JSONFILE
    #set -ex

    if [ -z "$API_URL" ]; then
        echo "Using default API url https://api2.arduino.cc"
        API_URL="https://api2.arduino.cc"
    fi

    # Get default inputs from iot-config.json
    PIN=$(cat $JSONFILE | jq -r '.pin')
    if [ $? -eq 0 ] && [ -n "$PIN" ]; then
        :
    else
        echo "Reading PIN from iot-config.json: fail"
        return 1
    fi
    SO_PIN=$(cat $JSONFILE | jq -r '.so_pin')
    if [ $? -eq 0 ] && [ -n "$SO_PIN" ]; then
        :
    else
        echo "Reading SO_PIN from iot-config.json: fail"
        return 1
    fi
    SLOT=$(cat $JSONFILE | jq -r '.slot')
    if [ $? -eq 0 ] && [ -n "$SLOT" ]; then
        :
    else
        echo "Reading SLOT from iot-config.json: fail"
        return 1
    fi
    NAME=$(cat $JSONFILE | jq -r '.name')
    if [ $? -eq 0 ] && [ -n "$NAME" ]; then
        :
    else
        echo "Reading NAME from iot-config.json: fail"
        return 1
    fi
    TYPE=$(cat $JSONFILE | jq -r '.type')
    if [ $? -eq 0 ] && [ -n "$TYPE" ]; then
        :
    else
        echo "Reading TYPE from iot-config.json: fail"
        return 1
    fi
    SN=$(cat /sys/devices/soc0/serial_number)
    if [ $? -eq 0 ] && [ -n "$SN" ]; then
        :
    else
        echo "Reading SN from sysfs: fail"
        return 1
    fi
    FQBN=arduino:python:portenta_x8

    # Initialize tpm and create a new device key
    echo "create_tpm_key $SO_PIN $PIN $SLOT"
    create_tpm_key $SO_PIN $PIN $SLOT
    res=$?
    if [ $res -eq 0 ]; then
        echo "create_tpm_key: success"
    else
        echo "create_tpm_key: fail"
        return 1
    fi

    # Get an usable token from the cloud
    ACCESS_TOKEN=$(curl --silent --location --request POST "${API_URL}/iot/v1/clients/token" \
    --header "content-type: application/x-www-form-urlencoded" \
    --data-urlencode "grant_type=client_credentials" \
    --data-urlencode "client_id=${CLIENT_ID}" \
    --data-urlencode "client_secret=${CLIENT_SECRET}" \
    --data-urlencode "audience=https://api2.arduino.cc/iot" | jq '.access_token' | tr -d '"')

    if [ $? -eq 0 ] && [ -n "$ACCESS_TOKEN" ]; then
        echo
        echo ACCESS_TOKEN=$ACCESS_TOKEN
    else
        echo "ACCESS_TOKEN: fail"
        return 1
    fi

    # Get a device id from the cloud
    DEVICE_ID=$(curl --silent --location --request PUT "${API_URL}/iot/v2/devices" \
    --header "Authorization: Bearer ${ACCESS_TOKEN}" \
    --header "Content-Type: application/json" \
    --data-raw "{\"name\": \"${NAME}\",\"type\": \"${TYPE}\",\"serial\": \"${SN}\",\"fqbn\": \"${FQBN}\"}" | jq '.id' | tr -d '"')

    if [ $? -eq 0 ] && [ -n "$DEVICE_ID" ]; then
        echo
        echo DEVICE_ID=$DEVICE_ID
    else
        echo "DEVICE_ID: fail"
        return 1
    fi

    # Generate CSR
    create_csr $PIN $DEVICE_ID
    res=$?
    if [ $res -eq 0 ]; then
        echo "create_csr: success"
    else
        echo "create_csr: fail"
        return 1
    fi

    # Get device certificate
    DEVICE_CERT=$(curl --silent --location --request PUT "${API_URL}/iot/v2/devices/${DEVICE_ID}/certs" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${ACCESS_TOKEN}" \
    --data-raw "{\"ca\":\"Arduino\",\"csr\":\"${CSR}\",\"enabled\":true}" | jq .pem | tr -d '"')

    if [ $? -eq 0 ] && [ -n "$DEVICE_CERT" ]; then
        echo $DEVICE_CERT
    else
        echo "DEVICE_CERT: fail"
        return 1
    fi

    # Store device certificate
    store_certificate $PIN "$DEVICE_CERT" $SLOT
    res=$?
    if [ $res -eq 0 ]; then
        echo "store_certificate: success"
    else
        echo "store_certificate: fail"
        return 1
    fi

    # Update json file with DEVICE_ID
    cat $JSONFILE | jq --arg device_id "$DEVICE_ID" '.device_id |= $device_id' > /tmp/iot-config.temp
    res=$?
    if [ $res -eq 0 ]; then
        cp /tmp/iot-config.temp $JSONFILE
        rm /tmp/iot-config.temp
        echo "Updated json file $JSONFILE correctly"
    else
        echo "Failed to update json file $JSONFILE"
        return 1
    fi

    # Create default thing and dashboard
    create_thing $CLIENT_ID $CLIENT_SECRET $THING_NAME $DEVICE_ID $API_URL
    res=$?
    if [ $res -eq 0 ]; then
        echo "create_thing: success"
    else
        echo "create_thing: fail"
        return 1
    fi

    return 0
}

create_tpm_key()
{
    SO_PIN=$1
    PIN=$2
    SLOT=$3
    
    sleep 2

    return 0
}

create_csr()
{
    PIN=$1
    DEVICE_ID=$2
    # Generate CSR
    OPENSSL_CONF=./openssl.conf openssl req -new -engine pkcs11 -keyform engine -passin pass:$PIN -key label_device-key -out ./csr.csr -subj "/CN=${DEVICE_ID}"
    res=$?
    if [ $res -eq 0 ]; then
        echo "Generate CSR: success"
        CSR=$(cat ./csr.csr | awk '{print $0"\\n"}' | tr -d '\n')
        echo "12345678900"
    else
        echo "Generate CSR: fail"
        return 1
    fi
    return 0
}


store_certificate()
{
    PIN=$1
    CERT=$2
    SLOT=$3

    sleep 2

    return 0
}

create_thing()
{
    CLIENT_ID=$1
    CLIENT_SECRET=$2
    THING_NAME=$3
    DEVICE_ID=$4
    API_URL=$5
    DASHBOARD_NAME=$THING_NAME


    sleep 2

    return 0
}

usage()
{
    echo "Usage:"
    echo "$0 -kcstf arg1...argN"
    echo "k: <so_pin> <pin> <slot_index> Initialize TPM token <slot_index> and user <pin>. Create EC:prime256v1 keypair"
    echo "c: <pin> <device_id> create csr with tpm key and device_id"
    echo "s: <pin> <certificate> <slot> store certificate in der format into tpm"
    echo "t: <client_id> <client_secret> <thing_name> <device_id> <api_url> create default thing object on aiot cloud for a given device_id"
    echo "f: <client_id> <client_secret> <thing_name> <api_url> do the provisioning using default values"
}

# Main
echo "$0: Started"

#JSONFILE="/var/sota/iot-config.json"
#TEMPLATE="/iot-config.template"
JSONFILE="/tmp/iot-config.json"
TEMPLATE="./iot-config.template"

if [ ! -f $JSONFILE ]; then
    echo "Creating $JSONFILE for the first time..."
    cp $TEMPLATE $JSONFILE

    # Update template file with unique name for this device
    NAME="portenta-x8-"$(cat /sys/devices/soc0/serial_number)
    cat $TEMPLATE | jq --arg name "$NAME" '.name |= $name' > $JSONFILE
fi

res=1
while getopts "k:c:s:t:f:" arg; do
    case $arg in
        k)
            if [ $# -ne 4 ]; then
                echo "Please provide SO_PIN PIN and SLOT as cmd line args"
                usage
                break
            fi
            SO_PIN=$2
            PIN=$3
            SLOT=$4
            echo "create_tpm_key $SO_PIN $PIN $SLOT"
            create_tpm_key $SO_PIN $PIN $SLOT
            res=$?
            ;;
        c)
            if [ $# -ne 3 ]; then
                echo "Please provide tpm user PIN and DEVICE_ID as cmd line args"
                usage
                break
            fi
            PIN=$2
            DEVICE_ID=$3
            echo "create_csr $PIN $DEVICE_ID"
            create_csr $PIN $DEVICE_ID
            res=$?
            ;;
        s)
            if [ $# -ne 4 ]; then
                echo "Please provide PIN, CERT and SLOT as cmd line args"
                usage
                break
            fi
            PIN=$2
            CERT=$3
            SLOT=$4
            store_certificate $PIN $CERT $SLOT
            res $?
            ;;
        t)
            if [ $# -lt 5 ]; then
                echo "Please provide CLIENT_ID, CLIENT_SECRET, THING_NAME and DEVICE_ID as cmd line args"
                usage
                break
            fi
            CLIENT_ID=$2
            CLIENT_SECRET=$3
            THING_NAME=$4
            DEVICE_ID=$5
            API_URL=$6
            create_thing $CLIENT_ID $CLIENT_SECRET $THING_NAME $DEVICE_ID $API_URL
            res=$?
            ;;
        f)
            if [ $# -lt 4 ]; then
                echo "Please provide CLIENT_ID and SECRET_ID as cmd line args"
                usage
                break
            fi
            CLIENT_ID=$2
            CLIENT_SECRET=$3
            THING_NAME=$4
            API_URL=$5
            device_provisioning $JSONFILE $CLIENT_ID $CLIENT_SECRET $THING_NAME $API_URL
            res=$?
            ;;
        *)
            usage
            ;;
    esac
done

if [ $res -ne 0 ]; then
    echo "Failed, please change settings and retry"
else
    echo "Success"
fi

echo "$0: Ended"

exit $res
