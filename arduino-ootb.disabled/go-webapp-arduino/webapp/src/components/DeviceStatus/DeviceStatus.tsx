import React from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { createTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import arduinoProLogo from "../../assets/arduino-pro.svg";
import { SvgShell } from "../../assets/Shell";
import { useReadHostnameQuery } from "../../services/board";
import { useReadFactoryNameQuery } from "../../services/factory";
import {
  useReadEthernetConnectionQuery,
  useReadWlanConnectionQuery,
} from "../../services/networking";
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

function DeviceStatusComponent(props: { wide?: boolean }) {
  const { wide } = props;
  const { data: wlanConnection, isLoading: wlanConnectionIsLoading } =
    useReadWlanConnectionQuery(undefined, {
      pollingInterval: 3000,
    });
  const { data: ethernetConnection, isLoading: ethernetConnectionIsLoading } =
    useReadEthernetConnectionQuery(undefined, {
      pollingInterval: 3000,
    });
  const { data: factoryNameInfo, isLoading: factoryNameIsLoading } =
    useReadFactoryNameQuery();
  const { data: hostname, isLoading: hostnameIsLoading } =
    useReadHostnameQuery();

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
          maxWidth: wide ? 1440 : 1200,
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
                loading={hostnameIsLoading}
                sx={{ marginBottom: 2 }}
              />
              <StatusKeyValue
                keyName="Wi-Fi Connection"
                value={
                  wlanConnection?.network
                    ? wlanConnection?.network
                    : "Not configured"
                }
                status={wlanConnection?.network ? "g" : "r"}
                loading={wlanConnectionIsLoading}
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
              <StatusKeyValue
                keyName="Ethernet Connection"
                value={
                  ethernetConnection?.network
                    ? ethernetConnection?.network
                    : "Not configured"
                }
                status={ethernetConnection?.network ? "g" : "r"}
                loading={ethernetConnectionIsLoading}
                details={[
                  {
                    keyName: "Hostname",
                    value: hostname?.hostname ? hostname?.hostname : "-",
                  },
                  {
                    keyName: "IPv4 Address",
                    value: ethernetConnection?.ip
                      ? ethernetConnection?.ip
                      : "-",
                  },
                  {
                    keyName: "MAC Address",
                    value: ethernetConnection?.mac
                      ? ethernetConnection?.mac
                      : "-",
                  },
                ]}
              />
              <StatusKeyValue
                keyName="Factory name"
                value={
                  factoryNameInfo?.deviceName
                    ? factoryNameInfo?.deviceName
                    : "Not registered"
                }
                status={factoryNameInfo?.deviceName ? "g" : "r"}
                loading={factoryNameIsLoading}
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
                component={Link}
                to="/shell"
                variant="contained"
                size="small"
                startIcon={<SvgShell />}
                sx={{
                  mb: 2,
                }}
              >
                Launch Shell
              </Button>
              <Button
                component="a"
                href="https://cloud.arduino.cc/"
                target="_blank"
                variant="outlined"
              >
                Go to Arduino Cloud
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
