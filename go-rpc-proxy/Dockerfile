# Copyright (c) 2022 Arduino.cc
#
# Source code courtesy of Martino Facchin <m.facchin@arduino.cc>

# Examples:
# docker build --tag "go-rpc-proxy:latest" .
# docker run -it --rm --user "0" -v "/tmp:/tmp" --device "/dev/x8h7_ui" -p "5000-5100:5000-5100" -it go-rpc-proxy:latest

FROM golang:1.16.13-alpine3.15

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

RUN apk update &&\
    apk add --no-cache udev &&\
    apk add --no-cache python3

RUN pip3 install msgpack-rpc-python

## We create an /app directory within our
## image that will hold our application source
## files
RUN mkdir /app

## We copy everything in the root directory
## into our /app directory
ADD ./src /app

## We specify that we now wish to execute 
## any further commands inside our /app
## directory
WORKDIR /app/proxy

## Add this go mod download command to pull in any dependencies
RUN go mod download

## we run go build to compile the binary
## executable of our Go program
RUN go build -o main .

## Our start command which kicks off
## our newly created binary executable
CMD ["/app/proxy/main"]
