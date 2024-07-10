FROM python:3.9-alpine

COPY requirements.txt ./

RUN set -ex \
    && pip3 --disable-pip-version-check --no-cache-dir install \
        -r requirements.txt \
    && rm ./requirements.txt

# Set our working directory
WORKDIR /app

# This will copy all files in our root to the working  directory in the container
COPY ./src/multi_gateway.py ./
COPY ./src/at_protocol.py ./

RUN chmod 755 -R .

# lora-node.py will run when container starts up on the device
CMD ["python3","-u","multi_gateway.py"]
