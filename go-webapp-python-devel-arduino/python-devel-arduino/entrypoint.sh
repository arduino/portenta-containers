#!/bin/sh

echo "Setting correct permissions to ssh keys"
chmod -R 700 /root/.ssh
chmod 600 /root/.ssh/authorized_keys

echo "Starting dropbear ssh server"
dropbear -F -E -R -w -s -j -k
