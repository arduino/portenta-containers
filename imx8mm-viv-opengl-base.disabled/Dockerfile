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

FROM ubuntu:20.04

LABEL maintainer="Massimo Pennazio <m.pennazio@arduino.cc>"

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && \
    apt-get install -y vim curl wget && \
    rm -rf /var/lib/apt/lists/*

COPY imx-gpu-viv_6.4.3.p1.4-aarch64-r0_arm64.deb /
COPY libdrm2_2.4.102.imx-r0_arm64.deb /
COPY libg2d1_6.4.3.p1.4-r0_arm64.deb /
COPY libgal-imx_6.4.3.p1.4-aarch64-r0_arm64.deb /

RUN dpkg -i libgal-imx_6.4.3.p1.4-aarch64-r0_arm64.deb
RUN dpkg -i libg2d1_6.4.3.p1.4-r0_arm64.deb
RUN dpkg -i libdrm2_2.4.102.imx-r0_arm64.deb

RUN apt-get -y update && apt-get install -y --no-install-recommends \
    libwayland-client0 \
    libwayland-server0 \
    && apt-get clean && apt-get autoremove && rm -rf /var/lib/apt/lists/*

RUN apt-get -y update && apt-get install -y libglib2.0-dev libnss3 libatk1.0-dev libatk-bridge2.0-0 libjpeg-turbo8 libdrm-dev \
    libxkbcommon0 libasound2 libflac8 libxslt1.1 fontconfig-config libwayland-cursor0 libwayland-client0 libwayland-egl1 libxdamage1 libxfixes3 \
    strace \
    && rm -rf /var/lib/apt/lists/*

RUN dpkg -i imx-gpu-viv_6.4.3.p1.4-aarch64-r0_arm64.deb

ENV WAYLAND_USER="weston"
ENV XDG_RUNTIME_DIR="/run/user/63"
ENV WAYLAND_DISPLAY="wayland-0"

# For local x86_64 testing
ENV FIO_HOME /home/weston
ENV FIO_USERID 63
ENV FIO_USERNAME weston

RUN groupadd -g 61 render

RUN if [ ! "${FIO_USERID}" = "0" ]; then \
        groupadd -g ${FIO_USERID} ${FIO_USERNAME}; \
        useradd -d ${FIO_HOME} -s /bin/bash -m ${FIO_USERNAME} -u ${FIO_USERID} -g ${FIO_USERID} -G video,render; \
    fi

USER ${FIO_USERNAME}
WORKDIR ${FIO_HOME}

COPY start.sh /

CMD ["/start.sh"]