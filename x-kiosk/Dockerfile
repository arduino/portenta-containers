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
# docker run -it --rm --privileged --net=host --user=fio -v /tmp/.X11-unix:/tmp/.X11-unix x-kiosk --kiosk www.arduino.cc

FROM debian:bullseye-slim

LABEL maintainer="Michael Scott <mike@foundries.io>"

ENV DEBIAN_FRONTEND noninteractive
ENV DISPLAY :0

ENV ARDUINO_HOME /root
ENV ARDUINO_USERID 0
ENV ARDUINO_USERNAME root

# For local x86_64 testing
# ENV ARDUINO_HOME /home/fio
# ENV ARDUINO_USERID 1000
# ENV ARDUINO_USERNAME fio

RUN apt-get update && \
    apt-get install -y chromium && \
    rm -rf /var/lib/apt/lists/*

RUN if [ ! "${ARDUINO_USERID}" = "0" ]; then \
        groupadd -g ${ARDUINO_USERID} ${ARDUINO_USERNAME}; \
        useradd -d ${ARDUINO_HOME} -s /bin/bash -m ${ARDUINO_USERNAME} -u ${ARDUINO_USERID} -g ${ARDUINO_USERID}; \
    fi

USER ${ARDUINO_USERNAME}
WORKDIR ${ARDUINO_HOME}

COPY start.sh /

ENTRYPOINT ["/start.sh"]
