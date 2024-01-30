import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import { useDeviceConnectionStatus } from "../../../hooks/useDeviceConnected";
import { useTouchSelectAll } from "../../../hooks/useTouchSelectAll";
import { RootState } from "../../../store";
import { closeLteInfo, openLteInfo } from "../../../uiSlice";
import { StatusKeyValue } from "../StatusKeyValue";

interface LteConnectionRowProps {
  hostname?: string;
}

function LteConnectionRowComponent(props: LteConnectionRowProps) {
  const { hostname } = props;

  const dispatch = useDispatch();

  const lteInfoOpen = useSelector((state: RootState) => state.ui.lteInfoOpen);

  const selectAll = useTouchSelectAll();

  const connectionStatus = useDeviceConnectionStatus();
  const connection = connectionStatus.lte.connection;

  if (!connectionStatus.lte.configured) {
    return null;
  }

  return (
    <StatusKeyValue
      keyName="4G/LTE Network"
      keyNameMobile="4G/LTE"
      value={connection?.connected}
      status={
        connectionStatus.lte.isLoading
          ? "y"
          : connectionStatus.lte.connected
            ? "g"
            : "r"
      }
      loading={connectionStatus.isLoading}
      details={[
        {
          keyName: "Hostname",
          value: hostname ?? "-",
        },
        // {
        //   keyName: "IPv4 Address",
        //   keyNameMobile: "IPv4",
        //   value: connection?.cidrIpv4 ? connection?.cidrIpv4 : "-",
        // },
        // {
        //   keyName: "MAC Address",
        //   keyNameMobile: "MAC",
        //   value: connection?.mac ? connection?.mac : "-",
        // },
      ]}
      open={lteInfoOpen}
      onOpen={() => dispatch(openLteInfo())}
      onClose={() => dispatch(closeLteInfo())}
      renderValue={(value) => (
        <Box
          component="span"
          onTouchStart={selectAll}
          sx={{
            marginX: 3,
            textTransform: "uppercase",
          }}
        >
          {value ? value : "Connected"}
        </Box>
      )}
      link={
        !connectionStatus.lte.configured ? (
          <Link to="/settings/lte">{"CONFIGURE WIFI"}</Link>
        ) : null
      }
    />
  );
}

export const LteConnectionRow = React.memo(LteConnectionRowComponent);
