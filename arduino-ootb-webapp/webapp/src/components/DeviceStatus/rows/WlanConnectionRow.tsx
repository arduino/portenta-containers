import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useDeviceConnectionStatus } from "../../../hooks/useDeviceConnected";
import { useTouchSelectAll } from "../../../hooks/useTouchSelectAll";
import { RootState } from "../../../store";
import { closeWifiInfo, openWifiInfo } from "../../../uiSlice";
import { StatusKeyValue } from "../StatusKeyValue";

interface WlanConnectionRowProps {
  hostname?: string;
}

function WlanConnectionRowComponent(props: WlanConnectionRowProps) {
  const { hostname } = props;

  const dispatch = useDispatch();

  const wlanInfoOpen = useSelector((state: RootState) => state.ui.wifiInfoOpen);

  const selectAll = useTouchSelectAll();

  const connectionStatus = useDeviceConnectionStatus();
  const connection = connectionStatus.wlan.connection;

  if (!connectionStatus.wlan.configured) {
    return null;
  }

  return (
    <StatusKeyValue
      keyName="Wi-Fi Connection"
      keyNameMobile="Wi-Fi"
      value={connection?.network ? connection?.network : ""}
      status={connection?.connected ? "g" : "r"}
      loading={connectionStatus.isLoading}
      details={[
        {
          keyName: "Hostname",
          value: hostname ?? "-",
        },
        {
          keyName: "IPv4 Address",
          keyNameMobile: "IPv4",
          value: connection?.ip ? connection?.ip : "-",
        },
        {
          keyName: "MAC Address",
          keyNameMobile: "MAC",
          value: connection?.mac ? connection?.mac : "-",
        },
      ]}
      open={wlanInfoOpen}
      onOpen={() => dispatch(openWifiInfo())}
      onClose={() => dispatch(closeWifiInfo())}
      renderValue={(value) =>
        value ? (
          <Box
            component="span"
            onTouchStart={selectAll}
            sx={{
              marginX: 3,
              textTransform: "uppercase",
            }}
          >
            {value}
          </Box>
        ) : (
          <Button
            component={Link}
            to="/wlan"
            color="primary"
            variant="text"
            size="small"
            sx={{
              paddingX: 1,
              fontSize: "inherit",
              marginX: 2,
            }}
          >
            {"Not configured"}
          </Button>
        )
      }
    />
  );
}

export const WlanConnectionRow = React.memo(WlanConnectionRowComponent);
