# Copyright (c) 2022 Arduino.cc
#

FROM golang:1.24.5-alpine3.21 AS build-arduino-cloud-cli

WORKDIR /go/src
RUN apk update \
  && apk --no-cache add git \
  && git clone -b 0.5.0 https://github.com/arduino/arduino-cloud-cli.git \
  && cd arduino-cloud-cli \
  && go get golang.org/x/sys@v0.29.0 \
  && go get golang.org/x/net@v0.33.0 \
  && go mod tidy \
  && go build -o /go/bin/arduino-cloud-cli .

FROM golang:1.23-alpine3.21 AS build-go-app

WORKDIR /go/src

ADD ./api /go/src

RUN go mod download \
  && go get github.com/golang-jwt/jwt/v5@v5.2.1 \
  && go get golang.org/x/crypto@v0.32.0 \
  && go get github.com/sirupsen/logrus@v1.9.3 \
  && go get golang.org/x/oauth2@v0.27.0 \
  && go get google.golang.org/grpc@v1.58.3 \
  && go mod tidy
RUN go build -o /go/bin/x8-aiotcp-api .

FROM eclipse-mosquitto:2.0.18 AS op_tee_build

# Version 4.4.0, to include support for secure element control (used by SE05X)
ENV OPTEE_CLIENT_VER="d221676a58b305bddbf97db00395205b3038de8e"

# build TEE client and headers
RUN apk --no-cache add --virtual build-deps build-base git linux-headers wget \
  && git clone --depth 1 --branch ${OPTEE_CLIENT_VER} https://github.com/OP-TEE/optee_client.git \
  && cd optee_client \
  && git config --global user.email "you@example.com" \
  && git config --global user.name "Your Name" \
  && wget https://raw.githubusercontent.com/foundriesio/meta-lmp/aa75703d6c459ae57b35882057e21ecf8a78f69d/meta-lmp-base/recipes-security/optee/optee-client/0001-FIO-extras-pkcs11-change-UUID-to-avoid-conflict-with.patch \
  && git am 0001-FIO-extras-pkcs11-change-UUID-to-avoid-conflict-with.patch \
  && make -C libteec/ \
  && make -C libseteec \
  && make -C libckteec

# build libp11
FROM eclipse-mosquitto:2.0.18 AS p11_build

ENV LIBP11_VERSION=0.4.12

RUN apk --no-cache add --virtual .build-deps autoconf automake build-base gettext openssl-dev libtool m4 readline-dev zlib-dev curl

RUN curl -fsL https://github.com/OpenSC/libp11/releases/download/libp11-${LIBP11_VERSION}/libp11-${LIBP11_VERSION}.tar.gz -o libp11-${LIBP11_VERSION}.tar.gz \
  && tar -zxf libp11-${LIBP11_VERSION}.tar.gz \
  && rm libp11-${LIBP11_VERSION}.tar.gz \
  && cd libp11-${LIBP11_VERSION} \
  && ./configure \
  && make \
  && make install

# copy data to final container
FROM python:3.12-alpine3.23

LABEL maintainer="Mattia Pennasilico <m.pennasilico@arduino.cc>"

# install openssl1.1-compat
RUN apk add --no-cache \
  gnutls-utils \
  curl \
  jq \
  opensc \
  openssl \
  openssl-dev 

# Copy libtee binaries
COPY --from=op_tee_build /optee_client/out/libteec/libteec.so* /usr/lib/
COPY --from=op_tee_build /optee_client/out/libseteec/libseteec.so* /usr/lib/
COPY --from=op_tee_build /optee_client/out/libckteec/libckteec.so* /usr/lib/

# Copy libtee headers - Adjusted for 4.4.0 source structure
COPY --from=op_tee_build /optee_client/libteec/include/*.h /usr/include/
COPY --from=op_tee_build /optee_client/libseteec/include/*.h /usr/include/
COPY --from=op_tee_build /optee_client/libckteec/include/*.h /usr/include/

# copy libp11
COPY --from=p11_build /usr/lib/engines-3/pkcs11.so /usr/lib/engines-3/pkcs11.so
COPY ./iot-config.template /root/iot-config.template
RUN cd /usr/lib/engines-3 \
  && ln -s -f pkcs11.so libpkcs11.so

# install arduino-cloud-cli
COPY --from=build-arduino-cloud-cli /go/bin/arduino-cloud-cli /usr/bin/arduino-cloud-cli
RUN chmod 755 /usr/bin/arduino-cloud-cli

# openssl configuration file
COPY ./openssl.conf /
RUN chmod 644 /openssl.conf

# example thing template
COPY ./thing-template.yml /
RUN chmod 644 /thing-template.yml

# dashboard configuration template
COPY ./dashboard-template.yml /
RUN chmod 644 ./dashboard-template.yml

# provisioning
COPY ./provisioning.sh /
RUN chmod 700 /provisioning.sh

# go webserver aiotcp-api
COPY --from=build-go-app /go/bin/x8-aiotcp-api /

# entrypoint
COPY ./entrypoint.sh /
RUN chmod 700 /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

