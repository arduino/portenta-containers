# For local x86_64 testing
# docker run -it --rm --user=fio -v /tmp/.X11-unix:/tmp/.X11-unix -v /var/run/dbus:/var/dbus xkiosk www.FIO.cc

FROM debian:sid

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
    apt-get clean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* 

RUN apt-get update && \
    apt-get install -y --no-install-recommends firefox && \
    rm -rf /var/lib/apt/lists/*

COPY --chown=${FIO_USERNAME} start.sh /

USER ${FIO_USERNAME}
WORKDIR ${FIO_HOME}

ENTRYPOINT ["/start.sh"]
