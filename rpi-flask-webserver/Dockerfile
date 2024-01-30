# Copyright (c) 2022 Arduino.cc
#

# Examples:
# docker build --tag "rpi-flask-webserver:latest" .
# docker run -it --rm --privileged -p 80:80 rpi-flask-webserver:latest

FROM python:3-alpine3.15

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

# Set our working directory
WORKDIR /usr/src/app

# Copy requirements.txt first for better cache on later pushes
COPY requirements.txt requirements.txt

# pip install python deps from requirements.txt on the resin.io build server
RUN pip3 install -r requirements.txt

# This will copy all files in rpiWebServer to the working  directory in the container
ADD ./rpiWebServer ./

# Enable udevd so that plugged dynamic hardware devices show up in our container.
ENV UDEV=1

# app.py will run when container starts up on the device
CMD ["python3","-u","app.py"]
