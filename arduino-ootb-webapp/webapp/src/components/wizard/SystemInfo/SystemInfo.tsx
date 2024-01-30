import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";

import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography, { TypographyProps } from "@mui/material/Typography";
import SvgSettings from "../../../assets/Settings";
import { useDeviceConnectionStatus } from "../../../hooks/useDeviceConnected";
import {
  useReadContainersStatusQuery,
  useReadHostnameQuery,
  useReadSystemStatusQuery,
} from "../../../services/board";
import { mobileMQ } from "../../../theme";
import { DarkDialog, DarkDialogTitle } from "../../DarkDialog";
import { StatusCircle, StatusCircleProps } from "../../StatusCircle";

const options = { pollingInterval: 5000 };

function InfoTitle(props: { title: string }) {
  const { title } = props;
  return (
    <Grid item xs={12}>
      <Stack direction="row" alignItems="center" gap={3}>
        <Typography
          variant="h2"
          color="secondary.dark"
          fontFamily="Roboto Mono"
        >
          {title}
        </Typography>
        <Box
          sx={{
            flex: 1,
            borderBottom: "0.75px solid",
            borderColor: "secondary.dark",
          }}
        />
      </Stack>
    </Grid>
  );
}

const HwTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "Roboto Mono",
  marginBottom: 2,
  color: theme.palette.text.secondary,
  fontWeight: 700,
  fontSize: "0.85em",
}));

function ConnectionTitle(props: TypographyProps) {
  return (
    <HwTitle
      sx={{
        color: "secondary.main",
        "svg path": { fill: "currentColor", color: "inherit" },
      }}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <SvgSettings height="1em" />
        <span>{props.children}</span>
      </Stack>
    </HwTitle>
  );
}

interface SystemInfoKeyValueProps {
  definition: string | React.ReactNode;
  value: string | React.ReactNode;
}

