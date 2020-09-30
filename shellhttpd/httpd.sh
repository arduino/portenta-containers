#!/bin/sh -e

PORT="${PORT-8080}"
MSG="${MSG-OK}"

RESPONSE="HTTP/1.1 200 OK\r\n\r\n${MSG}\r\n"

while true; do
	echo -en "$RESPONSE" | nc -l -p "${PORT}" || true
	echo "= $(date) ============================="
done