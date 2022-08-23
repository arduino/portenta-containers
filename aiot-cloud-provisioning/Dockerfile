# Copyright (c) 2022 Arduino.cc
#

# Examples:
# docker build --tag "arduino-iot-cloud-poc:latest" .
# docker run --rm -it --device=/dev/tee0:/dev/tee0 arduino-iot-cloud-poc:latest /bin/sh

FROM eclipse-mosquitto AS op_tee_build

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
    make -C libteec/ && make -C libseteec && make -C libckteec

# build libp11
FROM eclipse-mosquitto AS p11_build
ENV LIBP11_VERSION=0.4.11

RUN apk --no-cache add --virtual .build-deps autoconf automake build-base gettext openssl-dev libtool m4 readline-dev zlib-dev curl
RUN curl -fsL https://github.com/OpenSC/libp11/releases/download/libp11-${LIBP11_VERSION}/libp11-${LIBP11_VERSION}.tar.gz -o libp11-${LIBP11_VERSION}.tar.gz &&\
    tar -zxf libp11-${LIBP11_VERSION}.tar.gz &&\
    rm libp11-${LIBP11_VERSION}.tar.gz &&\
    cd libp11-${LIBP11_VERSION} &&\
    ./configure &&\
    make &&\
    make install

# build kpn senml
FROM python:3.9-alpine AS kpn_senml_build

RUN set -ex \
    && apk add --no-cache --virtual .build-dep \
        git build-base python3-dev

RUN set -ex \
    && git clone https://github.com/kpn-iot/senml-python-library \
    && cd senml-python-library \
    && git checkout 562ab57920a7abe4b2f960a58b403966d065241b \
    && python3 setup.py bdist_wheel \
    && cd ..

RUN set -ex \
    && apk del .build-dep

# build m2crypto
FROM python:3.9-alpine AS m2crypto_build
RUN set -ex \
    && apk add --no-cache --virtual -build-dep \
    build-base python3-dev openssl-dev swig

RUN set -ex \
    && pip3 wheel M2Crypto==0.38.0 --wheel-dir=/

# copy data to final container
FROM python:3.9-alpine

# copy libtee
COPY --from=op_tee_build /optee_client/out/libteec/libteec.so* /usr/lib/
COPY --from=op_tee_build /optee_client/out/libseteec/libseteec.so* /usr/lib/
COPY --from=op_tee_build /optee_client/out/libckteec/libckteec.so* /usr/lib/
COPY --from=op_tee_build /optee_client/public/*.h /usr/include/

# copy libp11
COPY --from=p11_build /usr/lib/engines-1.1/pkcs11.so /usr/lib/engines-1.1/pkcs11.so
RUN set -ex \
    && cd /usr/lib/engines-1.1 \
    && ln -s -f pkcs11.so libpkcs11.so

COPY ./iot-secrets.template /root/iot-secrets.template

# install tool to parse json files from cmd line
RUN set -ex \
    && apk add --no-cache jq

# Entrypoint
COPY ./entrypoint.sh /
RUN chmod 700 /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
