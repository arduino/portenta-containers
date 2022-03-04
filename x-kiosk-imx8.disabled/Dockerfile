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
# docker build --tag hub.foundries.io/arduino/x-kiosk-imx8:latest .
# docker run -it --rm --device-cgroup-rule='c 199:* rmw' --device-cgroup-rule='c 226:* rmw' -v /run/user/63:/run/user/63 -v /dev/dri:/dev/dri -v /dev/galcore:/dev/galcore --entrypoint /bin/bash hub.foundries.io/arduino/x-kiosk-imx8:latest
# /usr/lib/chromium/chrome --use-gl=egl --ozone-platform=wayland --no-sandbox --disable-features=VizDisplayCompositor --in-process-gpu --start-maximized --disk-cache-size=33554432 --enable-features=VaapiVideoDecoder --enable-crashpad --flag-switches-begin --flag-switches-end google.com
# or
# docker run -it --rm --device-cgroup-rule='c 199:* rmw' --device-cgroup-rule='c 226:* rmw' -v /run/user/63:/run/user/63 -v /dev/dri:/dev/dri -v /dev/galcore:/dev/galcore hub.foundries.io/arduino/x-kiosk-imx8:latest

FROM ubuntu:20.04 AS build

LABEL maintainer="Raul Munoz <raul@foundries.io>"

