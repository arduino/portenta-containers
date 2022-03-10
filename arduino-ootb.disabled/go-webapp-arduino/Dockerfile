# Copyright (c) 2022 Arduino.cc
#
# Source code courtesy of Paolo Calao <paolo.calao@gmail.com> and Massimo Pennazio <maxipenna@libero.it>

FROM node:14-alpine3.15 as build

WORKDIR /app

# Import env variables from ci build
ARG SRCREV=e54fb99d3b19543f2b16595b6710a0211b207d75
ARG LMP_DEVICE_REGISTER_TAG=${LMP_DEVICE_REGISTER_TAG}
ARG LMP_DEVICE_FACTORY=${LMP_DEVICE_FACTORY}
ARG LMP_DEVICE_API=${LMP_DEVICE_API}

# Build lmp-device-register from Foundries.io
RUN apk add --no-cache build-base cmake boost-dev boost-static curl-dev glib-dev &&\
    wget https://github.com/foundriesio/lmp-device-register/archive/refs/tags/mp-83.tar.gz &&\
    tar xf mp-83.tar.gz &&\
    cd lmp-device-register-mp-83 &&\
    mkdir build && cd build &&\
    cmake -DAKLITE_TAGS=ON DDEFAULT_TAG="${LMP_DEVICE_REGISTER_TAG}" -DGIT_COMMIT="${SRCREV}" -DHARDWARE_ID="portenta-x8" -DDEVICE_FACTORY="${LMP_DEVICE_FACTORY}" -DDEVICE_API="${LMP_DEVICE_API}" .. &&\
    make

ENV PATH /app/node_modules/.bin:$PATH

COPY webapp/package.json ./

COPY webapp/package-lock.json ./

RUN npm ci --silent

COPY ./webapp/ ./

RUN npm run build


FROM golang:1.16.13-alpine3.15

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

RUN apk update &&\
    apk add dbus networkmanager openssh-client avahi-tools --no-cache

## We create an /app directory within our
## image that will hold our application source
## files
RUN mkdir /app

## We copy everything in the root directory
## into our /app directory
ADD ./api /app

## We specify that we now wish to execute
## any further commands inside our /app
## directory
WORKDIR /app

## Add this go mod download command to pull in any dependencies
RUN go mod download

## We run go build to compile the binary
## executable of our Go program
RUN go build -o x8-oob .

COPY --from=build /app/dist /app/webapp/dist

COPY --from=build /app/build/lmp-device-register /bin/lmp-device-register
RUN chmod 755 /bin/lmp-device-register

# Entrypoint
COPY ./entrypoint.sh /
RUN chmod 700 /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
