#!/bin/bash
# Build Flutter
set -ex

cd /root/
wget https://github.com/Kitware/CMake/releases/download/v3.21.3/cmake-3.21.3-linux-aarch64.sh
mv /root/cmake-3.21.3-linux-aarch64.sh /opt
cd /opt
chmod +x cmake-3.21.3-linux-aarch64.sh
mkdir -p /opt/cmake
bash /opt/cmake-3.21.3-linux-aarch64.sh --skip-license --prefix=/opt/cmake
ln -sf /opt/cmake/bin/cmake /usr/local/bin/cmake

cd /root
git clone https://github.com/sony/flutter-elinux
cd flutter-elinux
git checkout 87bfe8229849f81ff8fd4cb6e7fb6c63903fd56f
mv /root/flutter-elinux /opt/
export PATH=/opt/flutter-elinux/bin:$PATH
echo "export PATH=$PATH" > /etc/environment
export LD_LIBRARY_PATH=/opt/flutter-elinux/flutter/bin/cache/artifacts/engine/elinux-arm64-debug/
cd /root/
flutter-elinux devices
flutter-elinux create sample
cd /root/sample
flutter-elinux build elinux --debug

cd /root

git clone https://github.com/sony/flutter-embedded-linux
cd flutter-embedded-linux
git checkout 047c0d1133c64f34076f5bc6f62a9919d53add61
mkdir /root/flutter-embedded-linux/build
cd /root/flutter-embedded-linux/build

cp /opt/flutter-elinux/flutter/bin/cache/artifacts/engine/elinux-arm64-debug/libflutter_engine.so /root/flutter-embedded-linux/build/
cmake -DUSER_PROJECT_PATH=examples/flutter-wayland-client -DCMAKE_BUILD_TYPE=Debug ..
cmake --build .

cd /root
git clone https://github.com/flutter/gallery 
cd /root/gallery
git checkout 312e0cbd271c5da57256f874ae45f87d15103890
flutter-elinux config --enable-linux-desktop
flutter-elinux build linux --debug
