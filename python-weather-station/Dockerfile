FROM python:3.9-alpine AS Build

RUN set -ex \
    && apk add --no-cache --virtual .build-dep \
        git build-base python3-dev

RUN set -ex \
    && git clone https://github.com/kpn-iot/senml-python-library \
    && cd senml-python-library \
    && python3 setup.py bdist_wheel \
    && cd ..

RUN set -ex \
    && apk del .build-dep

FROM python:3.9-alpine

COPY --from=Build /senml-python-library/dist/kpn_senml-1.1.1-py3-none-any.whl ./
COPY requirements.txt ./

RUN set -ex \
    && pip3 --disable-pip-version-check --no-cache-dir install \
        -r requirements.txt \
    && rm ./kpn_senml-1.1.1-py3-none-any.whl \
    && rm ./requirements.txt

WORKDIR /app

COPY src/m4_to_cloud.py .

ENTRYPOINT [ "python3", "m4_to_cloud.py"]


