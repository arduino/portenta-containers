# hadolint ignore=DL3006
FROM balenablocks/multiroom
WORKDIR /usr/src

ENV PULSE_SERVER=tcp:audio:4317
ENV PULSE_SINK=balena-sound.output

COPY start.sh .

CMD [ "/bin/bash", "/usr/src/start.sh" ]
