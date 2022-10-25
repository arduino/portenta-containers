# Copyright (c) 2022 Arduino.cc
#

FROM golang:1.16.13-alpine3.15 AS build-arduino-cloud-cli
WORKDIR /go/src
RUN set -ex \
    && apk --no-cache add git \
    && git clone -b 0.1.1 https://github.com/arduino/arduino-cloud-cli.git \
    && cd arduino-cloud-cli \
    && go build -o /go/bin/arduino-cloud-cli .

FROM golang:1.19-alpine3.16 as build-go-app
WORKDIR /go/src
ADD ./api /go/src
RUN go mod download
RUN go build -o /go/bin/x8-aiotcp-api .

FROM eclipse-mosquitto:2.0.13 AS op_tee_build

LABEL maintainer="Mattia Pennasilico <m.pennasilico@arduino.cc>"

# A bit ahead of 3.15.0, to include support for secure element control (used by SE05X)
ENV OPTEE_CLIENT_VER "f4f54e5a76641fda22a49f00294771f948cd4c92"

# build TEE client and headers
RUN apk --no-cache add --virtual build-deps git build-base linux-headers &&\
    git clone https://github.com/OP-TEE/optee_client.git &&\
    cd optee_client && git checkout ${OPTEE_CLIENT_VER} &&\
    git config --global user.email "you@example.com" &&\
    git config --global user.name "Your Name" &&\
    wget https://raw.githubusercontent.com/foundriesio/meta-lmp/101b2fcad5d762e70205ae10219eb4e063af59a9/meta-lmp-base/recipes-security/optee/optee-client/0001-FIO-extras-pkcs11-change-UUID-to-avoid-conflict-with.patch &&\
    git am 0001-FIO-extras-pkcs11-change-UUID-to-avoid-conflict-with.patch &&\
    wget https://raw.githubusercontent.com/foundriesio/meta-lmp/101b2fcad5d762e70205ae10219eb4e063af59a9/meta-lmp-base/recipes-security/optee/optee-client/0001-libckteec-add-support-for-ECDH-derive.patch &&\
    git am 0001-libckteec-add-support-for-ECDH-derive.patch &&\
    make -C libteec/ && make -C libseteec && make -C libckteec &&\
    cp -a out/libteec/libteec.so* /usr/lib/ &&\
    cp -a out/libseteec/libseteec.so* /usr/lib/ &&\
    cp -a out/libckteec/libckteec.so* /usr/lib/ &&\
    cp public/*.h /usr/include/

# build libp11
ENV LIBP11_VERSION=0.4.11

RUN apk --no-cache add --virtual .build-deps autoconf automake build-base gettext openssl-dev libtool m4 readline-dev zlib-dev curl
RUN curl -fsL https://github.com/OpenSC/libp11/releases/download/libp11-${LIBP11_VERSION}/libp11-${LIBP11_VERSION}.tar.gz -o libp11-${LIBP11_VERSION}.tar.gz &&\
    tar -zxf libp11-${LIBP11_VERSION}.tar.gz &&\
    rm libp11-${LIBP11_VERSION}.tar.gz &&\
    cd libp11-${LIBP11_VERSION} &&\
    ./configure &&\
    make &&\
    make install &&\
    apk del .build-deps

# install pkcs11-tool and others
RUN set -ex \
    && apk --no-cache add opensc gnutls-utils curl openssl

COPY ./iot-config.template /root/iot-config.template

# install tool to parse json files from cmd line
RUN set -ex \
    && apk add --no-cache jq

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
