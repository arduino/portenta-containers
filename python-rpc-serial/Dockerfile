FROM python:3.9-alpine3.16

COPY requirements.txt ./

RUN set -ex \
    && pip3 --disable-pip-version-check --no-cache-dir install \
        -r requirements.txt \
    && rm ./requirements.txt

WORKDIR /app

COPY src/serialrpc.py .

ENTRYPOINT [ "python3", "serialrpc.py"]
