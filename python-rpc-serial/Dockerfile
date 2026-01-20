FROM python:3.12-alpine3.23

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
    && pip3 uninstall -y setuptools jaraco.context || true \
    && pip3 install --no-cache-dir --upgrade pip wheel \
    && pip3 install --no-cache-dir "setuptools>=75.1.0" "jaraco.context>=6.1.0" \
    && pip3 --disable-pip-version-check --no-cache-dir install \
        -r requirements.txt \
    && pip3 install --upgrade "tornado>=6.5" \
    && apk del .build-deps \
    && rm ./requirements.txt

RUN find /usr/local/lib/python3.12/site-packages -name "jaraco.context-5.*" -exec rm -rf {} + || true

WORKDIR /app

COPY src/serialrpc.py .

RUN python3 -c "import importlib.metadata; v=importlib.metadata.version('jaraco.context'); print(f'Validated jaraco.context version: {v}'); assert tuple(map(int, v.split('.'))) >= (6, 1, 0)"

ENTRYPOINT [ "python3", "serialrpc.py"]
