import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import { useDeviceConnectionStatus } from "../../../hooks/useDeviceConnected";
import { useTouchSelectAll } from "../../../hooks/useTouchSelectAll";
import { RootState } from "../../../store";
import { closeEthernetInfo, openEthernetInfo } from "../../../uiSlice";
import { StatusKeyValue } from "../StatusKeyValue";

interface EthernetConnectionRowProps {
  hostname?: string;
}

function EthernetConnectionRowComponent(props: EthernetConnectionRowProps) {
  const { hostname } = props;

  const dispatch = useDispatch();

  const ethernetInfoOpen = useSelector(
    (state: RootState) => state.ui.ethernetInfoOpen,
  );

  const selectAll = useTouchSelectAll();

  const connectionStatus = useDeviceConnectionStatus();
  const connection = connectionStatus.ethernet.connection;

  if (!connectionStatus.ethernet.configured) {
    return null;
  }

  return (
    <StatusKeyValue
      keyName="Ethernet Connection"
      keyNameMobile="Ethernet"
      value={connection?.network ?? ""}
      status={connectionStatus.ethernet.connected ? "g" : "r"}
      loading={connectionStatus.isLoading}
      details={[
        {
          keyName: "Hostname",
          value: hostname ?? "-",
        },
        {
          keyName: "IPv4 Address",
          keyNameMobile: "IPv4",
          value: connection?.cidrIpv4 ? connection?.cidrIpv4 : "-",
        },
        {
          keyName: "MAC Address",
          keyNameMobile: "MAC",
          value: connection?.mac ? connection?.mac : "-",
        },
      ]}
      open={ethernetInfoOpen}
      onOpen={() => dispatch(openEthernetInfo())}
      onClose={() => dispatch(closeEthernetInfo())}
      renderValue={(value) => (
        <Box
          component="span"
          onTouchStart={selectAll}
          sx={{
            marginX: 3,
            textTransform: "uppercase",
          }}
        >
          {value ? value : "Not connected"}
        </Box>
      )}
      link={
        !connectionStatus.ethernet.configured ? (
          <Link to="/settings/ethernet">{"CONFIGURE WIFI"}</Link>
        ) : null
      }
    />
  );
}

export const EthernetConnectionRow = React.memo(EthernetConnectionRowComponent);
