import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { createTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import arduinoProLogo from "../../assets/arduino-pro.svg";
import { SvgMinus } from "../../assets/Minus";
import { SvgPlus } from "../../assets/Plus";
import { useReadHostnameQuery } from "../../services/board";
import { arduinoProThemeOptions, mobileMQ } from "../../theme";
import UpdateDialog from "../UploadDialog/UpdateDialog";
import { SystemInfo } from "../wizard/SystemInfo/SystemInfo";
import { EthernetConnectionRow } from "./rows/EthernetConnectionRow";
import { FactoryNameRow } from "./rows/FactoryNameRow";
import { HostnameRow } from "./rows/HostnameRow";
import { IotCloudRegistrationRow } from "./rows/IotCloudRegistrationRow";
import { WlanConnectionRow } from "./rows/WlanConnectionRow";

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

  const { data: hostname, isLoading: hostnameIsLoading } =
    useReadHostnameQuery();

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
            <HostnameRow
              hostname={hostname}
              hostnameIsLoading={hostnameIsLoading}
            />
            <WlanConnectionRow hostname={hostname?.hostname} />
            <EthernetConnectionRow hostname={hostname?.hostname} />
            <FactoryNameRow />
            <IotCloudRegistrationRow />
            <SystemInfo />
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
