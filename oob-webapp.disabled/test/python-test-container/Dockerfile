
FROM sickp/alpine-sshd:7.9
RUN apk add --no-cache \
  python3 \
  htop

RUN \
  adduser -D -s /bin/ash pytest && \
  passwd -u pytest && \
  chown -R pytest:pytest /home/pytest

COPY --chown=pytest:pytest keys/authorized_keys /home/pytest/.ssh/authorized_keys