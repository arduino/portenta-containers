#!/bin/bash
# Build Chromium

set -ex

export CXX=g++
export PATH=/depot_tools:/root/ninja:$PATH

git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
cd depot_tools
git checkout 8dd74d4f85a739ff883831960c665b0a3a24ec36

mkdir /chromium
cd /chromium
wget -q https://commondatastorage.googleapis.com/chromium-browser-official/chromium-96.0.4664.110.tar.xz
tar xf chromium-96.0.4664.110.tar.xz

cd /root/
git clone https://github.com/ninja-build/ninja.git -b v1.8.2

cd /root/ninja
git checkout 41156cd9c97a4e49473c473b7952f8cb7c43c56c
./configure.py --bootstrap
rm -rf /chromium/chromium-96.0.4664.110/third_party/depot_tools/ninja \
       /chromium/chromium-96.0.4664.110/third_party/depot_tools/ninja-linux64 \
       /depot_tools/ninja \
       /depot_tools/ninja-linux64
ln -s /root/ninja/ninja /chromium/chromium-96.0.4664.110/third_party/depot_tools/ninja
ln -s /root/ninja/ninja-linux64 /chromium/chromium-96.0.4664.110/third_party/depot_tools/ninja-linux64 && \
ln -s /root/ninja/ninja /depot_tools/ninja && \
ln -s /root/ninja/ninja-linux64 /depot_tools/ninja-linux64

cd /chromium/chromium-96.0.4664.110/

python3 build/linux/unbundle/replace_gn_files.py --system-libraries flac libjpeg libxslt
python3 tools/gn/bootstrap/bootstrap.py --skip-generate-buildfiles | grep 194

cp out/Release/gn /chromium/chromium-96.0.4664.110/buildtools/linux64/gn
build/linux/sysroot_scripts/install-sysroot.py --arch=arm64
mkdir -p third_party/node/linux/node-linux-x64/bin/
ln -s /usr/bin/node third_party/node/linux/node-linux-x64/bin/node
git init
gn gen --args='use_cups=false ffmpeg_branding="Chrome" proprietary_codecs=true use_vaapi=false use_gnome_keyring=false use_kerberos=false use_pulseaudio=false use_system_libjpeg=true use_system_freetype=false enable_js_type_check=false is_debug=false is_official_build=true use_lld=true use_gold=false symbol_level=0 enable_remoting=false enable_nacl=false use_sysroot=false treat_warnings_as_errors=false is_cfi=false disable_fieldtrial_testing_config=true chrome_pgo_phase=0 google_api_key="invalid-api-key" google_default_client_id="invalid-client-id" google_default_client_secret="invalid-client-secret" gold_path="" is_clang=true clang_base_path="/usr" clang_use_chrome_plugins=false target_cpu="arm64" max_jobs_per_link="16" use_cups=false ffmpeg_branding="Chrome" proprietary_codecs=true use_vaapi=false use_ozone=true ozone_auto_platforms=false ozone_platform_headless=true ozone_platform_wayland=true ozone_platform_x11=false use_system_wayland_scanner=true use_xkbcommon=true use_system_libwayland=true use_system_minigbm=true use_system_libdrm=true use_gtk=false use_wayland_gbm=false' out/Default/

patch -f -p1 < /root/6e12c13c0165c94615928ca3d9692e91cf0619c4.patch && \
patch -f -p1 < /root/0001-ozone-add-va-api-support-to-wayland.patch && \
patch -f -p1 < /root/0001-ozone-wayland-fix-re-initialization-of-WBMG.patch && \
patch -f -p1 < /root/0001-ozone-wayland-fixed-terminate-caused-by-binding-to-wrong-version.patch && \
patch -f -p1 < /root/0007-Delete-compiler-options-not-available-in-release-ver.patch && \
patch -f -p1 < /root/0014-ozone-wayland-don-t-build-xcb-for-pure-wayland-build.patch && \
patch -f -p1 < /root/0015-IWYU-add-memory-for-std-unique_ptr-in-base-CommandLi.patch && \

autoninja -C out/Default/ chrome