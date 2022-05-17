# --- Note on PulseAudio version ---
# Alpine 3.15 pins PulseAudio version to 15.x.x
# See https://pkgs.alpinelinux.org/packages?name=pulseaudio&branch=v3.15

FROM balenalib/aarch64-alpine:3.15-run
WORKDIR /usr/src

# UDev is required to autodetect ALSA devices
# DBus is required for module-bluetooth-discover
ENV UDEV=on
#ENV DBUS_SYSTEM_BUS_ADDRESS=unix:path=/run/dbus/system_bus_socket
#ENV DISPLAY=:0

# Install PulseAudio and dependencies
RUN install_packages \
  dbus-x11 \
  alsa-utils \
  mawk \
  pulseaudio~=15 \
  pulseaudio-alsa \
  pulseaudio-bluez \
  pulseaudio-utils \
  xxd

# For local development
#dev-cmd-live=pulseaudio || balena-idle

# PulseAudio configuration
COPY pulseaudio/block.pa /etc/pulse/default.pa.d/00-audioblock.pa
COPY pulseaudio/client.conf /etc/pulse/client.conf
COPY pulseaudio/daemon.conf /etc/pulse/daemon.conf

# UDev configuration
COPY udev/95-balena-audio.rules /etc/udev/rules.d/95-balena-audio.rules

# Add root user to group for pulseaudio access
RUN adduser root pulse-access

# Entrypoint
COPY entry.sh .
ENTRYPOINT [ "/bin/bash", "/usr/src/entry.sh" ]

# Start script
COPY ./start.sh .
COPY ./balena-sound.pa .
CMD [ "/bin/bash", "/usr/src/start.sh" ]

# NOTE: will be executed in this order /bin/bash /usr/src/entry.sh /bin/bash /usr/src/start.sh
