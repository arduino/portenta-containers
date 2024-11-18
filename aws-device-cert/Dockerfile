# Copyright (c) 2022 Arduino.cc
#

FROM eclipse-mosquitto:2.0.13 AS op_tee_build

# A bit ahead of 3.15.0, to include support for secure element control (used by SE05X)
ENV OPTEE_CLIENT_VER "f4f54e5a76641fda22a49f00294771f948cd4c92"

# build TEE client and headers
RUN apk --no-cache add --virtual build-deps build-base git linux-headers \
  && git clone https://github.com/OP-TEE/optee_client.git \
  && cd optee_client \
  && git checkout ${OPTEE_CLIENT_VER} \
  && git config --global user.email "you@example.com" \
  && git config --global user.name "Your Name" \
  && wget https://raw.githubusercontent.com/foundriesio/meta-lmp/101b2fcad5d762e70205ae10219eb4e063af59a9/meta-lmp-base/recipes-security/optee/optee-client/0001-FIO-extras-pkcs11-change-UUID-to-avoid-conflict-with.patch \
  && git am 0001-FIO-extras-pkcs11-change-UUID-to-avoid-conflict-with.patch \
  && wget https://raw.githubusercontent.com/foundriesio/meta-lmp/101b2fcad5d762e70205ae10219eb4e063af59a9/meta-lmp-base/recipes-security/optee/optee-client/0001-libckteec-add-support-for-ECDH-derive.patch \
  && git am 0001-libckteec-add-support-for-ECDH-derive.patch \
  && make -C libteec/ \
  && make -C libseteec \
  && make -C libckteec

# build libp11
FROM eclipse-mosquitto:2.0.13 AS p11_build

ENV LIBP11_VERSION=0.4.11

RUN apk --no-cache add --virtual .build-deps \
  autoconf \
  automake \
  build-base \
  curl \
  gettext \
  openssl-dev \
  libtool \
  m4 \
  readline-dev \
  zlib-dev

RUN curl -fsL https://github.com/OpenSC/libp11/releases/download/libp11-${LIBP11_VERSION}/libp11-${LIBP11_VERSION}.tar.gz -o libp11-${LIBP11_VERSION}.tar.gz \
  && tar -zxf libp11-${LIBP11_VERSION}.tar.gz \
  && rm libp11-${LIBP11_VERSION}.tar.gz \
  && cd libp11-${LIBP11_VERSION} \
  && ./configure \
  && make \
  && make install

# copy data to final container
FROM python:3.9-alpine3.16

LABEL maintainer="Mattia Pennasilico <m.pennasilico@arduino.cc>"

# install openssl1.1-compat
RUN apk add --no-cache openssl openssl-dev

# copy libtee
COPY --from=op_tee_build /optee_client/out/libteec/libteec.so* /usr/lib/
COPY --from=op_tee_build /optee_client/out/libseteec/libseteec.so* /usr/lib/
COPY --from=op_tee_build /optee_client/out/libckteec/libckteec.so* /usr/lib/
COPY --from=op_tee_build /optee_client/public/*.h /usr/include/

# copy libp11
COPY --from=p11_build /usr/lib/engines-1.1/pkcs11.so /usr/lib/engines-1.1/pkcs11.so
RUN cd /usr/lib/engines-1.1 \
  && ln -s -f pkcs11.so libpkcs11.so

# install additional tools
RUN apk --no-cache add curl gnutls-utils opensc openssl

# openssl configuration file
COPY ./openssl.conf /
RUN chmod 644 /openssl.conf

# install awsiotsdk
RUN pip3 install awscrt awsiotsdk boto3

# @TODO: fixme
ENTRYPOINT [ "tail", "-f", "/dev/null" ]
