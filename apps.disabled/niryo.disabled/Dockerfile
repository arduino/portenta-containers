FROM ros:kinetic

RUN apt-get update

RUN apt-get install -y \
	python-pip \
	python-rosinstall-generator \
	python-wstool

# install ros package Niryo
RUN apt-get install -y \
	ros-kinetic-robot-state-publisher \
	ros-kinetic-moveit \
	ros-kinetic-rosbridge-suite \
	ros-kinetic-joy \
	ros-kinetic-ros-control \
	ros-kinetic-ros-controllers \
	ros-kinetic-tf2-web-republisher \
	ros-kinetic-catkin 

RUN apt-get install -y \
	git \
	vim

RUN rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip
RUN pip install wheel
RUN pip install zipp
RUN pip install jsonpickle

USER root
SHELL ["/bin/bash", "-c"]

RUN mkdir -p /root/catkin_ws/src; 
RUN git clone https://github.com/NiryoRobotics/niryo_one_ros.git /root/catkin_ws/src

RUN sed -i 's/__arm__/__hardware__/g' /root/catkin_ws/src/dynamixel_sdk/src/port_handler_linux.cpp
RUN sed -i 's/__arm__/__hardware__/g' /root/catkin_ws/src/mcp_can_rpi/src/mcp_can_rpi.cpp
RUN sed -i 's/__arm__/__hardware__/g' /root/catkin_ws/src/mcp_can_rpi/include/mcp_can_rpi/mcp_can_rpi.h
RUN sed -i 's/__arm__/__hardware__/g' /root/catkin_ws/src/niryo_one_driver/src/utils/change_hardware_version.cpp
RUN sed -i 's/__arm__/__hardware__/g' /root/catkin_ws/src/niryo_one_driver/src/rpi_diagnostics.cpp
RUN sed -i 's/__arm__/__hardware__/g' /root/catkin_ws/src/niryo_one_driver/include/niryo_one_driver/rpi_diagnostics.h

RUN sed -i 's/arm/hardware/g' /root/catkin_ws/src/dynamixel_sdk/CMakeLists.txt
RUN sed -i 's/arm/hardware/g' /root/catkin_ws/src/mcp_can_rpi/CMakeLists.txt
RUN sed -i 's/arm/hardware/g' /root/catkin_ws/src/niryo_one_driver/CMakeLists.txt
RUN sed -i 's/arm/hardware/g' /root/catkin_ws/src/niryo_one_debug/CMakeLists.txt

RUN /bin/bash -c "source /opt/ros/kinetic/setup.bash; cd ~/catkin_ws; catkin_make"

COPY start.sh /
ENTRYPOINT ["/bin/bash", "/start.sh"]
