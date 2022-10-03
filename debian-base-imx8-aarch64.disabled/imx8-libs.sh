#!/bin/bash
set -ex

#Installing libdrm-imx
cd /root/
git clone -b libdrm-imx-2.4.102 http://source.codeaurora.org/external/imx/libdrm-imx.git
cd /root/libdrm-imx/
git checkout 40ea53973b99b7df07f472318918a8c2b310e4a7
patch -f -p1 < /root/0001-meson-add-libdrm-vivante-to-the-meson-meta-data.patch
meson --prefix /usr --buildtype plain -Damdgpu=true -Dcairo-tests=false -Detnaviv=true -Dexynos=false -Dfreedreno=true -Dfreedreno-kgsl=false -Dinstall-test-programs=true -Dintel=true -Dlibkms=true -Dman-pages=false -Dnouveau=true -Domap=true -Dradeon=true -Dtegra=false -Dudev=false -Dvalgrind=false -Dvc4=true -Dvivante=true -Dvmwgfx=true build/
ninja -C build/ install

#Installing imx-gpu-viv
cd /root/
wget https://www.nxp.com/lgfiles/NMG/MAD/YOCTO/imx-gpu-viv-6.4.3.p1.4-aarch64.bin
sh /root/imx-gpu-viv-6.4.3.p1.4-aarch64.bin --auto-accept --force
cp -ra /root/imx-gpu-viv-6.4.3.p1.4-aarch64/gpu-core/etc/* /etc/
cp -ra /root/imx-gpu-viv-6.4.3.p1.4-aarch64/gpu-core/usr/lib/*.so* /usr/lib/aarch64-linux-gnu/
cp -ra /root/imx-gpu-viv-6.4.3.p1.4-aarch64/gpu-core/usr/lib/wayland/* /usr/lib/aarch64-linux-gnu/
cp -ra /root/imx-gpu-viv-6.4.3.p1.4-aarch64/gpu-core/usr/include/* /usr/include/

#Installing imx-gpu-g2d
wget https://www.nxp.com/lgfiles/NMG/MAD/YOCTO/imx-gpu-g2d-6.4.3.p1.4-aarch64.bin
sh /root/imx-gpu-g2d-6.4.3.p1.4-aarch64.bin --auto-accept --force
cp -ra /root/imx-gpu-g2d-6.4.3.p1.4-aarch64/g2d/usr/include/* /usr/include/
cp -ra /root/imx-gpu-g2d-6.4.3.p1.4-aarch64/g2d/usr/lib/* /usr/lib/aarch64-linux-gnu/

#Removing files
rm -rf /root/libdrm-imx*
rm -rf /root/0001-meson-add-libdrm-vivante-to-the-meson-meta-data.patch
rm -rf /root/imx-gpu-g2d-6.4.3.p1.4-aarch64*
rm -rf /root/imx-gpu-viv-6.4.3.p1.4-aarch64*