#!/bin/bash
set -e

SOUND_SUPERVISOR_PORT=${SOUND_SUPERVISOR_PORT:-80}
SOUND_SUPERVISOR="$(ip route | awk '/default / { print $3 }'):$SOUND_SUPERVISOR_PORT"
# Wait for sound supervisor to start
while ! curl --silent --output /dev/null "$SOUND_SUPERVISOR/ping"; do sleep 5; echo "Waiting for sound supervisor to start at $SOUND_SUPERVISOR"; done

# Get mode from sound supervisor. 
# mode: default to MULTI_ROOM
MODE=$(curl --silent "$SOUND_SUPERVISOR/mode" || true)
echo "MODE is $MODE"

# Start snapserver
if [[ "$MODE" == "MULTI_ROOM" ]]; then
  echo "Starting multi-room server..."
  /usr/bin/snapserver
else
  echo "Multi-room server disabled. Exiting..."
  exit 0
fi
