# Copyright (c) 2022 Arduino.cc
#
# Source code courtesy of Martino Facchin <m.facchin@arduino.cc>

# Examples:
# docker build --tag "go-rpc-proxy:latest" .
# docker run -it --rm --user "0" -v "/tmp:/tmp" --device "/dev/x8h7_ui" -p "5000-5100:5000-5100" -it go-rpc-proxy:latest

FROM golang:1.16.13-alpine

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

RUN apk update \
  && apk add --no-cache git

COPY app/ /app/

WORKDIR /app/src/proxy

RUN go mod download \
  && go build

## Our start command which kicks off
## our newly created binary executable
CMD [ "/app/src/proxy/proxy" ]
