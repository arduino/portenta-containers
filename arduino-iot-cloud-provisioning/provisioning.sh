#!/bin/sh

# NOTES:
# - Production api: https://api2.arduino.cc
# - Devel api: https://api-dev.arduino.cc

# Functions
device_provisioning()
{
    CLIENT_ID=$1
    CLIENT_SECRET=$2
    THING_NAME=$3
    API_URL=$4

    SUCCESS="\e[32m[success]\e[0m"
    FAILURE="\e[31m[failure]\e[0m"

    if [ -z "$API_URL" ]; then
        echo "Using default API url https://api2.arduino.cc"
        API_URL="https://api2.arduino.cc"
    fi

    # Check if config json exist otherwise create it
    if [ ! -f $JSONFILE ]; then
        echo -n "Create configuration file ... "
        create_json $TEMPLATE
        res=$?
        if [ $res -ne 0 ]; then
            echo -e $FAILURE
            return 1
        fi
        echo -e $SUCCESS
    fi

    # Get default inputs from iot-config.json
    PIN=$(cat $JSONFILE | jq -r '.pin')
    if [ $? -ne 0 ] || [ -z "$PIN" ] || [ "$PIN" == "null" ]; then
        echo -n "Read pin from $JSONFILE ... "
        echo -e $FAILURE
        return 1
    fi
    SO_PIN=$(cat $JSONFILE | jq -r '.so_pin')
    if [ $? -ne 0 ] || [ -z "$SO_PIN" ] || [ "$SO_PIN" == "null" ]; then
        echo -n "Read so_pin from $JSONFILE ... "
        echo -e $FAILURE
        return 1
    fi
    SLOT=$(cat $JSONFILE | jq -r '.slot')
    if [ $? -ne 0 ] || [ -z "$SLOT" ] || [ "$SLOT" == "null" ]; then
        echo -n "Read slot from $JSONFILE ... "
        echo -e $FAILURE
        return 1
    fi
    NAME=$(cat $JSONFILE | jq -r '.name')
    if [ $? -ne 0 ] || [ -z "$NAME" ] || [ "$NAME" == "null" ]; then
        echo -n "Read name from $JSONFILE ... "
        echo -e $FAILURE
        return 1
    fi
    TYPE=$(cat $JSONFILE | jq -r '.type')
    if [ $? -ne 0 ] || [ -z "$TYPE" ] || [ "$TYPE" == "null" ]; then
        echo -n "Read type from $JSONFILE ... "
        echo -e $FAILURE
        return 1
    fi
    SN=$(cat /sys/devices/soc0/serial_number)
    if [ $? -ne 0 ] || [ -z "$SN" ] || [ "$SN" == "null" ]; then
        echo -n "Read sn from sysfs ... "
        echo -e $FAILURE
        return 1
    fi
    FQBN=arduino:python:portenta_x8

    if [ -z "$THING_NAME" ]; then
        echo "Using Thing Name from template"
        THING_NAME=$NAME
    fi

    # Get an usable token from the cloud
    echo -n "Request a new token from cloud ... "
    ACCESS_TOKEN=$(curl --silent --location                                                   \
                        --request "POST" "${API_URL}/iot/v1/clients/token"                    \
                        --header "content-type: application/x-www-form-urlencoded"            \
                        --data-urlencode "grant_type=client_credentials"                      \
                        --data-urlencode "client_id=${CLIENT_ID}"                             \
                        --data-urlencode "client_secret=${CLIENT_SECRET}"                     \
                        --data-urlencode "audience=https://api2.arduino.cc/iot" |             \
                   jq -r '.access_token')
    if [ $? -ne 0 ] || [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
        echo -e $FAILURE
        return 1
    fi
    echo -e $SUCCESS

    #echo $ACCESS_TOKEN

    # Try to understand if device is already provisioned
    echo -n "Check for valid device_id ... "
    DEVICE_ID=$(cat $JSONFILE | jq -r '.device_id')
    if [ $? -ne 0 ]; then
        echo -n "Read type from $JSONFILE ... "
        echo -e $FAILURE
        return 1
    fi

    if [ -n "$DEVICE_ID" ] && [ "$DEVICE_ID" != "null" ]; then
        # check if the device exist on the cloud servers
        if [ -z "$ORG_ID" ] || [ "$ORG_ID" == "null" ]; then
            OPT_HEADERS=""
        else
            OPT_HEADERS="--header \"X-Organization: ${ORG_ID}\""
        fi
        REMOTE_ID=$(curl --silent --location \
                         --request "GET" "${API_URL}/iot/v2/devices/${DEVICE_ID}/properties"  \
                         --header "Authorization: Bearer ${ACCESS_TOKEN}"                     \
                         --header "X-Organization: ${ORG_ID}"  |                              \
                    jq -r  '.deviceId')
        if [ $? -eq 0 ] && [ $REMOTE_ID == $DEVICE_ID ]; then
            echo -n "Device already provisioned ... "
            echo -e $SUCCESS
            return 0
        fi
    fi
    echo -n "New device ... "
    echo -e $SUCCESS

    # Initialize tpm and create a new device key
    echo -n "Create a new key ... "
    create_tpm_key $SO_PIN $PIN $SLOT
    res=$?
    if [ $res -ne 0 ]; then
        echo -e $FAILURE
        return 1
    fi
    echo -e $SUCCESS

    # Get a device id from the cloud
    echo -n "Register a new board ... "
    DEVICE_ID=$(curl --silent --location                                                      \
                     --request "PUT" "${API_URL}/iot/v2/devices"                              \
                     --header "Authorization: Bearer ${ACCESS_TOKEN}"                         \
                     --header "Content-Type: application/json"                                \
                     --header "X-Organization: ${ORG_ID}"                                     \
                     --data-raw "{\"name\": \"${NAME}\",\"type\": \"${TYPE}\",\"serial\": \"${SN}\",\"fqbn\": \"${FQBN}\"}" | \
                jq -r '.id')
    if [ $? -ne 0 ] || [ -z "$DEVICE_ID" ] || [ "$DEVICE_ID" == "null" ]; then
        echo -e $FAILURE
        return 1
    fi
    echo -n "id: $DEVICE_ID ... "
    echo -e $SUCCESS

    # Generate CSR
    echo -n "Generate new certificate request ... "
    create_csr $PIN $DEVICE_ID
    res=$?
    if [ $res -ne 0 ]; then
        echo -e $FAILURE
        return 1
    fi
    echo -e $SUCCESS

    # Get device certificate
    echo -n "Request device certificate ... "
    DEVICE_CERT=$(curl --silent --location                                                     \
                       --request PUT "${API_URL}/iot/v2/devices/${DEVICE_ID}/certs"            \
                       --header "Accept: application/json"                                     \
                       --header "Content-Type: application/json"                               \
                       --header "X-Organization: ${ORG_ID}"                                    \
                       --header "Authorization: Bearer ${ACCESS_TOKEN}"                        \
                       --data-raw "{\"ca\":\"Arduino_V2\",\"csr\":\"${CSR}\",\"enabled\":true}" | \
                  jq .pem | tr -d '"')
    if [ $? -ne 0 ] || [ -z "$DEVICE_CERT" ] || [ "$DEVICE_CERT" == "null" ]; then
        echo -e $FAILURE
        return 1
    fi
    echo -e $SUCCESS

    #echo $DEVICE_CERT

    # Cleanup remove csr temporary file
    rm -f /tmp/csr.csr

    # Process pem field to create a PEM file
    echo $DEVICE_CERT | sed 's/\\n/\n/g' > /tmp/device-certificate.pem
    res=$?
    if [ $res -ne 0 ]; then
        echo -n "Create device certificate PEM file ... "
        echo -e $FAILURE
        return 1
    fi

    # Store device certificate
    echo -n "Save device certificate ... "
    store_certificate $PIN /tmp/device-certificate.pem $SLOT
    res=$?
    if [ $res -ne 0 ]; then
        echo -e $FAILURE
        return 1
    fi
    echo -e $SUCCESS

    # Cleanup remove device certificate key file
    rm -f /tmp/device-certificate.pem

    # Update json file with DEVICE_ID
    echo -n "Save device id ... "
    cat $JSONFILE | jq --arg device_id "$DEVICE_ID" '.device_id |= $device_id' > /tmp/iot-config.json
    res=$?
    if [ $res -ne 0 ]; then
        echo -e $FAILURE
        return 1
    fi
    cp /tmp/iot-config.json $JSONFILE
    rm /tmp/iot-config.json
    echo -e $SUCCESS

    # Create default thing and dashboard
    echo -n "Create example thing and dashboard ... "
    create_thing $CLIENT_ID $CLIENT_SECRET $THING_NAME $DEVICE_ID $API_URL $ORG_ID
    res=$?
    if [ $res -ne 0 ]; then
        echo -e $FAILURE
        return 1
    fi
    echo -n "id: $THING_ID ... "
    echo -n "id: $DASHBOARD_ID ... "
    echo -e $SUCCESS

    return 0
}

create_tpm_key()
{
    SO_PIN=$1
    PIN=$2
    SLOT=$3

    # Initialize Arduino token. This will erase all the data stored.
    pkcs11-tool --module /usr/lib/libckteec.so.0 --init-token --slot-index $SLOT --label arduino --so-pin $SO_PIN  > /dev/null 2>&1
    res=$?
    if [ $res -ne 0 ]; then
        echo -n "Init Arduino token ... "
        echo -e $FAILURE
        return 1
    fi
    # Setup user PIN
    pkcs11-tool --module /usr/lib/libckteec.so.0 --init-pin --token-label arduino --so-pin $SO_PIN --pin $PIN > /dev/null 2>&1
    res=$?
    if [ $res -ne 0 ]; then
        echo -n "Configure user PIN ... "
        echo -e $FAILURE
        return 1
    fi
    # Generate device keypair
    pkcs11-tool --module /usr/lib/libckteec.so.0 --keypairgen --token-label arduino --key-type EC:prime256v1 --label device-key --id 0 --pin $PIN > /dev/null 2>&1
    res=$?
    if [ $res -ne 0 ]; then
        echo -n "Generate device keypair ... "
        echo -e $FAILURE
        return 1
    fi
    # Get key pkcs11 URI
    URI=$(p11tool --only-urls --provider=/usr/lib/libckteec.so.0 --list-all pkcs11:token=arduino;object=device-key)
    res=$?
    if [ $res -ne 0 ] || [ -z "$URI" ] || [ "$URI" == "null" ]; then
        echo -n "Read key URI ... "
        echo -e $FAILURE
        return 1
    fi
    # Process key URI
    URI=$(echo $URI | sed 's/object=device-key.*/object=device-key/')
    res=$?
    if [ $res -ne 0 ] || [ -z "$URI" ] || [ "$URI" == "null" ]; then
        echo -n "Process key URI ... "
        echo -e $FAILURE
        return 1
    fi
    #  Update json file with device key URI
    cat $JSONFILE | jq --arg key_uri "$URI" '.key_uri |= $key_uri' > /tmp/iot-config.json
    res=$?
    if [ $res -ne 0 ]; then
        echo -n "Store key uri in $JSONFILE ... "
        echo -e $FAILURE
        return 1
    fi
    cp /tmp/iot-config.json $JSONFILE
    rm /tmp/iot-config.json

    return 0
}

create_csr()
{
    PIN=$1
    DEVICE_ID=$2
    # Generate CSR
    OPENSSL_CONF=./openssl.conf openssl req -new -engine pkcs11 -keyform engine -passin pass:$PIN -key label_device-key -out /tmp/csr.csr -subj "/CN=${DEVICE_ID}" > /dev/null 2>&1
    res=$?
    if [ $res -ne 0 ]; then
        echo -n "Generate CSR ... "
        echo -e $FAILURE
        return 1
    fi
    # Process CSR
    CSR=$(cat /tmp/csr.csr | awk '{print $0"\\n"}' | tr -d '\n')
    if [ $res -ne 0 ] || [ -z "$CSR" ] || [ "$CSR" == "null" ]; then
        echo -n "Process CSR ... "
        echo -e $FAILURE
        return 1
    fi

    return 0
}

store_certificate()
{
    PIN=$1
    CERT_PATH=$2
    SLOT=$3

    # Create device certificate der file
    openssl x509 -outform DER -in $CERT_PATH -out /tmp/device-certificate.der
    res=$?
    if [ $res -ne 0 ]; then
        echo -n "Generate certificate DER file ... "
        echo -e $FAILURE
        return 1
    fi

    # Store device certificate
    pkcs11-tool --module /usr/lib/libckteec.so.0  --login --pin $PIN --write-object /tmp/device-certificate.der --type cert --slot $SLOT --label device-certificate --id 1 > /dev/null 2>&1
    res=$?
    if [ $res -ne 0 ]; then
        echo -n "Store certificate ... "
        echo -e $FAILURE
        return 1
    fi

    # Cleanup, remove certificate der file
    rm -f /tmp/device-certificate.der

    # Get certificate pkcs11 URI
    URI=$(p11tool --only-urls --provider=/usr/lib/libckteec.so.0 --list-all-certs pkcs11:token=arduino;object=device-certificate)
    res=$?
    if [ $res -ne 0 ] || [ -z "$URI" ] || [ "$URI" == "null" ]; then
        echo -n "Read certificate URI ... "
        echo -e $FAILURE
        return 1
    fi

    #  Update json file with device cert URI
    cat $JSONFILE | jq --arg cert_uri "$URI" '.cert_uri |= $cert_uri' > /tmp/iot-config.json
    res=$?
    if [ $res -ne 0 ]; then
        echo -n "Store certificate uri in $JSONFILE ... "
        echo -e $FAILURE
        return 1
    fi
    cp /tmp/iot-config.json $JSONFILE
    rm /tmp/iot-config.json

    return 0
}

create_thing()
{
    CLIENT_ID=$1
    CLIENT_SECRET=$2
    THING_NAME=$3
    DEVICE_ID=$4
    API_URL=$5
    ORG_ID=$6
    DASHBOARD_NAME=$THING_NAME

    if [ -z "$API_URL" ]; then
        echo "Using default API url https://api2.arduino.cc"
        API_URL="https://api2.arduino.cc"
    fi

    # Create a new thing from tempalte
    THING_ID=$(ARDUINO_CLOUD_CLIENT=$CLIENT_ID ARDUINO_CLOUD_SECRET=$CLIENT_SECRET ARDUINO_CLOUD_ORGANIZATION=$ORG_ID IOT_API_URL=$API_URL \
               arduino-cloud-cli thing create --name $THING_NAME --template thing-template.yml --format json | jq -r .id)
    if [ $? -ne 0 ] || [ -z "$THING_ID" ] || [ "$THING_ID" == "null" ]; then
        echo -n "Create new thing for the device ... "
        echo -e $FAILURE
        return 1
    fi

    # Bind thing to the board device_id
    ARDUINO_CLOUD_CLIENT=$CLIENT_ID ARDUINO_CLOUD_SECRET=$CLIENT_SECRET ARDUINO_CLOUD_ORGANIZATION=$ORG_ID IOT_API_URL=$API_URL \
        arduino-cloud-cli thing bind --id $THING_ID --device-id $DEVICE_ID
    if [ $? -ne 0 ]; then
        echo -n "Bind thing to the device ... "
        echo -e $FAILURE
        return 1
    fi

    # Create a new dashboard from template
    DASHBOARD_ID=$(ARDUINO_CLOUD_CLIENT=$CLIENT_ID ARDUINO_CLOUD_SECRET=$CLIENT_SECRET ARDUINO_CLOUD_ORGANIZATION=$ORG_ID IOT_API_URL=$API_URL \
                   arduino-cloud-cli dashboard create --name $DASHBOARD_NAME --template dashboard-template.yml \
                   --override x8-template=$THING_ID --format json | jq -r .id)
    if [ $? -ne 0 ]; then
        echo -n "Create new dashboard ... "
        echo -e $FAILURE
        return 1
    fi

    return 0
}

create_json()
{
    TEMPLATE=$1

    if [ -z "$TEMPLATE" ]; then
        TEMPLATE="./iot-config.template"
        echo "Using default template file $TEMPLATE"
    fi

    cp $TEMPLATE $JSONFILE
}

usage()
{
    echo "Usage:"
    echo "$0 -kcstf arg1...argN"
    echo "j: optional <template_file_path> create iot-config.json from template. Default template is ./iot-config.template"
    echo "k: <so_pin> <pin> <slot_index> Initialize TPM token <slot_index> and user <pin>. Create EC:prime256v1 keypair"
    echo "c: <pin> <device_id> create csr with tpm key and device_id"
    echo "s: <pin> <certificate path> <slot> store certificate pem file into tpm"
    echo "t: <client_id> <client_secret> <thing_name> <device_id> <api_url> create default thing object on aiot cloud for a given device_id"
    echo "f: <client_id> <client_secret> <thing_name> <api_url> do the provisioning using default values"
}

# Main
echo "$0: Started"

JSONFILE="/var/sota/iot-config.json"
TEMPLATE="/iot-config.template"

res=1
while getopts "jk:c:s:t:f:" arg; do
    case $arg in
        j)
            if [ $# -lt 1 ]; then
                usage
                break
            fi
            TEMPLATE=$2
            echo "create_json $TEMPLATE"
            create_json $TEMPLATE
            res=$?
            ;;
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
                echo "Please provide PIN, CERT_PATH and SLOT as cmd line args"
                usage
                break
            fi
            PIN=$2
            CERT_PATH=$3
            SLOT=$4
            store_certificate $PIN $CERT_PATH $SLOT
            res=$?
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
            ORG_ID=$7
            create_thing $CLIENT_ID $CLIENT_SECRET $THING_NAME $DEVICE_ID $API_URL $ORG_ID
            res=$?
            ;;
        f)
            if [ $# -lt 3 ]; then
                echo "Please provide CLIENT_ID and SECRET_ID as cmd line args"
                usage
                break
            fi
            CLIENT_ID=$2
            CLIENT_SECRET=$3
            THING_NAME=$4
            API_URL=$5
            ORG_ID=$6
            device_provisioning $CLIENT_ID $CLIENT_SECRET $THING_NAME $API_URL $ORG_ID
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
