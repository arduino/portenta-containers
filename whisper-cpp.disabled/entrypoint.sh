#!/bin/sh

get_soundcard_number_from_id()
{
    ID=$1
    for item in $(ls /sys/class/sound/card*/id); do
        id=$(cat $item)
        if [ "$id" = "$ID" ]; then
            number=$(cat $(echo $item | sed -e 's/\/id$//')"/number")
            return $number
        fi
    done
    return -1
}

# Specific Arduino stuff, apply custom settings
# depending on board / carrier board combination
if [ -e /run/arduino_hw_info.env ]; then
    . /run/arduino_hw_info.env
    if [ "$BOARD" = "portenta-x8" ]; then
        if [ "$CARRIER_NAME" = "max" ]; then
            echo "Applying Arduino Portenta-X8 settings for Max carrier board"
            export CARD="cs42l52audio"
            export FMT="16le"
            echo "Configuring soundcard $CARD"
            get_soundcard_number_from_id $CARD
            n=$?
            if [ $n -lt 0 ]; then
                echo "Error! Cannot identify hw:n for soundcard $CARD"
                exit 1
            fi
            #amixer -c $n sset 'ADC Left Mux' 'Input2A'
            #amixer -c $n sset 'ADC Right Mux' 'Input2B'
            amixer -c $n sset 'ADC Left Mux' 'Input3A' # Mic Input
            amixer -c $n sset 'ADC Right Mux' 'Input3B' # Mic Input

            #amixer -c $n sset 'HP Left Amp' on
            #amixer -c $n sset 'HP Right Amp' on
            amixer -c $n sset 'Master' 204 # 0dB
            amixer -c $n sset 'Headphone' 192 # 0dB

            #amixer -c $n sset 'SPK Left Amp' on
            #amixer -c $n sset 'SPK Right Amp' on
            amixer -c $n sset 'Speaker' 192 # 0dB
        fi
    fi
fi

if [ "$CARD" = "da7213audio" ]; then
    echo "Configuring soundcard $CARD"
    get_soundcard_number_from_id $CARD
    n=$?
    if [ $n -lt 0 ]; then
        echo "Error! Cannot identify hw:n for soundcard $CARD"
        exit 1
    fi
    amixer -c $n sset 'Mixout Left DAC Left' unmute
    amixer -c $n sset 'Mixout Right DAC Right' unmute
    amixer -c $n sset 'Headphone' unmute
    amixer -c $n sset 'Lineout' unmute
    amixer -c $n sset 'Lineout' 81
fi

if [ -z $CARD ]; then
    echo "Error! No soundcard specified please set CARD env variable"
    exit 1
fi

./stream --capture $n -m models/ggml-tiny.en.bin
