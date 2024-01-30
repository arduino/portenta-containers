import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";

import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography, { TypographyProps } from "@mui/material/Typography";
import SvgSettings from "../../../assets/Settings";
import { mobileMQ } from "../../../theme";
import { DarkDialog, DarkDialogTitle } from "../../DarkDialog";
import { StatusCircle, StatusCircleProps } from "../../StatusCircle";

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
        <Stack direction="row" alignItems="center">
          <StatusCircle status={status} />
          <span>{definition}</span>
        </Stack>
      }
    />
  );
}

function SystemInfoComponent() {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

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
                value={"XXXXXXX"}
              />
              <SystemInfoKeyValue
                definition={"Out Of the Box Version"}
                value={"v2.0.3"}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <HwTitle>{"System Status"}</HwTitle>
              <SystemInfoKeyValue
                definition={"MPU Temperature"}
                value={`${37.5}°C`}
              />
              <SystemInfoKeyValue definition={"Used RAM"} value={`${32}%`} />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <HwTitle sx={{ opacity: 0 }}>{"System Status"}</HwTitle>
              <SystemInfoKeyValue
                definition={"Used Storage Memory"}
                value={`${43}% (${435}MB)`}
              />
              <SystemInfoKeyValue definition={"CPU Load"} value={`${2.43}%`} />
            </Grid>
            <InfoTitle title={"Network Status"} />
            <Grid item xs={12} md={6} lg={4}>
              <ConnectionTitle>{"4G/LTE Network"}</ConnectionTitle>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <ConnectionTitle>{"Wifi Network"}</ConnectionTitle>
              <SystemInfoKeyValue
                definition={"Status"}
                value={
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                  >
                    <StatusCircle status="y" />
                    <span>{"Not connected"}</span>
                  </Stack>
                }
              />
              <SystemInfoKeyValue definition={"Hostname"} value={"v2.0.3"} />
              <SystemInfoKeyValue
                definition={"WiFi IP Address"}
                value={"v2.0.3"}
              />
              <SystemInfoKeyValue definition={"MAC Address"} value={"v2.0.3"} />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <ConnectionTitle>{"Ethernet"}</ConnectionTitle>
              <SystemInfoKeyValue
                definition={"Status"}
                value={
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                  >
                    <StatusCircle status="g" />
                    <span>{"Connected"}</span>
                  </Stack>
                }
              />
              <SystemInfoKeyValue definition={"Hostname"} value={"v2.0.3"} />
              <SystemInfoKeyValue
                definition={"ETH IP Address"}
                value={"v2.0.3"}
              />
              <SystemInfoKeyValue definition={"MAC Address"} value={"v2.0.3"} />
            </Grid>
            <InfoTitle title={"Containers running"} />
            <Grid item xs={12} md={6} lg={4}>
              <DockerContainer
                definition={"X8-DEVEL"}
                value={"56544c529053"}
                status="r"
              />
            </Grid>
          </Grid>
        </DialogContent>
      </DarkDialog>
    </>
  );
}

export const SystemInfo = React.memo(SystemInfoComponent);
