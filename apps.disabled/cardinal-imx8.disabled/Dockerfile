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

FROM ghcr.io/arduino/debian-base-imx8-aarch64:stable

LABEL maintainer="Raul Munoz <raul@foundries.io>"

ENV DEBIAN_FRONTEND noninteractive

ENV WAYLAND_USER="weston"
ENV XDG_RUNTIME_DIR="/run/user/63"
ENV WAYLAND_DISPLAY="wayland-0"

ENV FIO_HOME /home/weston
ENV FIO_USERID 63
ENV FIO_USERNAME weston

ENV LC_ALL="en_US.UTF-8"
ENV PATH="/opt/flutter-elinux/bin:${PATH}"

RUN groupadd -g 61 render && \
    if [ ! "${FIO_USERID}" = "0" ]; then \
        groupadd -g ${FIO_USERID} ${FIO_USERNAME}; \
        useradd -d ${FIO_HOME} -s /bin/bash -m ${FIO_USERNAME} -u ${FIO_USERID} -g ${FIO_USERID} -G video,render; \
    fi && \
    apt-get update -y && \
    apt-get install -y --no-install-recommends \
                       wget \
                       libpciaccess-dev \
                       libxkbcommon0 \
                       libwayland-cursor0 \
                       libwayland-client0 \
                       libwayland-egl1 \
                       libwayland-server0 \
                       libwayland-dev \
    && apt-get clean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

RUN cd /home/weston \
    && wget https://github.com/DISTRHO/Cardinal/releases/download/22.10/Cardinal-linux-arm64-22.10.tar.gz \
    && tar xf Cardinal-linux-arm64-22.10.tar.gz \
    && rm Cardinal-linux-arm64-22.10.tar.gz

COPY --chown=${FIO_USERNAME} start.sh /

USER ${FIO_USERNAME}
WORKDIR ${FIO_HOME}

#ENTRYPOINT ["/start.sh"]
ENTRYPOINT ["/bin/bash"]