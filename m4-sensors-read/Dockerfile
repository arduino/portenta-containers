# Copyright (c) 2022 Arduino.cc
#
# Source code courtesy of Martino Facchin <m.facchin@arduino.cc>

# Examples:
# docker build --tag python-rpc-sensors:latest .
# docker run -it --rm -v "/tmp:/tmp" -p "5000-5100:5000-5100" -it python-rpc-sensors:latest

FROM python:3-alpine

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

RUN pip install msgpack-rpc-python

RUN mkdir /app && mkdir /app/python && mkdir /app/firmware

COPY ./python/main.py /app/python/main.py
COPY ./firmware/rpc-sensors /app/firmware/rpc-sensors

WORKDIR /app/python

CMD [ "python", "-u", "main.py" ]

