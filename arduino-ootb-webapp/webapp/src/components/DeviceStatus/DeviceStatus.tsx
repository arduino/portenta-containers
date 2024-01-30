import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { createTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import arduinoProLogo from "../../assets/arduino-pro.svg";
import { SvgArrowRight } from "../../assets/ArrowRight";
import { SvgMinus } from "../../assets/Minus";
import { SvgPlus } from "../../assets/Plus";
import { useDeviceConnectionStatus } from "../../hooks/useDeviceConnected";
import { useTouchSelectAll } from "../../hooks/useTouchSelectAll";
import { useReadHostnameQuery } from "../../services/board";
import { useReadFactoryNameQuery } from "../../services/factory";
import { useReadIoTCloudRegistrationQuery } from "../../services/iot-cloud";
import {
  useReadEthernetConnectionQuery,
  useReadWlanConnectionQuery,
} from "../../services/networking";
import { RootState } from "../../store";
import { arduinoProThemeOptions, mobileMQ } from "../../theme";
import {
  closeWifiInfo,
  openWifiInfo,
  openEthernetInfo,
  closeEthernetInfo,
} from "../../uiSlice";
import { Copy } from "../Copy";
import { TooltipIcon } from "../TooltipIcon";
import UpdateDialog from "../UploadDialog/UpdateDialog";
import { StatusKeyValue } from "./StatusKeyValue";

const connectionQueryParams = {
  pollingInterval: 5000,
};

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
  const [expanded, setExpanded] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);

  const selectAll = useTouchSelectAll();
  const wifiInfoOpen = useSelector((state: RootState) => state.ui.wifiInfoOpen);
  const ethernetInfoOpen = useSelector(
    (state: RootState) => state.ui.ethernetInfoOpen,
  );
  const dispatch = useDispatch();
  const { data: wlanConnection, isLoading: wlanConnectionIsLoading } =
    useReadWlanConnectionQuery(undefined, connectionQueryParams);
  const { data: ethernetConnection, isLoading: ethernetConnectionIsLoading } =
    useReadEthernetConnectionQuery(undefined, connectionQueryParams);
  const { data: factoryNameInfo, isLoading: factoryNameIsLoading } =
    useReadFactoryNameQuery(undefined, {
      pollingInterval: 12000,
    });
  const { data: ioTCloudRegistrationInfo } = useReadIoTCloudRegistrationQuery(
    undefined,
    {
      pollingInterval: 3000,
    },
  );

  const { data: hostname, isLoading: hostnameIsLoading } =
    useReadHostnameQuery();

  const connectionStatus = useDeviceConnectionStatus();

  return (
    <>
      <Box
        sx={{
          display: "none",
          [mobileMQ]: {
            display: "block",
            flex: "0 0 78px",
            width: "100%",
          },
        }}
      />
      <Box
        component="aside"
        sx={(theme) => ({
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "center",
          width: "100%",
          fontFamily: "Roboto mono",
          flex: "0 0 auto",
          background: "#202020",
          position: "static",
          zIndex: 100,
          bottom: 38,
          paddingX: 4,
          paddingY: 4,
          paddingBottom: 8,
          minHeight: 215,
          height: "auto",
          maxHeight: "none",
          transition: theme.transitions.create(["height", "max-height"]),
          overflow: "hidden",
          [mobileMQ]: {
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            position: "fixed",
            paddingX: 2,
            paddingY: 1.25,
            minHeight: "unset",
            height: expanded ? "calc(100% - 38px)" : 40,
            maxHeight: expanded ? "calc(100% - 38px)" : 40,
          },
        })}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: wide ? 1440 : 1200,
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            flex: "1 1 auto",
            [mobileMQ]: {
              flexDirection: "column",
              maxWidth: "none",
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              display: "none",
              [mobileMQ]: {
                display: "block",
              },
            }}
            onClick={() => setExpanded((e) => !e)}
          >
            <Box
              component={expanded ? SvgMinus : SvgPlus}
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
              width: "none",
              marginBottom: 4,
              [mobileMQ]: {
                width: "100%",
                marginBottom: 0,
              },
            }}
          >
            {hostname?.hostname ? (
              <StatusKeyValue
                keyName="Hostname"
                value={hostname?.hostname}
                status="g"
                loading={hostnameIsLoading}
                renderValue={(value) => (
                  <Copy value={`${value}`} backgroundColor="#202020">
                    <Box component="b">{value}</Box>
                  </Copy>
                )}
                sx={{ marginBottom: 2 }}
              />
            ) : null}
            {wlanConnection?.network ? (
              <StatusKeyValue
                keyName="Wi-Fi Connection"
                keyNameMobile="Wi-Fi"
                value={wlanConnection?.network ? wlanConnection?.network : ""}
                status={wlanConnection?.connected ? "g" : "r"}
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
            ) : null}
            {connectionStatus.ethernet.configured ? (
              <StatusKeyValue
                keyName="Ethernet Connection"
                keyNameMobile="Ethernet"
                value={
                  ethernetConnection?.network ? ethernetConnection?.network : ""
                }
                status={connectionStatus.ethernet.connected ? "g" : "r"}
                loading={ethernetConnectionIsLoading}
                details={[
                  {
                    keyName: "Hostname",
                    value: hostname?.hostname ? hostname?.hostname : "-",
                  },
                  {
                    keyName: "IPv4 Address",
                    keyNameMobile: "IPv4",
                    value: ethernetConnection?.ip
                      ? ethernetConnection?.ip
                      : "-",
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
                  !connectionStatus.wlan.configured ? (
                    <Link to="/wlan">{"CONFIGURE WIFI"}</Link>
                  ) : null
                }
              />
            ) : null}
            {factoryNameInfo?.registrationComplete ? (
              <StatusKeyValue
                keyName="Factory name"
                keyNameMobile="Factory"
                value={
                  factoryNameInfo?.registrationComplete
                    ? factoryNameInfo.factoryName ?? "Unknown"
                    : undefined
                }
                status={
                  factoryNameInfo?.registrationComplete
                    ? "g"
                    : factoryNameInfo?.authenticationPending
                      ? "y"
                      : "r"
                }
                loading={factoryNameIsLoading}
                renderValue={(value) =>
                  value ? (
                    <>
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
                      <TooltipIcon
                        icon={<SvgArrowRight />}
                        href={`${import.meta.env.VITE_FOUNDRIES_FACTORY}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        tooltip={"Go to Factory"}
                        backgroundColor="#202020"
                      />
                    </>
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
            ) : null}
            {ioTCloudRegistrationInfo?.registered ? (
              <StatusKeyValue
                keyName="Arduino Cloud"
                keyNameMobile="Arduino Cloud"
                value={
                  ioTCloudRegistrationInfo?.registered
                    ? ioTCloudRegistrationInfo.deviceName ?? "Unknown"
                    : undefined
                }
                status={
                  ioTCloudRegistrationInfo?.registered
                    ? "g"
                    : // : ioTCloudRegistrationInfo?.authenticationPending
                      // ? "y"
                      "r"
                }
                loading={factoryNameIsLoading}
                renderValue={(value) =>
                  value ? (
                    <>
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
                      <TooltipIcon
                        icon={<SvgArrowRight />}
                        href={`${
                          import.meta.env.VITE_ARDUINO_IOT_CLOUD_DEVICES
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                        tooltip={"Go to Arduino Cloud"}
                        backgroundColor="#202020"
                      />
                    </>
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
            ) : null}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              ml: "auto",
              width: "unset",
              marginTop: 0,
              paddingLeft: 2,
              [mobileMQ]: {
                ml: 0,
                width: "100%",
                marginTop: "auto",
              },
            }}
          >
            {/* <Button
              component="button"
              onClick={() => navigate("/shell")}
              variant="contained"
              size="small"
              startIcon={<SvgShell />}
              sx={{
                marginBottom: 2,
                marginX: 0,
                [mobileMQ]: {
                  marginX: "auto",
                },
              }}
            >
              Launch Shell
            </Button> */}
            <Button
              component="a"
              href={`${import.meta.env.VITE_ARDUINO_DOCS_X8_URL}`}
              rel="noopener noreferrer"
              target="_blank"
              variant="text"
              sx={{
                marginBottom: 2,
                marginX: 0,
                [mobileMQ]: {
                  marginX: "auto",
                },
                whiteSpace: "nowrap",
                fontWeight: 700,
              }}
            >
              GO TO DOCUMENTATION
            </Button>
            <Button
              onClick={() => setOpenUpdateDialog(true)}
              variant="text"
              sx={{
                marginBottom: 2,
                marginX: 0,
                [mobileMQ]: {
                  marginX: "auto",
                },
                whiteSpace: "nowrap",
                fontWeight: 700,
              }}
            >
              CHECK FOR UPDATES
            </Button>
          </Box>
        </Box>
        <UpdateDialog
          isOpen={openUpdateDialog}
          handleClose={() => setOpenUpdateDialog(false)}
        />
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
          zIndex: 10000,
        }}
      >
        <img src={arduinoProLogo} alt="arduino pro" />
        <Typography sx={{ ml: "20px" }}>© 2023 Arduino</Typography>
      </Box>
      <Box
        component="span"
        sx={{
          position: "fixed",
          bottom: "4px",
          left: "4px",
          zIndex: 10001,
          fontSize: "0.7rem",
          opacity: 0.8,
        }}
      >
        Vers. {import.meta.env.VITE_OOTB_GIT_SHA_VERS}
      </Box>
    </>
  );
}

export const DeviceStatus = React.memo(DeviceStatusComponent);
