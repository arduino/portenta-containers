#!/bin/sh

echo "Setting correct permissions to ssh keys"
chmod -R 700 /root/.ssh
chmod 644 /root/.ssh/id_rsa.pub
chmod 600 /root/.ssh/id_rsa

echo "Starting go application"
/app/main
