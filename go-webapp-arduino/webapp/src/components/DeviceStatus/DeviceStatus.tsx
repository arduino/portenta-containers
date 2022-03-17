import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { createTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import arduinoProLogo from "../../assets/arduino-pro.svg";
import { SvgArrowRight } from "../../assets/ArrowRight";
import { SvgMinus } from "../../assets/Minus";
import { SvgPlus } from "../../assets/Plus";
import { SvgShell } from "../../assets/Shell";
import { useTouchSelectAll } from "../../hooks/useTouchSelectAll";
import { useReadHostnameQuery } from "../../services/board";
import { useReadFactoryNameQuery } from "../../services/factory";
import {
  useReadEthernetConnectionQuery,
  useReadWlanConnectionQuery,
} from "../../services/networking";
import { RootState } from "../../store";
import { arduinoProThemeOptions } from "../../theme";
import {
  closeWifiInfo,
  openWifiInfo,
  openEthernetInfo,
  closeEthernetInfo,
} from "../../uiSlice";
import { Copy } from "../Copy";
import { TooltipIcon } from "../TooltipIcon";
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
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const selectAll = useTouchSelectAll();
  const wifiInfoOpen = useSelector((state: RootState) => state.ui.wifiInfoOpen);
  const ethernetInfoOpen = useSelector(
    (state: RootState) => state.ui.ethernetInfoOpen
  );
  const dispatch = useDispatch();
  const { data: wlanConnection, isLoading: wlanConnectionIsLoading } =
    useReadWlanConnectionQuery(undefined, {
      pollingInterval: 3000,
    });
  const { data: ethernetConnection, isLoading: ethernetConnectionIsLoading } =
    useReadEthernetConnectionQuery(undefined, {
      pollingInterval: 30000,
    });
  const { data: factoryNameInfo, isLoading: factoryNameIsLoading } =
    useReadFactoryNameQuery(undefined, {
      pollingInterval: 12000,
    });

  const { data: hostname, isLoading: hostnameIsLoading } =
    useReadHostnameQuery();

  return (
    <>
      <Box
        component="aside"
        sx={(theme) => ({
          display: "flex",
          flexDirection: {
            md: "row",
            xs: "column",
          },
          alignItems: "flex-start",
          justifyContent: {
            xs: "flex-start",
            md: "center",
          },
          width: "100%",
          fontFamily: "Roboto mono",
          flex: "0 0 auto",
          background: "#202020",
          position: {
            xs: "fixed",
            md: "static",
          },
          zIndex: 100,
          bottom: 38,
          paddingX: {
            xs: 2,
            md: 4,
          },
          paddingY: {
            xs: 1.25,
            md: 4,
          },
          paddingBottom: 8,
          minHeight: {
            xs: "unset",
            md: 215,
          },
          height: {
            xs: expanded ? "calc(100% - 38px)" : 40,
            md: "auto",
          },
          maxHeight: {
            xs: expanded ? "calc(100% - 38px)" : 40,
            md: "none",
          },
          transition: theme.transitions.create(["height", "max-height"]),
          overflow: "hidden",
        })}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: wide ? 1440 : 1200,
            display: "flex",
            flexDirection: {
              md: "row",
              xs: "column",
            },
            alignItems: "flex-start",
            flex: "1 1 auto",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              display: {
                xs: undefined,
                md: "none",
              },
            }}
          >
            <Box
              component={expanded ? SvgMinus : SvgPlus}
              onClick={() => setExpanded((e) => !e)}
              sx={{ position: "absolute", left: 0, height: 20 }}
            />
            <Typography
              variant="h3"
              textTransform="uppercase"
              textAlign="center"
              fontWeight={700}
              sx={{ width: "100%", minHeight: 40 }}
            >
              {"Board info"}
            </Typography>
          </Box>
          <Box
            component="ul"
            role="menu"
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: "1 1 auto",
              margin: 0,
              padding: 0,
              b: {
                textTransform: "uppercase",
              },
              width: {
                xs: "100%",
                md: "none",
              },
              marginBottom: {
                xs: 0,
                md: 4,
              },
            }}
          >
            <StatusKeyValue
              keyName="Hostname"
              value={hostname?.hostname}
              status="y"
              loading={hostnameIsLoading}
              renderValue={(value) => (
                <Copy value={`${value}`} backgroundColor="#202020">
                  <Box component="b">{value}</Box>
                </Copy>
              )}
              sx={{ marginBottom: 2 }}
            />
            <StatusKeyValue
              keyName="Wi-Fi Connection"
              keyNameMobile="Wi-Fi"
              value={wlanConnection?.network ? wlanConnection?.network : ""}
              status={wlanConnection?.network ? "g" : "r"}
              loading={wlanConnectionIsLoading}
              details={[
                {
                  keyName: "Hostname",
                  value: hostname?.hostname ? hostname?.hostname : "-",
                },
                {
                  keyName: "IPv4 Address",
                  keyNameMobile: "IPv4",
                  value: wlanConnection?.ip ? wlanConnection?.ip : "-",
                },
                {
                  keyName: "MAC Address",
                  keyNameMobile: "MAC",
                  value: wlanConnection?.mac ? wlanConnection?.mac : "-",
                },
              ]}
              open={wifiInfoOpen}
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
            <StatusKeyValue
              keyName="Ethernet Connection"
              keyNameMobile="Ethernet"
              value={
                ethernetConnection?.network ? ethernetConnection?.network : ""
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
                  keyNameMobile: "IPv4",
                  value: ethernetConnection?.ip ? ethernetConnection?.ip : "-",
                },
                {
                  keyName: "MAC Address",
                  keyNameMobile: "MAC",
                  value: ethernetConnection?.mac
                    ? ethernetConnection?.mac
                    : "-",
                },
              ]}
              open={ethernetInfoOpen}
              onOpen={() => dispatch(openEthernetInfo())}
              onClose={() => dispatch(closeEthernetInfo())}
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
                  "Not connected"
                )
              }
            />
            <StatusKeyValue
              keyName="Factory name"
              keyNameMobile="Factory"
              value={
                factoryNameInfo?.factoryName ? factoryNameInfo?.factoryName : ""
              }
              status={
                factoryNameInfo?.factoryName
                  ? factoryNameInfo.registrationComplete
                    ? "g"
                    : "y"
                  : "r"
              }
              loading={factoryNameIsLoading}
              renderValue={(value) =>
                value ? (
                  <TooltipIcon
                    icon={<SvgArrowRight />}
                    href={`${import.meta.env.VITE_FOUNDIRES_FACTORY}${value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    tooltip={"Go to Factory"}
                    backgroundColor="#202020"
                  />
                ) : (
                  <Button
                    component={Link}
                    to="/factory"
                    color="primary"
                    variant="text"
                    size="small"
                    sx={{
                      paddingX: 1,
                      fontSize: "inherit",
                      marginX: 3,
                    }}
                  >
                    {"Not configured"}
                  </Button>
                )
              }
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              ml: {
                xs: 0,
                md: "auto",
              },
              width: {
                xs: "100%",
                md: "unset",
              },
              marginTop: {
                xs: "auto",
                md: 0,
              },
            }}
          >
            <Button
              component="button"
              onClick={() => navigate("/shell")}
              variant="contained"
              size="small"
              startIcon={<SvgShell />}
              sx={{
                marginBottom: 2,
                marginX: {
                  xs: "auto",
                  md: 0,
                },
              }}
            >
              Launch Shell
            </Button>
            <Button
              component="a"
              href={`${import.meta.env.VITE_ARDUINO_CLOUD_URL}`}
              rel="noopener noreferrer"
              target="_blank"
              variant="outlined"
              sx={{
                marginBottom: 2,
                marginX: {
                  xs: "auto",
                  md: 0,
                },
                whiteSpace: "nowrap",
              }}
            >
              Go to Arduino Cloud
            </Button>
          </Box>
        </Box>
      </Box>
      <Box
        component="footer"
        sx={{
          display: "flex",
          justifyContent: "center",
          paddingY: 1,
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "#202020",
        }}
      >
        <img src={arduinoProLogo} alt="arduino pro" />
        <Typography sx={{ ml: "20px" }}>© 2022 Arduino</Typography>
      </Box>
    </>
  );
}

export const DeviceStatus = React.memo(DeviceStatusComponent);
