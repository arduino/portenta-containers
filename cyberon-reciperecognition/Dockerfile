FROM debian:bookworm-slim as DemoBuilder

RUN apt update \
  && apt install -y --no-install-recommends build-essential libasound2 \
  && cd /usr/lib \
  && ln -s /usr/lib/aarch64-linux-gnu/libasound.so.2 \
  && ln -s /usr/lib/aarch64-linux-gnu/libasound.so.2.0.0

WORKDIR /Build

COPY Cyberon_RecipeRecognition/SampleCode .

RUN make

FROM debian:bookworm-slim

RUN apt update \
  && apt install -y --no-install-recommends alsa-utils libasound2 \
  && cd /usr/lib \
  && ln -s /usr/lib/aarch64-linux-gnu/libasound.so.2 \
  && ln -s /usr/lib/aarch64-linux-gnu/libasound.so.2.0.0 \
  && ldconfig

WORKDIR /RecipeRecognition

COPY Cyberon_RecipeRecognition/DemoProgram .
COPY --from=DemoBuilder /Build/RecipeRecognizerDemo .

RUN chmod +x RecipeRecognizerDemo

ENTRYPOINT [ "./docker-entrypoint.sh" ]
