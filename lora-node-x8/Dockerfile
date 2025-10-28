FROM python:3.9-alpine

COPY requirements.txt ./

RUN pip3 --disable-pip-version-check --no-cache-dir install -r requirements.txt \
  && rm ./requirements.txt

# Set our working directory
WORKDIR /app

COPY ./src/lora-node.py ./
COPY ./src/at_protocol.py ./

# lora-node.py will run when container starts up on the device
#CMD ["python3","-u","lora-node.py"]
