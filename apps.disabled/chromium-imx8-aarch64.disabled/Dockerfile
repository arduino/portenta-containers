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

FROM debian:bookworm-20221114-slim AS build

LABEL maintainer="Raul Munoz <raul@foundries.io>"

ENV DEBIAN_FRONTEND noninteractive

#patches from: https://github.com/OSSystems/meta-browser/tree/master/meta-chromium/recipes-browser/chromium/files/chromium-wayland
# and https://github.com/OSSystems/meta-browser/tree/master/meta-chromium/recipes-browser/chromium/files
COPY [ \
      "setup_12.x", \
      "llvm.sh", \
      "create-links.sh", \
      "build-chromium.sh", \
      "patches/0007-Delete-compiler-options-not-available-in-release-ver.patch", \
      "patches/0012-Build-X11-parts-only-for-ozone_platform_x11.patch", \
      "patches/0013-Fix-html_minifier-script-for-node-v12.patch", \
      "patches/0014-grit-util-py-remove-deprecated-mode-for-open.patch", \
      "/root/"]

RUN apt-get update -y && \
    apt-get install -y vim curl wget \
                       xcompmgr x11-utils uuid-dev subversion ruby \
                       pkg-config p7zip openbox mesa-common-dev \
                       libxtst6 libxtst-dev libxt-dev libxss-dev libxslt1-dev \
                       libxshmfence-dev libxrender1 libxrandr2 libxkbcommon-dev \
                       libxinerama1 libxi6 libxfixes3 libxdamage1 libxcursor1 \
                       libxcomposite1 libx11-xcb1 libwww-perl \
                       libvulkan1 libvulkan-dev libva-dev \
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
    apt-get autoremove -y 
    
COPY [ \
       "libffi7_3.3-6_arm64.deb", \
       "libffi-dev_3.3-6_arm64.deb", \
       "libwayland-client0_1.18.0-2~exp1.1_arm64.deb", \
       "libwayland-server0_1.18.0-2~exp1.1_arm64.deb", \ 
       "libwayland-egl1-mesa_20.3.5-1_arm64.deb", \ 
       "libwayland-cursor0_1.18.0-2~exp1.1_arm64.deb", \
       "libwayland-egl1_1.18.0-2~exp1.1_arm64.deb", \
       "libwayland-bin_1.18.0-2~exp1.1_arm64.deb", \ 
       "libwayland-dev_1.18.0-2~exp1.1_arm64.deb", \
       "/root/"]

    
RUN bash /root/setup_12.x
RUN apt-get --purge remove -y gcc g++ cpp
RUN apt-get update -y 
RUN apt-get install -y gcc-10 g++-10 nodejs

RUN apt-get update -y 
RUN apt-get install -y rpm python-setuptools python-dev-is-python3 python2-dev python2                        
RUN rm -rf /var/lib/apt/lists/* 

RUN bash /root/llvm.sh 
RUN bash /root/create-links.sh 

RUN dpkg -i /root/libffi7_3.3-6_arm64.deb 
RUN dpkg -i /root/libffi-dev_3.3-6_arm64.deb 
RUN dpkg -i /root/libwayland-client0_1.18.0-2~exp1.1_arm64.deb 
RUN dpkg -i /root/libwayland-server0_1.18.0-2~exp1.1_arm64.deb 
RUN dpkg -i /root/libwayland-egl1-mesa_20.3.5-1_arm64.deb      
RUN dpkg -i /root/libwayland-cursor0_1.18.0-2~exp1.1_arm64.deb 
RUN dpkg -i /root/libwayland-egl1_1.18.0-2~exp1.1_arm64.deb 
RUN dpkg -i /root/libwayland-bin_1.18.0-2~exp1.1_arm64.deb  
RUN dpkg -i /root/libwayland-dev_1.18.0-2~exp1.1_arm64.deb 


RUN bash /root/build-chromium.sh

CMD ["/bin/bash"]