RUN apt-get update && \
    apt-get install -y vim curl wget && \
    rm -rf /var/lib/apt/lists/*

ENV DEBIAN_FRONTEND noninteractive

# Install Chromium

ENV WAYLAND_USER="weston"
ENV XDG_RUNTIME_DIR="/run/user/63"
ENV WAYLAND_DISPLAY="wayland-0"

    
RUN apt-get -y update && apt-get install -y --no-install-recommends \
    libwayland-client0 \
    libwayland-server0 \
    && apt-get clean && apt-get autoremove && rm -rf /var/lib/apt/lists/*

RUN apt-get update && \
    apt-get install -y xcompmgr x11-utils uuid-dev subversion ruby rpm python-yaml python-setuptools python-psutil python-openssl python-numpy python-dev python-crypto python pkg-config p7zip openbox mesa-common-dev libxtst6 libxtst-dev libxt-dev libxss-dev libxslt1-dev libxshmfence-dev libxrender1 libxrandr2 libxkbcommon-dev libxinerama1 libxi6 libxfixes3 libxdamage1 libxcursor1 libxcomposite1 libx11-xcb1 libwww-perl libwayland-egl1-mesa libvulkan1 libvulkan-dev libva-dev libudev-dev libssl-dev libsqlite3-dev libspeechd2 libspeechd-dev libsctp-dev libpulse0 libpulse-dev libpng16-16 libpixman-1-0 libpci3 libpci-dev libpango-1.0-0 libnss3-dev libnss3 libnspr4-dev libnspr4 libkrb5-dev libjpeg-dev libinput10 libinput-dev libgtk-3-dev libgtk-3-0 libglu1-mesa-dev libglib2.0-dev libglib2.0-0 libgbm1 libgbm-dev libfreetype6 libfontconfig1 libffi-dev libevdev2 libevdev-dev libelf-dev libdrm2 libdrm-dev libcurl4-gnutls-dev libcups2-dev libcups2 libcap2 libcap-dev libcairo2-dev libcairo2 libc6-dev libbz2-dev libbrlapi-dev libbluetooth-dev libatspi2.0-dev libatspi2.0-0 libatk1.0-0 libasound2-dev libasound2 libappindicator3-dev libappindicator3-1 gperf flex fakeroot elfutils devscripts dbus-x11 cdbs bison binutils-arm-linux-gnueabihf binutils-aarch64-linux-gnu apache2-bin && \
    rm -rf /var/lib/apt/lists/*

RUN git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git && cd depot_tools && git checkout 8dd74d4f85a739ff883831960c665b0a3a24ec36

ENV PATH="/depot_tools:${PATH}"

RUN mkdir /chromium

WORKDIR /chromium

RUN wget https://commondatastorage.googleapis.com/chromium-browser-official/chromium-96.0.4664.110.tar.xz 

RUN tar xfv chromium-96.0.4664.110.tar.xz

RUN apt-get update && \
    apt-get install -y libflac-dev flac lsb-release wget software-properties-common && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get --purge remove -y gcc g++ cpp

RUN add-apt-repository -y ppa:ubuntu-toolchain-r/test

RUN apt-get update && \
    apt-get install -y gcc-10 g++-10 && \
    rm -rf /var/lib/apt/lists/*


COPY llvm.sh /
RUN bash /llvm.sh

RUN ln -s /usr/bin/llvm-PerfectShuffle-13 /usr/bin/llvm-PerfectShuffle   && \
ln -s /usr/bin/llvm-addr2line-13 /usr/bin/llvm-addr2line   && \
ln -s /usr/bin/llvm-ar-13 /usr/bin/llvm-ar   && \
ln -s /usr/bin/llvm-as-13 /usr/bin/llvm-as   && \
ln -s /usr/bin/llvm-bcanalyzer-13 /usr/bin/llvm-bcanalyzer   && \
ln -s /usr/bin/llvm-bitcode-strip-13 /usr/bin/llvm-bitcode-strip   && \
ln -s /usr/bin/llvm-c-test-13 /usr/bin/llvm-c-test   && \
ln -s /usr/bin/llvm-cat-13 /usr/bin/llvm-cat   && \
ln -s /usr/bin/llvm-cfi-verify-13 /usr/bin/llvm-cfi-verify   && \
ln -s /usr/bin/llvm-config-13 /usr/bin/llvm-config   && \
ln -s /usr/bin/llvm-cov-13 /usr/bin/llvm-cov   && \
ln -s /usr/bin/llvm-cvtres-13 /usr/bin/llvm-cvtres   && \
ln -s /usr/bin/llvm-cxxdump-13 /usr/bin/llvm-cxxdump   && \
ln -s /usr/bin/llvm-cxxfilt-13 /usr/bin/llvm-cxxfilt   && \
ln -s /usr/bin/llvm-cxxmap-13 /usr/bin/llvm-cxxmap   && \
ln -s /usr/bin/llvm-diff-13 /usr/bin/llvm-diff   && \
ln -s /usr/bin/llvm-dis-13 /usr/bin/llvm-dis   && \
ln -s /usr/bin/llvm-dlltool-13 /usr/bin/llvm-dlltool   && \
ln -s /usr/bin/llvm-dwarfdump-13 /usr/bin/llvm-dwarfdump   && \
ln -s /usr/bin/llvm-dwp-13 /usr/bin/llvm-dwp   && \
ln -s /usr/bin/llvm-exegesis-13 /usr/bin/llvm-exegesis   && \
ln -s /usr/bin/llvm-extract-13 /usr/bin/llvm-extract   && \
ln -s /usr/bin/llvm-gsymutil-13 /usr/bin/llvm-gsymutil   && \
ln -s /usr/bin/llvm-ifs-13 /usr/bin/llvm-ifs   && \
ln -s /usr/bin/llvm-install-name-tool-13 /usr/bin/llvm-install-name-tool   && \
ln -s /usr/bin/llvm-jitlink-13 /usr/bin/llvm-jitlink   && \
ln -s /usr/bin/llvm-jitlink-executor-13 /usr/bin/llvm-jitlink-executor   && \
ln -s /usr/bin/llvm-lib-13 /usr/bin/llvm-lib   && \
ln -s /usr/bin/llvm-libtool-darwin-13 /usr/bin/llvm-libtool-darwin   && \
ln -s /usr/bin/llvm-link-13 /usr/bin/llvm-link   && \
ln -s /usr/bin/llvm-lipo-13 /usr/bin/llvm-lipo   && \
ln -s /usr/bin/llvm-lto-13 /usr/bin/llvm-lto   && \
ln -s /usr/bin/llvm-lto2-13 /usr/bin/llvm-lto2   && \
ln -s /usr/bin/llvm-mc-13 /usr/bin/llvm-mc   && \
ln -s /usr/bin/llvm-mca-13 /usr/bin/llvm-mca   && \
ln -s /usr/bin/llvm-ml-13 /usr/bin/llvm-ml   && \
ln -s /usr/bin/llvm-modextract-13 /usr/bin/llvm-modextract   && \
ln -s /usr/bin/llvm-mt-13 /usr/bin/llvm-mt   && \
ln -s /usr/bin/llvm-nm-13 /usr/bin/llvm-nm   && \
ln -s /usr/bin/llvm-objcopy-13 /usr/bin/llvm-objcopy   && \
ln -s /usr/bin/llvm-objdump-13 /usr/bin/llvm-objdump   && \
ln -s /usr/bin/llvm-opt-report-13 /usr/bin/llvm-opt-report   && \
ln -s /usr/bin/llvm-otool-13 /usr/bin/llvm-otool   && \
ln -s /usr/bin/llvm-pdbutil-13 /usr/bin/llvm-pdbutil   && \
ln -s /usr/bin/llvm-profdata-13 /usr/bin/llvm-profdata   && \
ln -s /usr/bin/llvm-profgen-13 /usr/bin/llvm-profgen   && \
ln -s /usr/bin/llvm-ranlib-13 /usr/bin/llvm-ranlib   && \
ln -s /usr/bin/llvm-rc-13 /usr/bin/llvm-rc   && \
ln -s /usr/bin/llvm-readelf-13 /usr/bin/llvm-readelf   && \
ln -s /usr/bin/llvm-readobj-13 /usr/bin/llvm-readobj   && \
ln -s /usr/bin/llvm-reduce-13 /usr/bin/llvm-reduce   && \
ln -s /usr/bin/llvm-rtdyld-13 /usr/bin/llvm-rtdyld   && \
ln -s /usr/bin/llvm-sim-13 /usr/bin/llvm-sim   && \
ln -s /usr/bin/llvm-size-13 /usr/bin/llvm-size   && \
ln -s /usr/bin/llvm-split-13 /usr/bin/llvm-split   && \
ln -s /usr/bin/llvm-stress-13 /usr/bin/llvm-stress   && \
ln -s /usr/bin/llvm-strings-13 /usr/bin/llvm-strings   && \
ln -s /usr/bin/llvm-strip-13 /usr/bin/llvm-strip   && \
ln -s /usr/bin/llvm-symbolizer-13 /usr/bin/llvm-symbolizer   && \
ln -s /usr/bin/llvm-tapi-diff-13 /usr/bin/llvm-tapi-diff   && \
ln -s /usr/bin/llvm-tblgen-13 /usr/bin/llvm-tblgen   && \
ln -s /usr/bin/llvm-undname-13 /usr/bin/llvm-undname   && \
ln -s /usr/bin/llvm-windres-13 /usr/bin/llvm-windres   && \
ln -s /usr/bin/llvm-xray-13 /usr/bin/llvm-xray && \
ln -s /usr/bin/clangd-13 /usr/bin/clangd && \
ln -s /usr/bin/clang-cpp-13 /usr/bin/clang-cpp && \
ln -s /usr/bin/clang-13 /usr/bin/clang && \
ln -s /usr/bin/clang++-13 /usr/bin/clang++ && \
ln -s /usr/bin/lld-13 /usr/bin/lld && \
ln -s /usr/bin/lld-link-13 /usr/bin/lld-link && \
ln -s /usr/bin/lldb-13 /usr/bin/lldb && \
ln -s /usr/bin/lldb-argdumper-13 /usr/bin/lldb-argdumper && \
ln -s /usr/bin/lldb-instr-13 /usr/bin/lldb-instr && \
ln -s /usr/bin/lldb-server-13 /usr/bin/lldb-server && \
ln -s /usr/bin/lldb-vscode-13 /usr/bin/lldb-vscode && \
ln -s /usr/bin/ld.lld-13 /usr/bin/ld.lld

RUN ln -s /usr/bin/aarch64-linux-gnu-cpp-10 /usr/bin/aarch64-linux-gnu-cpp && \
ln -s /usr/bin/aarch64-linux-gnu-g++-10 /usr/bin/aarch64-linux-gnu-g++ && \
ln -s /usr/bin/aarch64-linux-gnu-gcc-10 /usr/bin/aarch64-linux-gnu-gcc && \
ln -s /usr/bin/aarch64-linux-gnu-gcc-ar-10 /usr/bin/aarch64-linux-gnu-gcc-ar && \
ln -s /usr/bin/aarch64-linux-gnu-gcc-nm-10 /usr/bin/aarch64-linux-gnu-gcc-nm && \
ln -s /usr/bin/aarch64-linux-gnu-gcc-ranlib-10 /usr/bin/aarch64-linux-gnu-gcc-ranlib && \
ln -s /usr/bin/aarch64-linux-gnu-gcov-10 /usr/bin/aarch64-linux-gnu-gcov && \
ln -s /usr/bin/aarch64-linux-gnu-gcov-dump-10 /usr/bin/aarch64-linux-gnu-gcov-dump && \
ln -s /usr/bin/aarch64-linux-gnu-gcov-tool-10 /usr/bin/aarch64-linux-gnu-gcov-tool && \
ln -s /usr/bin/cpp-10 /usr/bin/cpp && \
ln -s /usr/bin/g++-10 /usr/bin/g++ && \
ln -s /usr/bin/gcc-10 /usr/bin/gcc && \
ln -s /usr/bin/gcc-ar-10 /usr/bin/gcc-ar && \
ln -s /usr/bin/gcc-nm-10 /usr/bin/gcc-nm && \
ln -s /usr/bin/gcc-ranlib-10 /usr/bin/gcc-ranlib && \
ln -s /usr/bin/gcov-10 /usr/bin/gcov && \
ln -s /usr/bin/gcov-dump-10 /usr/bin/gcov-dump && \
ln -s /usr/bin/gcov-tool-10 /usr/bin/gcov-tool

RUN apt-get update
RUN apt-get install -y curl dirmngr apt-transport-https lsb-release ca-certificates
COPY setup_12.x /
RUN bash /setup_12.x

RUN apt-get install -y nodejs

WORKDIR /root

ENV CXX=g++
RUN git clone https://github.com/ninja-build/ninja.git -b v1.8.2 && cd ninja && git checkout 41156cd9c97a4e49473c473b7952f8cb7c43c56c
RUN cd ninja && ./configure.py --bootstrap

ENV PATH="/root/ninja:${PATH}"

RUN rm /chromium/chromium-96.0.4664.110/third_party/depot_tools/ninja
RUN rm /chromium/chromium-96.0.4664.110/third_party/depot_tools/ninja-linux64
RUN ln -s /root/ninja/ninja /chromium/chromium-96.0.4664.110/third_party/depot_tools/ninja
RUN ln -s /root/ninja/ninja-linux64 /chromium/chromium-96.0.4664.110/third_party/depot_tools/ninja-linux64

RUN rm /depot_tools/ninja
RUN rm /depot_tools/ninja-linux64
RUN ln -s /root/ninja/ninja /depot_tools/ninja
RUN ln -s /root/ninja/ninja-linux64 /depot_tools/ninja-linux64

WORKDIR /chromium/chromium-96.0.4664.110/

RUN python3 build/linux/unbundle/replace_gn_files.py --system-libraries flac libjpeg libxslt

RUN python3 tools/gn/bootstrap/bootstrap.py --skip-generate-buildfiles

RUN cp out/Release/gn /chromium/chromium-96.0.4664.110/buildtools/linux64/gn

RUN build/linux/sysroot_scripts/install-sysroot.py --arch=arm64

RUN mkdir -p third_party/node/linux/node-linux-x64/bin/

RUN ln -s /usr/bin/node third_party/node/linux/node-linux-x64/bin/node

RUN git init

RUN gn gen --args='use_cups=false ffmpeg_branding="Chrome" proprietary_codecs=true use_vaapi=false use_gnome_keyring=false use_kerberos=false use_pulseaudio=false use_system_libjpeg=true use_system_freetype=false enable_js_type_check=false is_debug=false is_official_build=true use_lld=true use_gold=false symbol_level=0 enable_remoting=false enable_nacl=false use_sysroot=false treat_warnings_as_errors=false is_cfi=false disable_fieldtrial_testing_config=true chrome_pgo_phase=0 google_api_key="invalid-api-key" google_default_client_id="invalid-client-id" google_default_client_secret="invalid-client-secret" gold_path="" is_clang=true clang_base_path="/usr" clang_use_chrome_plugins=false target_cpu="arm64" max_jobs_per_link="16" use_cups=false ffmpeg_branding="Chrome" proprietary_codecs=true use_vaapi=false use_ozone=true ozone_auto_platforms=false ozone_platform_headless=true ozone_platform_wayland=true ozone_platform_x11=false use_system_wayland_scanner=true use_xkbcommon=true use_system_libwayland=true use_system_minigbm=true use_system_libdrm=true use_gtk=false use_wayland_gbm=false' out/Default/

RUN wget https://github.com/chromium/chromium/commit/6e12c13c0165c94615928ca3d9692e91cf0619c4.patch
RUN patch -p1 < 6e12c13c0165c94615928ca3d9692e91cf0619c4.patch 

# chromium-wayland: https://github.com/OSSystems/meta-browser/tree/master/meta-chromium/recipes-browser/chromium/files/chromium-wayland
RUN wget https://raw.githubusercontent.com/OSSystems/meta-browser/master/meta-chromium/recipes-browser/chromium/files/chromium-wayland/0001-ozone-add-va-api-support-to-wayland.patch
RUN patch -p1 < 0001-ozone-add-va-api-support-to-wayland.patch

RUN wget https://raw.githubusercontent.com/OSSystems/meta-browser/master/meta-chromium/recipes-browser/chromium/files/chromium-wayland/0001-ozone-wayland-fix-re-initialization-of-WBMG.patch
RUN patch -p1 < 0001-ozone-wayland-fix-re-initialization-of-WBMG.patch

RUN wget https://raw.githubusercontent.com/OSSystems/meta-browser/master/meta-chromium/recipes-browser/chromium/files/chromium-wayland/0001-ozone-wayland-fixed-terminate-caused-by-binding-to-wrong-version.patch
RUN patch -p1 < 0001-ozone-wayland-fixed-terminate-caused-by-binding-to-wrong-version.patch

#https://github.com/OSSystems/meta-browser/tree/master/meta-chromium/recipes-browser/chromium/files
RUN wget https://raw.githubusercontent.com/OSSystems/meta-browser/master/meta-chromium/recipes-browser/chromium/files/0007-Delete-compiler-options-not-available-in-release-ver.patch
RUN patch -p1 < 0007-Delete-compiler-options-not-available-in-release-ver.patch

RUN wget https://raw.githubusercontent.com/OSSystems/meta-browser/master/meta-chromium/recipes-browser/chromium/files/0014-ozone-wayland-don-t-build-xcb-for-pure-wayland-build.patch
RUN patch -p1 < 0014-ozone-wayland-don-t-build-xcb-for-pure-wayland-build.patch

RUN wget https://raw.githubusercontent.com/OSSystems/meta-browser/master/meta-chromium/recipes-browser/chromium/files/0015-IWYU-add-memory-for-std-unique_ptr-in-base-CommandLi.patch
RUN patch -p1 < 0015-IWYU-add-memory-for-std-unique_ptr-in-base-CommandLi.patch

RUN autoninja -C out/Default/ chrome

FROM ubuntu:20.04 

LABEL maintainer="Raul Munoz <raul@foundries.io>"

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

RUN apt-get update && \
    apt-get install -y libglib2.0-dev libnss3 libatk1.0-dev libatk-bridge2.0-0 libjpeg-turbo8 libdrm-dev \
                       libxkbcommon0 libasound2 libflac8 libxslt1.1 fontconfig-config libwayland-cursor0 libwayland-client0 libwayland-egl1 libxdamage1 libxfixes3 \
                       strace && \
    rm -rf /var/lib/apt/lists/*

RUN dpkg -i imx-gpu-viv_6.4.3.p1.4-aarch64-r0_arm64.deb

RUN mkdir -p /usr/lib/chromium/

COPY --from=build /chromium/chromium-96.0.4664.110/out/Default/chrome /usr/lib/chromium/
COPY --from=build /chromium/chromium-96.0.4664.110/out/Default/*.bin /usr/lib/chromium/
COPY --from=build /chromium/chromium-96.0.4664.110/out/Default/icudtl.dat /usr/lib/chromium/
COPY --from=build /chromium/chromium-96.0.4664.110/out/Default/chrome-wrapper /usr/lib/chromium/
RUN ln -s /usr/lib/chromium/chrome-wrapper /usr/bin/chrome

RUN mkdir -p /share/icons/hicolor/16x16/apps/
RUN mkdir -p /share/icons/hicolor/22x22/apps/
RUN mkdir -p /share/icons/hicolor/24x24/apps/
RUN mkdir -p /share/icons/hicolor/32x32/apps/
RUN mkdir -p /share/icons/hicolor/48x48/apps/
RUN mkdir -p /share/icons/hicolor/64x64/apps/
RUN mkdir -p /share/icons/hicolor/128x128/apps/
RUN mkdir -p /share/icons/hicolor/256x256/apps/

COPY --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/default_100_percent/chromium/product_logo_16.png /share/icons/hicolor/16x16/apps/chromium.png
COPY --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/default_100_percent/chromium/product_logo_name_22.png /share/icons/hicolor/22x22/apps/chromium.png
COPY --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/chromium/product_logo_24.png /share/icons/hicolor/24x24/apps/chromium.png
COPY --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/default_100_percent/chromium/product_logo_32.png /share/icons/hicolor/32x32/apps/chromium.png
COPY --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/chromium/product_logo_48.png /share/icons/hicolor/48x48/apps/chromium.png
COPY --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/chromium/product_logo_64.png /share/icons/hicolor/64x64/apps/chromium.png
COPY --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/chromium/product_logo_128.png /share/icons/hicolor/128x128/apps/chromium.png
COPY --from=build /chromium/chromium-96.0.4664.110/chrome/app/theme/chromium/product_logo_256.png /share/icons/hicolor/256x256/apps/chromium.png

COPY --from=build /chromium/chromium-96.0.4664.110/out/Default/*.pak /usr/lib/chromium/
COPY --from=build /chromium/chromium-96.0.4664.110/out/Default/resources.pak  /usr/lib/chromium/resources.pak 

RUN mkdir -p /usr/lib/chromium/locales/
COPY --from=build /chromium/chromium-96.0.4664.110/out/Default/locales/*.pak  /usr/lib/chromium/locales/

COPY --from=build /chromium/chromium-96.0.4664.110/out/Default/chrome_crashpad_handler  /usr/lib/chromium/

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

ENTRYPOINT ["/start.sh"]
