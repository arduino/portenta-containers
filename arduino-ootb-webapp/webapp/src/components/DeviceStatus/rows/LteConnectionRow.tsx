import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { SvgCellularSignal } from "../../../assets/CellularSignal";
import { LteConnection } from "../../../entities";
import { useDeviceConnectionStatus } from "../../../hooks/useDeviceConnected";
import { useTouchSelectAll } from "../../../hooks/useTouchSelectAll";
import { RootState } from "../../../store";
import { closeLteInfo, openLteInfo } from "../../../uiSlice";
import { ArduinoProAlert } from "../../ArduinoProAlert";
import { StatusKeyValue } from "../StatusKeyValue";

interface LteConnectionRowProps {
  hostname?: string;
}

function LteConnectionRowComponent(props: LteConnectionRowProps) {
  const { hostname } = props;
  const [connectedOpen, setConnectedOpen] = useState(false);
  const [previousConnectionStatus, setPreviousConnectionStatus] = useState<
    LteConnection["connected"] | undefined
  >(undefined);

  const dispatch = useDispatch();

  const lteInfoOpen = useSelector((state: RootState) => state.ui.lteInfoOpen);

  const selectAll = useTouchSelectAll();

  const connectionStatus = useDeviceConnectionStatus();
  const connection = connectionStatus.lte.connection;

  useEffect(() => {
    if (
      previousConnectionStatus === "Connecting" &&
      connection?.connected === "Connected"
    ) {
      setConnectedOpen(true);
    }
    setPreviousConnectionStatus(connection?.connected);
  }, [connection?.connected, previousConnectionStatus]);

  if (!connectionStatus.lte.configured) {
    return null;
  }

  return (
    <>
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
        renderValue={() => (
          <Box
            component="div"
            onTouchStart={selectAll}
            sx={{
              marginX: 3,
              textTransform: "uppercase",
            }}
          >
            {connection?.connected.endsWith("ing") ? (
              `${connection?.connected}...`
            ) : connection?.connected === "Connected" ? (
              <Stack
                component="div"
                direction="row"
                alignItems="center"
                gap={1}
              >
                <span>{connection.operatorName}</span>
                <SvgCellularSignal
                  signal={
                    connection.rxPower && connection.rxPower !== ""
                      ? Number(connection.rxPower)
                      : -120
                  }
                  fontSize="large"
                  sx={{
                    fontSize: "1.4em",
                    position: "relative",
                    top: "0.125em",
                  }}
                />
              </Stack>
            ) : (
              connection?.connected ?? null
            )}
          </Box>
        )}
        link={
          !connectionStatus.lte.configured ? (
            <Link to="/settings/lte">{"CONFIGURE WIFI"}</Link>
          ) : null
        }
      />
      {connectedOpen ? (
        <ArduinoProAlert
          message={
            <span>
              {`Your Arduino Portenta X8 is now connected to the Network `}
              <b>{connection?.operatorName}</b>
            </span>
          }
          open={true}
          severity={"success"}
        />
      ) : null}
    </>
  );
}

export const LteConnectionRow = React.memo(LteConnectionRowComponent);
