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
FROM hub.foundries.io/lmp/0chromium-imx8-aarch64 AS build

FROM hub.foundries.io/lmp/0debian-base-imx8-aarch64

LABEL maintainer="Raul Munoz <raul@foundries.io>"

ENV DEBIAN_FRONTEND noninteractive

ENV WAYLAND_USER="weston"
ENV XDG_RUNTIME_DIR="/run/user/63"
ENV WAYLAND_DISPLAY="wayland-0"

ENV FIO_HOME /home/weston
ENV FIO_USERID 63
ENV FIO_USERNAME weston

RUN groupadd -g 61 render && \
    if [ ! "${FIO_USERID}" = "0" ]; then \
        groupadd -g ${FIO_USERID} ${FIO_USERNAME}; \
        useradd -d ${FIO_HOME} -s /bin/bash -m ${FIO_USERNAME} -u ${FIO_USERID} -g ${FIO_USERID} -G video,render; \
    fi && \
    apt-get update -y && \
    apt-get install -y --no-install-recommends \
                       libexpat1 \
                       libpciaccess-dev \
                       libnss3 \
                       libatk1.0-0  \
                       libatk-bridge2.0-0 \
                       libjpeg62-turbo \
                       libxkbcommon0 \
                       libasound2 \
                       libflac8 \
                       libxslt1.1 \
                       libwayland-cursor0 \
                       libwayland-client0 \
                       libwayland-egl1 \
                       libwayland-server0 \
                       fontconfig-config && \
    apt-get clean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* && \
    mkdir -p /share/icons/hicolor/{16x16,22x22,24x24,32x32,48x48,64x64,128x128,256x256}/apps/ && \
    mkdir -p /usr/lib/chromium/locales && \
    ln -s /usr/lib/chromium/chrome-wrapper /usr/bin/chrome

COPY --chown=${FIO_USERNAME} --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/default_100_percent/chromium/product_logo_16.png /share/icons/hicolor/16x16/apps/chromium.png
COPY --chown=${FIO_USERNAME} --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/default_100_percent/chromium/product_logo_name_22.png /share/icons/hicolor/22x22/apps/chromium.png
COPY --chown=${FIO_USERNAME} --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/chromium/product_logo_24.png /share/icons/hicolor/24x24/apps/chromium.png
COPY --chown=${FIO_USERNAME} --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/default_100_percent/chromium/product_logo_32.png /share/icons/hicolor/32x32/apps/chromium.png
COPY --chown=${FIO_USERNAME} --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/chromium/product_logo_48.png /share/icons/hicolor/48x48/apps/chromium.png
COPY --chown=${FIO_USERNAME} --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/chromium/product_logo_64.png /share/icons/hicolor/64x64/apps/chromium.png
COPY --chown=${FIO_USERNAME} --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/chromium/product_logo_128.png /share/icons/hicolor/128x128/apps/chromium.png
COPY --chown=${FIO_USERNAME} --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/chromium/product_logo_256.png /share/icons/hicolor/256x256/apps/chromium.png
COPY --chown=${FIO_USERNAME} --from=build /chromium/chromium-96.0.4664.110/out/Default/resources.pak  /usr/lib/chromium/resources.pak 
COPY --chown=${FIO_USERNAME} --from=build /chromium/chromium-96.0.4664.110/out/Default/locales/*.pak  /usr/lib/chromium/locales/
COPY --chown=${FIO_USERNAME} --from=build [ \
      "/chromium/chromium-96.0.4664.110/out/Default/*.pak", \
      "/chromium/chromium-96.0.4664.110/out/Default/chrome_crashpad_handler", \
      "/chromium/chromium-96.0.4664.110/out/Default/chrome", \
      "/chromium/chromium-96.0.4664.110/out/Default/*.bin", \
      "/chromium/chromium-96.0.4664.110/out/Default/icudtl.dat", \
      "/chromium/chromium-96.0.4664.110/out/Default/chrome-wrapper", \
      "/usr/lib/chromium/"]
COPY --chown=${FIO_USERNAME} start.sh /

USER ${FIO_USERNAME}
WORKDIR ${FIO_HOME}

ENTRYPOINT ["/start.sh"]