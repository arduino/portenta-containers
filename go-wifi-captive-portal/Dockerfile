# Copyright (c) 2022 Arduino.cc
#
# Source code courtesy of Paolo Calao <paolo.calao@gmail.com> and Massimo Pennazio <maxipenna@libero.it>

# Examples:
# docker build --tag "go-wifi-captive-portal:latest" .
# docker run -it --rm --user "63" -e 'DBUS_SYSTEM_BUS_ADDRESS=unix:path=/run/dbus/system_bus_socket' -v /run/dbus:/run/dbus --network host --cap-add NET_ADMIN -it go-wifi-captive-portal:latest

FROM golang:1.16.13-alpine3.15

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

RUN apk update &&\
    apk add udev &&\
    apk add dbus &&\
    apk add networkmanager

## We create an /app directory within our
## image that will hold our application source
## files
RUN mkdir /app

## We copy everything in the root directory
## into our /app directory
ADD . /app

## We specify that we now wish to execute 
## any further commands inside our /app
## directory
WORKDIR /app

## Add this go mod download command to pull in any dependencies
RUN go mod download

## we run go build to compile the binary
## executable of our Go program
RUN go build -o main .

## Our start command which kicks off
## our newly created binary executable
CMD ["/app/main"]
