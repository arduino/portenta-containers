# Copyright (c) 2022 Arduino.cc
#
# Source code courtesy of Paolo Calao <paolo.calao@gmail.com> and Massimo Pennazio <maxipenna@libero.it>

FROM node:14-alpine3.15 as build-node

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

ARG GIT_SHA
ENV VITE_OOTB_GIT_SHA_VERS=${GIT_SHA}

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
ARG OTA_LITE_TAG
ARG FACTORY
ARG LMP_DEVICE_API="https://api.foundries.io/ota/devices/"

# Build lmp-device-register from Foundries.io
RUN apk add --no-cache build-base cmake boost-dev boost-static curl-dev glib-dev &&\
    wget https://github.com/foundriesio/lmp-device-register/archive/refs/tags/mp-${RELEASE}.tar.gz -O /tmp/lmp.tar.gz

WORKDIR /lmp

RUN  tar xf /tmp/lmp.tar.gz --strip-components 1

WORKDIR /lmp/build

RUN cmake -DAKLITE_TAGS=ON DDEFAULT_TAG="${OTA_LITE_TAG}" -DGIT_COMMIT="${SRCREV}" -DHARDWARE_ID="portenta-x8" -DDEVICE_FACTORY="${FACTORY}" -DDEVICE_API="${LMP_DEVICE_API}" .. &&\
    make


FROM golang:1.19-alpine3.16 as build-go-app

WORKDIR /go/src

ADD ./api /go/src

RUN go mod download

RUN go build -o /go/bin/x8-ootb .


FROM golang:1.19-alpine3.16 as build-go-lmp

WORKDIR /go/src

ADD ./lmp-device-register.go ./go.mod ./go.sum /go/src/

RUN go mod download

RUN go build -o /go/bin/lmp-device-register .


FROM alpine:3.15

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

RUN apk update &&\
    apk add dbus networkmanager openssh-client avahi-tools openssl --no-cache

# Import env variables from ci build and append to image env
ARG OTA_LITE_TAG
ENV FACTORY_OTA_TAG=${OTA_LITE_TAG}
ARG GIT_SHA
ENV OOTB_GIT_SHA_VERS=${GIT_SHA}
ENV VITE_OOTB_GIT_SHA_VERS=${GIT_SHA}

RUN mkdir -p /app/webapp

COPY --from=build-go-app /go/bin/x8-ootb /app/x8-ootb

COPY --from=build-node /app/dist /app/webapp/dist

COPY --from=build-lmp /lmp/build/lmp-device-register /usr/bin/lmp-device-register
RUN chmod 755 /usr/bin/lmp-device-register

COPY --from=build-go-lmp /go/bin/lmp-device-register /usr/bin/lmp-device-register-go
RUN chmod 755 /usr/bin/lmp-device-register-go

# Entrypoint
COPY ./entrypoint.sh /
RUN chmod 700 /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
