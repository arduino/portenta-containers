#!/bin/sh -e

MSG="TEST MSG" httpd.sh &
pid=$!
sleep 1
wget -O- http://localhost:8080 | grep "TEST MSG"
kill $pid
