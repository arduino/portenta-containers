#!/bin/sh

echo "Setting correct permissions to ssh keys"
mkdir -p /root/.ssh
cat /tmp/keys/id_rsa.pub > /root/.ssh/authorized_keys
chmod 700 /root/.ssh
chmod 600 /root/.ssh/authorized_keys

echo "Starting dropbear ssh server"
dropbear -F -E -R -s -j -k
