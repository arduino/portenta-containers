FROM debian:buster-slim AS wheelbuilder

RUN set -ef \
    && apt update \
    && apt install --no-install-recommends --yes python3-dev python3-pip python3-setuptools python3-wheel libglib2.0-dev build-essential

RUN set -ef \
    && pip3 wheel bluepy==1.3.0

FROM debian:buster-slim

RUN set -ef \
    && apt update \
    && apt install --no-install-recommends --yes bluez python3-pip

WORKDIR /App

COPY --from=wheelbuilder /bluepy-*.whl ./bluepy-1.3.0-cp37-cp37m-linux_aarch64.whl
RUN set -ef \
    && pip3 install bluepy-1.3.0-cp37-cp37m-linux_aarch64.whl

COPY src/blescanner.py .
RUN set -ef \
    && chmod +x blescanner.py

ENTRYPOINT [ "./blescanner.py" ]
