# Arduino ide 2 build image
FROM debian:bookworm AS build-stage

LABEL maintainer="Mattia Scattolin <m.scattolin@arduino.cc>"

# Arduino ide branch to use
ARG ARDUINO_IDE_BRANCH=light-version-poc

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
  && apt-get upgrade -y \
  && apt-get install -y \
    build-essential \
    chromium \
    curl \
    git \
    gnupg2 \
    libsecret-1-dev \
    libx11-dev \
    libxkbfile-dev \
    lsb-release \
    unzip \
    vim \
    wget

# Install node 20.x and yarn
RUN curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh \
  && bash nodesource_setup.sh \
  && bash -c "curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor -o /usr/share/keyrings/yarn-archive-keyring.gpg" \
  && bash -c 'echo "deb [signed-by=/usr/share/keyrings/yarn-archive-keyring.gpg] https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list' \
  && apt update && apt install -y yarn nodejs

# Go
RUN wget https://golang.org/dl/go1.21.5.linux-arm64.tar.gz \
  && tar -C /usr/local -xzf go1.21.5.linux-arm64.tar.gz
ENV PATH="/usr/local/go/bin:$PATH"

RUN git clone --depth 1 -b $ARDUINO_IDE_BRANCH https://github.com/arduino/arduino-ide

WORKDIR /arduino-ide/

# Build Application
RUN ./scripts/package.sh

# Arduino ide 2 application image
FROM debian:bookworm

LABEL maintainer="Mattia Scattolin <m.scattolin@arduino.cc>"

ARG USER_ID=1000
ARG GROUP_ID=1000

ENV DEBIAN_FRONTEND=noninteractive
ENV USER_HOME=/home/arduino
ENV uid=${USER_ID}
ENV gid=${GROUP_ID}
ENV USER_NAME=arduino

RUN apt-get update \
  && apt-get upgrade -y \
  && apt-get install -y \
    curl \
    chromium \
    git \
    gnupg2 \
    libsecret-1-dev \
    libx11-dev \
    libxkbfile-dev \
    lsb-release \
    unzip \
    vim \
    wget

RUN \
    if [ ! "${uid}" = "0" ]; then \
      groupadd -g ${gid} ${USER_NAME}; \
      useradd -d ${USER_HOME} -s /bin/bash -m ${USER_NAME} -u ${uid} -g ${gid}; \
    fi
 
WORKDIR /arduino-ide-2/

COPY --from=build-stage /arduino-ide/electron-app/dist/arduino-ide*.zip .
RUN unzip *.zip \
  && rm *.zip \
  && chmod 4755 chrome-sandbox

COPY start.sh /

RUN usermod -aG dialout arduino
USER ${USER_NAME}

ENTRYPOINT ["/start.sh"]
