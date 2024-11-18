# Copyright (c) 2022 Arduino.cc
#
# Source code courtesy of Martino Facchin <m.facchin@arduino.cc>

# Examples:
# docker build --tag python-rpc-example:latest .
# docker run -it --rm -v "/tmp:/tmp" -p "5000-5100:5000-5100" -it python-rpc-example:latest

FROM python:3.9-alpine

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

WORKDIR /app

RUN pip install msgpack-rpc-python

COPY test.py /app/

## Our start command which kicks off
## our newly created binary executable
CMD [ "python", "-u", "test.py" ]
