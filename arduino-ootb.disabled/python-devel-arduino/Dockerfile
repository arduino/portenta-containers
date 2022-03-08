# Copyright (c) 2022 Arduino.cc
#

FROM python:3-alpine3.15

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

# Install required deps for building python modules
RUN apk update &&\
    apk add --no-cache build-base

# Copy requirements.txt first for better cache on later pushes
COPY requirements.txt requirements.txt

# pip install python deps from requirements.txt on the resin.io build server
RUN pip3 install -r requirements.txt

# Remove buld deps from final container image and install
# remaining packages
RUN apk del build-base &&\
    apk add dropbear openssh-client --no-cache

# Enable udevd so that plugged dynamic hardware devices show up in our container.
ENV UDEV=1

# Copying keys, setting correct permissions
RUN mkdir -p /etc/dropbear

# Entrypoint
COPY ./entrypoint.sh /
RUN chmod 700 /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
