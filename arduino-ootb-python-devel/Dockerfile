# Copyright (c) 2022 Arduino.cc
#

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
    make -C libteec/ && make -C libseteec && make -C libckteec

# build libp11
FROM eclipse-mosquitto:2.0.13 AS p11_build
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
FROM python:3.9-alpine3.16 AS kpn_senml_build

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
FROM python:3.9-alpine3.16 AS m2crypto_build
RUN set -ex \
    && apk add --no-cache --virtual -build-dep \
    build-base python3-dev openssl-dev swig

RUN set -ex \
    && pip3 wheel M2Crypto==0.38.0 --wheel-dir=/

# copy data to final container
FROM python:3.9-alpine3.16

# install openssl1.1-compat
RUN apk add --no-cache openssl openssl-dev

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

# copy kpn senml library
COPY --from=kpn_senml_build /senml-python-library/dist/kpn_senml-1.1.1-py3-none-any.whl /tmp

# copy m2crypto
COPY --from=m2crypto_build /M2Crypto-0.38.0-cp39-cp39-linux_aarch64.whl /tmp

# install m2crypto
RUN pip3 install /tmp/M2Crypto-0.38.0-cp39-cp39-linux_aarch64.whl

# install kpn-senml library
RUN pip3 install /tmp/kpn_senml-1.1.1-py3-none-any.whl

# install aiotcloud library
#RUN pip3 install https://github.com/bcmi-labs/python-aiotcloud/releases/download/v0.0.2/arduino_iot_cloud-0.0.2-py3-none-any.whl \
ADD arduino_iot_cloud-0.0.2-py3-none-any.whl /tmp/
RUN pip3 install /tmp/arduino_iot_cloud-0.0.2-py3-none-any.whl

# copy requirements.txt
COPY requirements.txt requirements.txt

# install dependencies
RUN pip3 install -r requirements.txt

# cleanup
RUN rm requirements.txt

# Install required packages
RUN apk add --no-cache dropbear openssh-client nano

# Create path required by dropbear ssh server
RUN mkdir -p /etc/dropbear

# Copy motd welcome message
COPY ./motd /etc/motd
RUN chmod 644 /etc/motd

COPY ./examples /root/examples
RUN chmod -R 755 /root/examples

COPY ./ca-root.pem /root/ca-root.pem
RUN chmod -R 644 /root/ca-root.pem

# Entrypoint
COPY ./entrypoint.sh /
RUN chmod 700 /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
