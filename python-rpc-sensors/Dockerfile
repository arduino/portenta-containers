# Copyright (c) 2022 Arduino.cc
#
# Source code courtesy of Martino Facchin <m.facchin@arduino.cc>

# Examples:
# docker build --tag python-rpc-sensors:latest .
# docker run -it --rm -v "/tmp:/tmp" -p "5000-5100:5000-5100" -it python-rpc-sensors:latest

FROM python:3-alpine3.15

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

RUN pip install msgpack-rpc-python

## We create an /app directory within our
## image that will hold our application source
## files
RUN mkdir /app && mkdir /app/python && mkdir /app/firmware

COPY ./python/main.py /app/python/main.py
COPY ./firmware/rpc-sensors /app/firmware/rpc-sensors

## We specify that we now wish to execute
## any further commands inside our /app
## directory
WORKDIR /app/python

## Our start command which kicks off
## our newly created binary executable
CMD ["python","-u","main.py"]
