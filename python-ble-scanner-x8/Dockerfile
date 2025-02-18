FROM debian:buster-slim AS wheelbuilder

RUN apt update \
  && apt install --no-install-recommends --yes \
  build-essential \
  libglib2.0-dev \
  python3-dev \
  python3-pip \
  python3-setuptools \
  python3-wheel

RUN pip3 wheel bluepy==1.3.0

FROM debian:buster-slim

RUN apt update \
  && apt install --no-install-recommends --yes bluez python3-pip

WORKDIR /App

COPY --from=wheelbuilder /bluepy-*.whl ./bluepy-1.3.0-cp37-cp37m-linux_aarch64.whl
RUN pip3 install bluepy-1.3.0-cp37-cp37m-linux_aarch64.whl

COPY src/blescanner.py .

ENTRYPOINT [ "./blescanner.py" ]
