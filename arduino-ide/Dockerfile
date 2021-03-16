# Copyright (c) 2021 Foundries.io
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# For local x86_64 testing
# docker run -it --rm --privileged --net=host --user=fio -v /tmp/.X11-unix:/tmp/.X11-unix arduino-ide

FROM debian:bullseye-slim

LABEL maintainer "Michael Scott <mike@foundries.io>"

ENV DEBIAN_FRONTEND noninteractive
ENV DISPLAY :0

ENV ARDUINO_VERS 1.8.13

ENV ARDUINO_ARCH linuxaarch64
ENV ARDUINO_SHA 07aee78dd7a3e7231f2d3ee9bfe7283e337b171419baf06f83a2daf9a7879654
ENV ARDUINO_HOME /root
ENV ARDUINO_USER root

# For local x86_64 testing
# ENV ARDUINO_ARCH linux64
# ENV ARDUINO_SHA 1b20d0ec850a2a63488009518725f058668bb6cb48c321f82dcf47dc4299b4ad
# ENV ARDUINO_HOME /home/fio
# ENV ARDUINO_USER fio

ENV ARDUINO_FILE arduino-${ARDUINO_VERS}-${ARDUINO_ARCH}.tar.xz

RUN apt-get update && \
    apt-get install -y wget xz-utils && \
    wget -q https://downloads.arduino.cc/${ARDUINO_FILE} && \
    sha256sum /${ARDUINO_FILE} | grep ${ARDUINO_SHA} && \
    tar -xJf /${ARDUINO_FILE} && \
    mv /arduino-${ARDUINO_VERS} /arduino && \
    mkdir -p /usr/share/man/man1 && \
    apt-get install -y git openjdk-11-jdk && \
    rm -rf /arduino/java && \
    rm /${ARDUINO_FILE} && \
    rm -rf /var/lib/apt/lists/*

COPY start.sh /

RUN if [ ! "${ARDUINO_USER}" = "root" ]; then \
        groupadd -g 1000 ${ARDUINO_USER}; \
        useradd -d ${ARDUINO_HOME} -s /bin/bash -m ${ARDUINO_USER} -u 1000 -g 1000; \
    fi

USER ${ARDUINO_USER}
WORKDIR ${ARDUINO_HOME}

# Autorun arduino
ENTRYPOINT ["/start.sh"]
