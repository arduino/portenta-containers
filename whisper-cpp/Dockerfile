# Copyright (c) 2023 Arduino.cc
#

# Example:
# docker build --tag "whisper-cpp:latest" .
# docker run -it --device '/dev/snd:/dev/snd' -v '/run/arduino_hw_info.env:/run/arduino_hw_info.env:ro' whisper-cpp:latest

FROM python:3.10.11-slim

LABEL maintainer="Martino Facchin <m.facchin@arduino.cc>"

RUN apt-get update && apt-get install build-essential git cmake libsdl2-dev -y

RUN git clone https://github.com/ggerganov/whisper.cpp.git

WORKDIR whisper.cpp
RUN make -j stream

RUN apt-get install -y wget

RUN ./models/download-ggml-model.sh tiny.en

RUN apt-get install -y alsa-tools alsa-utils

COPY entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]
