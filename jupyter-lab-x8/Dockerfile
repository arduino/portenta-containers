FROM jupyter/minimal-notebook:2022-06-06 as BUILD_STAGE

LABEL maintainer="Giampaolo Mancini <g.mancini@arduino.cc>"

USER root

RUN apt update \
  && apt install -y --no-install-recommends build-essential python-dev

RUN git clone https://github.com/xaedes/msgpack-rpc-python.git -b with_tornado_453 \
  && pushd msgpack-rpc-python \
  && pip wheel .

FROM jupyter/minimal-notebook:2022-06-06

COPY --from=BUILD_STAGE /home/jovyan/msgpack-rpc-python/msgpack_python-*.whl msgpack_python-0.5.6-cp310-none-any.whl
COPY --from=BUILD_STAGE /home/jovyan/msgpack-rpc-python/msgpack_rpc_python-*.whl msgpack_rpc_python-0.4-cp310-none-any.whl
COPY requirements.txt .

RUN pip install -r requirements.txt \
  && rm requirements.txt *.whl

