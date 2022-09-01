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
# docker build --tag hub.foundries.io/lmp/0chromium-imx8-aarch64:latest .
FROM debian:bullseye-20220316-slim AS build

LABEL maintainer="Raul Munoz <raul@foundries.io>"

ENV DEBIAN_FRONTEND noninteractive

#patches from: https://github.com/OSSystems/meta-browser/tree/master/meta-chromium/recipes-browser/chromium/files/chromium-wayland
# and https://github.com/OSSystems/meta-browser/tree/master/meta-chromium/recipes-browser/chromium/files
COPY [ \
      "setup_12.x", \
      "llvm.sh", \
      "create-links.sh", \
      "build-chromium.sh", \
      "patches/6e12c13c0165c94615928ca3d9692e91cf0619c4.patch", \
      "patches/0001-ozone-add-va-api-support-to-wayland.patch", \
      "patches/0001-ozone-wayland-fix-re-initialization-of-WBMG.patch", \
      "patches/0001-ozone-wayland-fixed-terminate-caused-by-binding-to-wrong-version.patch", \
      "patches/0007-Delete-compiler-options-not-available-in-release-ver.patch", \
      "patches/0014-ozone-wayland-don-t-build-xcb-for-pure-wayland-build.patch", \
      "patches/0015-IWYU-add-memory-for-std-unique_ptr-in-base-CommandLi.patch", \
      "/root/"]

RUN apt-get update -y && \
    apt-get install -y vim curl wget \
                       libwayland-client0 libwayland-server0 \
                       xcompmgr x11-utils uuid-dev subversion ruby \
                       rpm python-setuptools \
                       python-dev \
                       python pkg-config p7zip openbox mesa-common-dev \
                       libxtst6 libxtst-dev libxt-dev libxss-dev libxslt1-dev \
                       libxshmfence-dev libxrender1 libxrandr2 libxkbcommon-dev \
                       libxinerama1 libxi6 libxfixes3 libxdamage1 libxcursor1 \
                       libxcomposite1 libx11-xcb1 libwww-perl \
                       libwayland-egl1-mesa libvulkan1 libvulkan-dev libva-dev \
                       libudev-dev libssl-dev libsqlite3-dev libspeechd2 \
                       libspeechd-dev libsctp-dev libpulse0 libpulse-dev \
                       libpng16-16 libpixman-1-0 libpci3 libpci-dev \
                       libpango-1.0-0 libnss3-dev libnss3 libnspr4-dev \
                       libnspr4 libkrb5-dev libjpeg-dev libinput10 libinput-dev \
                       libgtk-3-dev libgtk-3-0 libglu1-mesa-dev libglib2.0-dev \
                       libglib2.0-0 libgbm1 libgbm-dev libfreetype6 \
                       libfontconfig1 libffi-dev libevdev2 libevdev-dev \
                       libelf-dev libdrm2 libdrm-dev libcurl4-gnutls-dev \
                       libcups2-dev libcups2 libcap2 libcap-dev libcairo2-dev \
                       libcairo2 libc6-dev libbz2-dev libbrlapi-dev \
                       libbluetooth-dev libatspi2.0-dev libatspi2.0-0 \
                       libatk1.0-0 libasound2-dev libasound2 \
                       gperf flex \
                       fakeroot elfutils devscripts dbus-x11 cdbs bison \
                       binutils-arm-linux-gnueabihf binutils-aarch64-linux-gnu \
                       apache2-bin libflac-dev flac lsb-release wget \
                       software-properties-common dirmngr apt-transport-https ca-certificates && \
    apt-get clean && \
    apt-get autoremove -y && \
    bash /root/setup_12.x && \
    apt-get --purge remove -y gcc g++ cpp && \
    apt-get update -y && \
    apt-get install -y gcc-10 g++-10 nodejs && \
    rm -rf /var/lib/apt/lists/* && \
    bash /root/llvm.sh && \
    bash /root/create-links.sh && \
    bash /root/build-chromium.sh

CMD ["/bin/bash"]