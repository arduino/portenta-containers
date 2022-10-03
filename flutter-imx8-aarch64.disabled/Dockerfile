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
# docker build --tag hub.foundries.io/lmp/0flutter-imx8-aarch64:latest .
FROM debian:bullseye-20220316-slim AS build

LABEL maintainer="Raul Munoz <raul@foundries.io>"

ENV DEBIAN_FRONTEND noninteractive

COPY [ \
      "build-flutter.sh", \
      "/root/"]

RUN apt-get update -y && \
    apt-get install -y libwayland-client0 \
                       libwayland-server0 \
                       libwayland-cursor0 \
                       libwayland-egl1 \
                       libwayland-dev \
                       git \
                       wget \
                       clang \
                       build-essential \
                       libxkbcommon-dev \
                       wayland-protocols \
                       unzip \
                       pkg-config \
                       ninja-build \
                       libegl1-mesa-dev \
                       ca-certificates \
                       curl \
                       libgtk-3-dev && \
    apt-get clean && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* && \
    bash /root/build-flutter.sh

CMD ["/bin/bash"]
