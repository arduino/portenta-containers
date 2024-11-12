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

# Example:
# docker run -it --rm --user "63" -v /tmp/.X11-unix:/tmp/.X11-unix x-kiosk www.arduino.cc

FROM debian:buster-20211011-slim

LABEL maintainer="Michael Scott <mike@foundries.io>"

ENV DEBIAN_FRONTEND noninteractive
ENV DISPLAY :0
ENV XDG_CACHE_HOME /tmp/.cache
ENV XDG_CONFIG_HOME /tmp/.config

# Install Chromium
RUN apt-get update \
  && apt-get install -y --no-install-recommends chromium \
  && rm -rf /var/lib/apt/lists/*

COPY start.sh /

ENTRYPOINT ["/start.sh"]