function SystemInfoKeyValue(props: SystemInfoKeyValueProps) {
  const { definition, value } = props;
  return (
    <Stack
      direction="row"
      sx={{
        width: "100%",
        fontFamily: "Roboto Mono",
        "& .MuiTypography-root": {
          flex: "1 1 auto",
          fontFamily: "inherit",
        },
      }}
    >
      <Typography variant="body2" color="text.disabled">
        {definition}
      </Typography>
      <Typography variant="body2" textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}

function DockerContainer(props: SystemInfoKeyValueProps & StatusCircleProps) {
  const { definition, status, ...sysyemInfoProps } = props;
  return (
    <SystemInfoKeyValue
      {...sysyemInfoProps}
      definition={
        <Stack direction="row" alignItems="center" gap={1}>
          <StatusCircle status={status} />
          <Typography typography="body2">{definition}</Typography>
        </Stack>
      }
    />
  );
}

function ConnectionStatus(props: { connected: boolean }) {
  const { connected } = props;
  return (
    <SystemInfoKeyValue
      definition={"Status"}
      value={
        <Stack direction="row" justifyContent="flex-end" alignItems="center">
          <StatusCircle status={connected ? "g" : "y"} />
          <span>{connected ? "Connected" : "Not connected"}</span>
        </Stack>
      }
    />
  );
}

function SystemInfoComponent() {
  const [open, setOpen] = useState(false);

  const { data: systemStatus } = useReadSystemStatusQuery(undefined, options);
  const { data: containersStatus } = useReadContainersStatusQuery(
    undefined,
    options,
  );

  const deviceConnectionStatus = useDeviceConnectionStatus();
  const hostname = useReadHostnameQuery();

  const handleClose = () => {
    setOpen(false);
  };

  const totalRam = systemStatus ? (systemStatus.usedRam / 1000).toFixed(0) : 0;
  const usedRam = systemStatus
    ? (systemStatus.usedRam / (systemStatus.usedRam ?? 1)).toFixed(2)
    : 0;

  return (
    <>
      <Box>
        <Button
          onClick={() => setOpen(true)}
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
          System info
        </Button>
      </Box>
      <DarkDialog onClose={handleClose} open={open} maxWidth="xl" fullWidth>
        <DarkDialogTitle id={""} onClose={handleClose}>
          Portenta X8 - System Info
        </DarkDialogTitle>
        <DialogContent sx={{ minHeight: "60vh" }}>
          <Grid container rowSpacing={2} columnSpacing={8}>
            <InfoTitle title={"Portenta HW/SW"} />
            <Grid item xs={12} md={6} lg={4}>
              <HwTitle>{"Software"}</HwTitle>
              <SystemInfoKeyValue
                definition={"Linux Version"}
                value={systemStatus?.linuxVersion ?? "—"}
              />
              <SystemInfoKeyValue
                definition={"Out Of the Box Version"}
                value={systemStatus?.ootbVersion ?? "—"}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <HwTitle>{"System Status"}</HwTitle>
              <SystemInfoKeyValue
                definition={"MPU Temperature"}
                value={
                  systemStatus?.mpuTemp ? `${systemStatus.mpuTemp}°C` : "—"
                }
              />
              <SystemInfoKeyValue definition={"Used RAM"} value={`${32}%`} />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <HwTitle sx={{ opacity: 0 }}>{"System Status"}</HwTitle>
              <SystemInfoKeyValue
                definition={"Used Storage Memory"}
                value={
                  systemStatus?.usedRam ? `${usedRam}% (${totalRam}MB)` : "—"
                }
              />
              <SystemInfoKeyValue
                definition={"CPU Load"}
                value={
                  systemStatus?.percentStorage
                    ? `${systemStatus.percentStorage}`
                    : "—"
                }
              />
            </Grid>
            <InfoTitle title={"Network Status"} />
            <Grid item xs={12} md={6} lg={4}>
              <ConnectionTitle>{"4G/LTE Network"}</ConnectionTitle>
              <ConnectionStatus
                connected={deviceConnectionStatus.lte.connected}
              />
              <SystemInfoKeyValue
                definition={"LTE Modem name"}
                value={deviceConnectionStatus.lte.connection?.carrier ?? "—"}
              />
              <SystemInfoKeyValue
                definition={"LTE IP Address"}
                value={deviceConnectionStatus.lte.connection?.ip ?? "—"}
              />
              <SystemInfoKeyValue
                definition={"Access Technology"}
                value={
                  deviceConnectionStatus.lte.connection?.accessTechnology ?? "—"
                }
              />
              <SystemInfoKeyValue
                definition={"Signal Strength"}
                value={deviceConnectionStatus.lte.connection?.rxPower ?? "—"}
              />
              {/* FIXME: */}
              <SystemInfoKeyValue
                definition={"Signal Details"}
                value={deviceConnectionStatus.lte.connection?.quality ?? "—"}
              />
              <SystemInfoKeyValue
                definition={"Location Info"}
                value={
                  deviceConnectionStatus.lte.connection?.locationInfo ?? "—"
                }
              />
              <SystemInfoKeyValue
                definition={"Carrier"}
                value={deviceConnectionStatus.lte.connection?.carrier ?? "—"}
              />
              <SystemInfoKeyValue
                definition={"Serial Number"}
                value={
                  deviceConnectionStatus.lte.connection?.serialNumber ?? "—"
                }
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <ConnectionTitle>{"Wifi Network"}</ConnectionTitle>
              <ConnectionStatus
                connected={deviceConnectionStatus.wlan.connected}
              />
              <SystemInfoKeyValue
                definition={"Hostname"}
                value={hostname.data?.hostname ?? "—"}
              />
              <SystemInfoKeyValue
                definition={"WiFi IP Address"}
                value={deviceConnectionStatus.wlan.connection?.ip ?? "—"}
              />
              <SystemInfoKeyValue
                definition={"MAC Address"}
                value={deviceConnectionStatus.wlan.connection?.mac ?? "—"}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <ConnectionTitle>{"Ethernet"}</ConnectionTitle>
              <ConnectionStatus
                connected={deviceConnectionStatus.ethernet.connected}
              />
              <SystemInfoKeyValue
                definition={"Hostname"}
                value={hostname.data?.hostname ?? "—"}
              />
              <SystemInfoKeyValue
                definition={"ETH IP Address"}
                value={deviceConnectionStatus.ethernet.connection?.ip ?? "—"}
              />
              <SystemInfoKeyValue
                definition={"MAC Address"}
                value={deviceConnectionStatus.ethernet.connection?.mac ?? "—"}
              />
            </Grid>
            <InfoTitle title={"Containers running"} />
            <Grid item xs={12} md={6} lg={4}>
              {containersStatus?.map((container) => (
                <DockerContainer
                  key={container.name}
                  definition={container.name}
                  value={container.id.substring(0, 12)}
                  status={container.status === "running" ? "g" : "r"}
                />
              ))}
            </Grid>
          </Grid>
        </DialogContent>
      </DarkDialog>
    </>
  );
}

export const SystemInfo = React.memo(SystemInfoComponent);
