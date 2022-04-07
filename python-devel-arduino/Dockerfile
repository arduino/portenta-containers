# Copyright (c) 2022 Arduino.cc
#

FROM python:3-alpine3.15

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

# Copy requirements.txt first for better cache on later pushes
COPY requirements.txt requirements.txt

# pip install python deps from requirements.txt on the resin.io build server
RUN pip3 install -r requirements.txt

# Install required packages
RUN apk update &&\
    apk add dropbear openssh-client nano --no-cache

# Create path required by dropbear ssh server
RUN mkdir -p /etc/dropbear

# Copy motd welcome message
COPY ./motd /etc/motd
RUN chmod 644 /etc/motd

COPY ./examples /root/examples
RUN chmod -R 755 /root/examples

# Entrypoint
COPY ./entrypoint.sh /
RUN chmod 700 /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
