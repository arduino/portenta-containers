FROM debian:stable-slim as DemoBuilder

RUN set -ef \
    && apt update \
    && apt install -y --no-install-recommends build-essential libasound2 \
    && cd /usr/lib \
    && ln -s /usr/lib/aarch64-linux-gnu/libasound.so.2 \
    && ln -s /usr/lib/aarch64-linux-gnu/libasound.so.2.0.0

WORKDIR /Build

COPY Cyberon_RecipeRecognition/SampleCode .

RUN set -ef \
    && make


FROM debian:stable-slim

RUN set -ef \
    && apt update \
    && apt install -y --no-install-recommends libasound2 alsa-utils \
    && cd /usr/lib \
    && ln -s /usr/lib/aarch64-linux-gnu/libasound.so.2 \
    && ln -s /usr/lib/aarch64-linux-gnu/libasound.so.2.0.0 \
    && ldconfig

WORKDIR /RecipeRecognition

COPY Cyberon_RecipeRecognition/DemoProgram .
COPY --from=DemoBuilder /Build/RecipeRecognizerDemo .

RUN set -ef \
    && chmod +x docker-entrypoint.sh \
    && chmod +x RecipeRecognizerDemo

ENTRYPOINT [ "./docker-entrypoint.sh" ]
