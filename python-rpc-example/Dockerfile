# Copyright (c) 2022 Arduino.cc
#
# Source code courtesy of Martino Facchin <m.facchin@arduino.cc>

# Examples:
# docker build --tag "python-rpc-example:latest" .
# docker run -it --rm -v "/tmp:/tmp" -p "5000-5100:5000-5100" -it python-rpc-example:latest

FROM python:3-alpine3.15

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

RUN pip install msgpack-rpc-python

## We create an /app directory within our
## image that will hold our application source
## files
RUN mkdir /app

## We clone the source code
## into our /app directory
RUN apk update &&\
    apk add --no-cache git &&\
    cd /app &&\
    git clone https://github.com/arduino/portentax8-m4-proxy.git --branch master --single-branch src &&\
    apk del git

## We specify that we now wish to execute
## any further commands inside our /app
## directory
WORKDIR /app/src/python

## Our start command which kicks off
## our newly created binary executable
CMD ["python","-u","test.py"]
