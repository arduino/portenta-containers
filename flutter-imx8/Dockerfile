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

# For testing in the LmP
# docker build --tag hub.foundries.io/lmp/x-kiosk-imx8:latest .
# docker run -it --rm --device-cgroup-rule='c 199:* rmw' --device-cgroup-rule='c 226:* rmw' -v /run/user/63:/run/user/63 -v /dev/dri:/dev/dri -v /dev/galcore:/dev/galcore --entrypoint /bin/bash hub.foundries.io/lmp/x-kiosk-imx8:latest
# /start.sh
# or
# docker run -it --rm --device-cgroup-rule='c 199:* rmw' --device-cgroup-rule='c 226:* rmw' -v /run/user/63:/run/user/63 -v /dev/dri:/dev/dri -v /dev/galcore:/dev/galcore hub.foundries.io/lmp/x-kiosk-imx8:latest
FROM hub.foundries.io/lmp/0flutter-imx8-aarch64 AS build

FROM hub.foundries.io/lmp/0debian-base-imx8-aarch64

LABEL maintainer="Raul Munoz <raul@foundries.io>"

ENV DEBIAN_FRONTEND noninteractive

ENV WAYLAND_USER="weston"
ENV XDG_RUNTIME_DIR="/run/user/63"
ENV WAYLAND_DISPLAY="wayland-0"

ENV FIO_HOME /home/weston
ENV FIO_USERID 63
ENV FIO_USERNAME weston

ENV LD_LIBRARY_PATH=/opt/flutter-elinux/flutter/bin/cache/artifacts/engine/elinux-arm64-debug/
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
                       git \
                       pkg-config \
                       meson \
                       build-essential \
                       autoconf \
                       automake \
                       ca-certificates && \
    apt-get clean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=${FIO_USERNAME} /opt/flutter-elinux/ /opt/flutter-elinux/
COPY --from=build --chown=${FIO_USERNAME} /root/flutter-embedded-linux/ ${FIO_HOME}/flutter-embedded-linux/
COPY --from=build --chown=${FIO_USERNAME} /root/sample/ ${FIO_HOME}/sample/
COPY --from=build --chown=${FIO_USERNAME} /root/gallery ${FIO_HOME}/gallery
COPY --from=build --chown=${FIO_USERNAME} /opt/flutter-elinux/flutter/bin/cache/artifacts/engine/elinux-arm64-debug/libflutter_engine.so ${FIO_HOME}/flutter-embedded-linux/build/
COPY --chown=${FIO_USERNAME} start.sh /

USER ${FIO_USERNAME}
WORKDIR ${FIO_HOME}

ENTRYPOINT ["/start.sh"]