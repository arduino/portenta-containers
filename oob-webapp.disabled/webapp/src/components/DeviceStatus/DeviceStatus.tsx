import React from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { createTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import arduinoProLogo from "../../assets/arduino-pro.svg";
import shellIcon from "../../assets/shell.svg";
import { useFactoryName } from "../../hooks/query/factory";
import { useBoardHostname } from "../../hooks/query/useBoard";
import { useConnection } from "../../hooks/query/useNetworkList";
import { arduinoProThemeOptions } from "../../theme";
import { StatusKeyValue } from "./StatusKeyValue";

export const statusTheme = createTheme({
  ...arduinoProThemeOptions,
  typography: {
    ...arduinoProThemeOptions.typography,
    fontFamily: "Roboto Mono",
    body1: {
      fontSize: 16,
    },
    body2: {
      fontSize: 14,
      textTransform: "uppercase",
      b: {
        fontWeight: 700,
      },
    },
  },
});

function DeviceStatusComponent() {
  const { data: wlanConnection, isFetched: wlanConnectionIsFetched } =
    useConnection();
  const { data: factoryNameInfo, isFetched: factoryNameIsFetched } =
    useFactoryName();
  const { data: hostname, isFetched: hostnameIsFetched } = useBoardHostname();

  return (
    <Box
      sx={{
        width: "100%",
        background: "#202020",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          margin: "auto",
        }}
      >
        <Box
          component="aside"
          sx={{
            display: "flex",
            alignItems: "flex-start",
            width: "100%",
            fontFamily: "Roboto mono",
            flex: "0 0 auto",
            padding: 4,
            paddingBottom: 8,
            minHeight: 215,
          }}
        >
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                b: {
                  textTransform: "uppercase",
                },
              }}
            >
              <StatusKeyValue
                keyName="Hostname"
                value={hostname?.hostname}
                status="y"
                loading={!hostnameIsFetched}
              />
              <StatusKeyValue
                keyName="Factory name"
                value={
                  factoryNameInfo?.deviceName
                    ? factoryNameInfo?.deviceName
                    : "Not registered"
                }
                status={factoryNameInfo?.deviceName ? "g" : "r"}
                loading={!factoryNameIsFetched}
              />
              <StatusKeyValue
                keyName="Wi-Fi Connection"
                value={
                  wlanConnection?.network
                    ? wlanConnection?.network
                    : "Not configured"
                }
                status={wlanConnection?.network ? "g" : "r"}
                loading={!wlanConnectionIsFetched}
                details={[
                  {
                    keyName: "Hostname",
                    value: hostname?.hostname ? hostname?.hostname : "-",
                  },
                  {
                    keyName: "IPv4 Address",
                    value: wlanConnection?.ip ? wlanConnection?.ip : "-",
                  },
                  {
                    keyName: "MAC Address",
                    value: wlanConnection?.mac ? wlanConnection?.mac : "-",
                  },
                ]}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                ml: "auto",
              }}
            >
              {/* FIXME: link */}
              <Button
                component="a"
                href="https://foundries.io/"
                target="_blank"
                variant="outlined"
                sx={{
                  mb: 2,
                }}
              >
                Go to Factory
              </Button>
              <Button
                component={Link}
                to="/shell"
                variant="contained"
                size="small"
                startIcon={<img src={shellIcon} alt="" />}
              >
                LAUNCH SSH
              </Button>
            </Box>
          </>
        </Box>
        <Box
          component="footer"
          sx={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 1,
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
          }}
        >
          <img src={arduinoProLogo} alt="arduino pro" />
          <Typography sx={{ ml: "20px" }}>© 2022 Arduino</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export const DeviceStatus = React.memo(DeviceStatusComponent);
