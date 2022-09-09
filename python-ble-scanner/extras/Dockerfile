FROM debian:stable-slim

RUN set -ef \
    && apt update \
    && apt install --no-install-recommends --yes bluez python3-pip

WORKDIR /App

COPY wheels/bluepy-1.3.0-cp39-cp39-linux_aarch64.whl .
RUN set -ef \
    && pip3 install bluepy-1.3.0-cp39-cp39-linux_aarch64.whl

COPY src/blescanner.py .
RUN set -ef \
    && chmod +x blescanner.py

ENTRYPOINT [ "./blescanner.py" ]
