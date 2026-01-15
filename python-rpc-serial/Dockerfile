FROM python:3.12-alpine3.20

USER root

RUN apk update && \
    apk add --no-cache \
    "busybox>1.36.1-r30" \
    "busybox-binsh>1.36.1-r30" \
    "ssl_client>1.36.1-r30" \
    "libcrypto3>=3.3.5-r0" \
    "libssl3>=3.3.5-r0" \
    "openssl>=3.3.5-r0"

COPY requirements.txt ./

RUN set -ex \
    && apk add --no-cache --virtual .build-deps build-base \
    && pip3 install --upgrade pip setuptools wheel \
    && pip3 --disable-pip-version-check --no-cache-dir install \
        -r requirements.txt \
    && pip3 install --upgrade \
        "jaraco.context>=6.1.0" \
        "tornado>=6.5" \
    && apk del .build-deps \
    && rm ./requirements.txt

WORKDIR /app

COPY src/serialrpc.py .

ENTRYPOINT [ "python3", "serialrpc.py"]
