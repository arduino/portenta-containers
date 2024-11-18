# Copyright (c) 2022 Arduino.cc
#
# Source code courtesy of Martino Facchin <m.facchin@arduino.cc>

# Examples:
# docker build --tag "go-rpc-serial:latest" .
# docker run -it --rm --user "0" -v "/tmp:/tmp" --device "/dev/ttyGS0" -p "5000-5100:5000-5100" -it go-rpc-serial:latest

FROM golang:1.16.13-alpine

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

## We clone the source code
## into our /app directory
RUN apk update \
  && apk add --no-cache git
#  && cd /app \
#  && git clone https://github.com/arduino/portentax8-m4-proxy.git --branch master --single-branch src

COPY app/ /app/

## We specify that we now wish to execute
## any further commands inside our /app
## directory
WORKDIR /app/src/example

## Add this go mod download command to pull in any dependencies
RUN go mod download

## we run go build to compile the binary
## executable of our Go program
RUN go build

## Our start command which kicks off
## our newly created binary executable
CMD ["/app/src/example/example"]
