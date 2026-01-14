# Copyright (c) 2022 Arduino.cc
#
# Source code courtesy of Paolo Calao <paolo.calao@gmail.com> and Massimo Pennazio <maxipenna@libero.it>

FROM node:22-alpine3.20 AS build-node

WORKDIR /app

ENV PATH="/app/node_modules/.bin:${PATH}"

ARG GIT_SHA
ENV VITE_OOTB_GIT_SHA_VERS=${GIT_SHA}

COPY webapp/package.json ./

COPY webapp/package-lock.json ./

RUN npm ci

COPY ./webapp/ ./

RUN npm run build


FROM golang:1.25-alpine3.21 AS build-go-app

WORKDIR /go/src

ADD ./api /go/src

# Fix for CVE-2024-41110
RUN go mod download && \
    go get github.com/docker/docker@v23.0.15+incompatible && \
    go get github.com/labstack/echo/v4@v4.13.3 && \
    go get golang.org/x/crypto@v0.35.0 && \
    go mod tidy

RUN go build -o /go/bin/x8-ootb .


FROM alpine:3.21

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

RUN apk add --no-cache \
    dbus \
    networkmanager \
    modemmanager \
    openssh-client \
    avahi-tools \
    openssl

# Import env variables from ci build and append to image env
ARG OTA_LITE_TAG
ENV FACTORY_OTA_TAG=${OTA_LITE_TAG}
ARG GIT_SHA
ENV OOTB_GIT_SHA_VERS=${GIT_SHA}
ENV VITE_OOTB_GIT_SHA_VERS=${GIT_SHA}

RUN mkdir -p /app/webapp

COPY --from=build-go-app /go/bin/x8-ootb /app/x8-ootb

COPY --from=build-node /app/dist /app/webapp/dist

COPY ./api/mcc-mnc.csv /app/mcc-mnc.csv

# Entrypoint
COPY ./entrypoint.sh /
RUN chmod 700 /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
