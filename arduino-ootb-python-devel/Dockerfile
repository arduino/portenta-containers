# Copyright (c) 2022 Arduino.cc
#

FROM eclipse-mosquitto:2.0.13 AS op_tee_build

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

# build portenta-x8-eeprom-utils
FROM python:3.9-alpine3.16 as eeprom_utils_build

RUN apk add git g++ make cmake

RUN git clone https://github.com/pika-spark/portenta-x8-eeprom-utils && \
    cd portenta-x8-eeprom-utils && \
    mkdir build && \
    cd build && \
    cmake .. && \
    cmake --build .

# copy data to final container
FROM python:3.9-alpine3.16

LABEL maintainer="Mattia Pennasilico <m.pennasilico@arduino.cc>"

# install openssl1.1-compat and other required packages
RUN apk add --no-cache openssl openssh-client openssl-dev dropbear nano git newt pciutils

RUN apk add --no-cache alpine-sdk cmake linux-headers zlib-dev bsd-compat-headers

# install libubootenv to the correct version (0.3.2)
RUN git clone --depth 1 --branch v0.3.2 https://github.com/sbabic/libubootenv.git && \
    cd libubootenv && \
    mkdir build && \
    cd build && \
    cmake .. && \
    cmake --build . && \
    make install && \
    apk del alpine-sdk cmake linux-headers zlib-dev bsd-compat-headers && \
    cd ../../ && \
    rm -rf libubootenv

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
COPY --from=m2crypto_build /M2Crypto*.whl /tmp/

# copy portenta-x8-eeprom-utils
COPY --from=eeprom_utils_build /portenta-x8-eeprom-utils/build/eepdump /usr/bin/eepdump
COPY --from=eeprom_utils_build /portenta-x8-eeprom-utils/build/eepmake /usr/bin/eepmake
COPY --from=eeprom_utils_build /portenta-x8-eeprom-utils/eepflash.sh /usr/bin/eepflash.sh

# install m2crypto
RUN pip3 install --find-links=/tmp --no-index M2Crypto

# install kpn-senml library
RUN pip3 install /tmp/kpn_senml-1.1.1-py3-none-any.whl

# install aiotcloud library
#RUN pip3 install https://github.com/bcmi-labs/python-aiotcloud/releases/download/v0.0.2/arduino_iot_cloud-0.0.2-py3-none-any.whl \
ADD arduino_iot_cloud-0.0.2-py3-none-any.whl /tmp/
RUN pip3 install /tmp/arduino_iot_cloud-0.0.2-py3-none-any.whl

# copy requirements.txt
COPY requirements.txt requirements.txt

# install dependencies
RUN pip3 install --no-deps -r requirements.txt

# cleanup
RUN rm requirements.txt && apk del git

# Create path required by dropbear ssh server
RUN mkdir -p /etc/dropbear

# Copy motd welcome message
COPY ./motd /etc/motd
RUN chmod 644 /etc/motd

COPY ./ca-root.pem /etc/ssl/certs/ca-cert-Arduino.pem
RUN chmod -R 644 /etc/ssl/certs/ca-cert-Arduino.pem

RUN ln -s /usr/lib/engines-1.1/ /usr/lib/engines-3

COPY ./examples /root/examples
RUN chmod -R 755 /root/examples

# Copy tenta-config related stuff
COPY ./eeprom_settings.txt /root/examples/tenta-config
COPY ./portenta_hat_carrier.txt /root/examples/tenta-config

# Entrypoint
COPY ./entrypoint.sh /
RUN chmod 700 /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
