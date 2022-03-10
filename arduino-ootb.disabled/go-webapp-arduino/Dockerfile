# Copyright (c) 2022 Arduino.cc
#
# Source code courtesy of Paolo Calao <paolo.calao@gmail.com> and Massimo Pennazio <maxipenna@libero.it>

FROM node:13.12.0-alpine as build

WORKDIR /app

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

COPY ./lmp-device-register /bin/lmp-device-register
RUN chmod 755 /bin/lmp-device-register

# Entrypoint
COPY ./entrypoint.sh /
RUN chmod 700 /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
