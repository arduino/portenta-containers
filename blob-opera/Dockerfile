# Copyright (c) 2022 Arduino.cc
#

# Example:
# docker build --tag "blob-opera:latest" .
# docker run -it --rm --user "63" -v /tmp/.X11-unix:/tmp/.X11-unix blob-opera https://g.co/arts/9vQnmMqJvDx3LyAj6

FROM debian:bullseye-20211011-slim

LABEL maintainer="Massimo Pennazio <maxipenna@libero.it>"

ENV DEBIAN_FRONTEND noninteractive
ENV DISPLAY :0
ENV XDG_CACHE_HOME /tmp/.cache
ENV XDG_CONFIG_HOME /tmp/.config

# Install Chromium
RUN apt-get update && \
    apt-get install -y --no-install-recommends chromium && \
    rm -rf /var/lib/apt/lists/*

COPY start.sh /

ENTRYPOINT ["/start.sh"]
