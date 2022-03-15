# Copyright (c) 2022 Arduino.cc
#
# Source code courtesy of Paolo Calao <paolo.calao@gmail.com> and Massimo Pennazio <maxipenna@libero.it>

FROM node:14-alpine3.15 as build-node

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY webapp/package.json ./

COPY webapp/package-lock.json ./

RUN npm ci --silent

COPY ./webapp/ ./

RUN npm run build


FROM alpine:3.15 as build-lmp

WORKDIR /src

# Import env variables from ci build
ARG RELEASE="83"
ARG SRCREV=e54fb99d3b19543f2b16595b6710a0211b207d75
ARG LMP_DEVICE_REGISTER_TAG="experimental"
ARG LMP_DEVICE_FACTORY="arduino"
ARG LMP_DEVICE_API="https://api.foundries.io/ota/devices/"

# Build lmp-device-register from Foundries.io
RUN apk add --no-cache build-base cmake boost-dev boost-static curl-dev glib-dev &&\
    wget https://github.com/foundriesio/lmp-device-register/archive/refs/tags/mp-${RELEASE}.tar.gz -O /tmp/lmp.tar.gz

WORKDIR /lmp

RUN  tar xf /tmp/lmp.tar.gz --strip-components 1

WORKDIR /lmp/build

RUN cmake -DAKLITE_TAGS=ON DDEFAULT_TAG="${LMP_DEVICE_REGISTER_TAG}" -DGIT_COMMIT="${SRCREV}" -DHARDWARE_ID="portenta-x8" -DDEVICE_FACTORY="${LMP_DEVICE_FACTORY}" -DDEVICE_API="${LMP_DEVICE_API}" .. &&\
    make


FROM golang:1.16.13-alpine3.15 as build-go-app

WORKDIR /app

ADD ./api /app

RUN go mod download

RUN go build -o x8-ootb .


FROM golang:1.16.13-alpine3.15 as build-go-lmp

WORKDIR /lmp

ADD ./lmp-device-register-go ./go.mod /lmp

RUN go mod download

RUN go build -o lmp-device-register .


FROM alpine:3.15

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

RUN apk update &&\
    apk add dbus networkmanager openssh-client avahi-tools openssl --no-cache

RUN mkdir -p /app/webapp

COPY --from=build-go-app /app/x8-ootb /app/x8-ootb

COPY --from=build-node /app/dist /app/webapp/dist

COPY --from=build-lmp /lmp/build/lmp-device-register /usr/bin/lmp-device-register
RUN chmod 755 /usr/bin/lmp-device-register

COPY --from=build-lmp-go /lmp/lmp-device-register /usr/bin/lmp-device-register-go
RUN chmod 755 /usr/bin/lmp-device-register-go

# Entrypoint
COPY ./entrypoint.sh /
RUN chmod 700 /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
