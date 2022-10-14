import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import SvgCloud from "../../../assets/Cloud";
import SvgInfo from "../../../assets/Info";
import SvgLinux from "../../../assets/Linux";
import SvgSettings from "../../../assets/Settings";
import SvgShell from "../../../assets/Shell";
import { useDeviceConnected } from "../../../hooks/useDeviceConnected";
import { DeviceStatus } from "../../DeviceStatus/DeviceStatus";
import { PageBox } from "../../PageBox";
import { OfflineLanding } from "./OfflineLanding";

interface LandingCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  plan?: string;
  tooltip?: React.ReactNode;
}

function LandingCard(props: LandingCardProps) {
  const { to, icon, title, plan, description, tooltip } = props;
  return (
    <Card
      component={Link}
      to={to}
      elevation={4}
      sx={{ maxWidth: 260, minWidth: 260, marginX: 2, marginBottom: 2 }}
    >
      <CardActionArea sx={{ height: "100%" }}>
        <Box
          sx={{
            minHeight: 32,
            color: "#95A5A6",
            textTransform: "uppercase",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "Roboto Mono",
            paddingX: 1,
            paddingY: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            position: "absolute",
            top: 0,
            right: 0,
          }}
        >
          {plan ?? ""}
          {plan && (
            <Tooltip title={<>{tooltip}</>}>
              <IconButton size="small" sx={{ marginLeft: 1 }}>
                <SvgInfo />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Box sx={{ width: 80, marginTop: 4, marginBottom: 4 }}>{icon}</Box>
          <Typography textAlign="center" fontFamily="Roboto Mono" fontSize={14}>
            {title}
          </Typography>
          <Box component="hr" sx={{ width: 160, marginY: 2 }} />
          <Typography textAlign="center" fontSize={12} letterSpacing="0.3px">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function LandingComponent() {
  // const { data: existingDeviceName } = useReadIoTCloudRegistrationQuery();

  const deviceConnected = useDeviceConnected();

  //   const isRegisteredToIoTCloud =
  //     existingDeviceName &&
  //     existingDeviceName.deviceName &&
  //     existingDeviceName.deviceName.length &&
  //     !existingDeviceName.deviceNameSuggested;

  if (!deviceConnected) {
    return <OfflineLanding />;
  }

  return (
    <>
      <PageBox maxWidth={1920} sx={{ flex: "0 1 auto" }}>
        <Typography variant="h1" textAlign="center" sx={{ marginBottom: 2 }}>
          Welcome to the <b>Arduino Portenta X8</b>
        </Typography>
        <Typography variant="h2" sx={{ marginBottom: 3 }}>
          {"Start using your connected device"}
        </Typography>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "stretch",
            flexWrap: "wrap",
          }}
        >
          {/* <List sx={{ width: "100%" }}>
            <ListItem
              disablePadding
              secondaryAction={<SvgChevronRight />}
              sx={{ borderBottom: "1px solid #58585A" }}
            >
              <ListItemButton
                component="button"
                onClick={() => navigate("/wlan")}
                sx={{ padding: "20px" }}
              >
                <ListItemIcon sx={{ color: "success.main", fontSize: 16 }}>
                  {connection?.connected ? <SvgCheckChecked /> : <SvgCheck />}
                </ListItemIcon>
                <ListItemText primary="Configure Wi-Fi" />
              </ListItemButton>
            </ListItem>
            {factoryNameInfo?.registrationComplete ? (
              <ListItem
                disablePadding
                disabled
                sx={{
                  padding: "20px",
                  opacity: 0.5,
                }}
              >
                <ListItemIcon>
                  <SvgCheckChecked
                    sx={{
                      color: "success.main",
                    }}
                  />
                </ListItemIcon>
                <ListItemText primary="Register Factory name" />
              </ListItem>
            ) : (
              <ListItem disablePadding secondaryAction={<SvgChevronRight />}>
                <ListItemButton
                  component="button"
                  onClick={() => navigate("/factory")}
                  sx={{ padding: "20px" }}
                >
                  <ListItemIcon sx={{ fontSize: 16 }}>
                    {factoryNameInfo?.authenticationPending === true ? (
                      <SvgCheckChecked
                        sx={{
                          color: "warning.main",
                        }}
                      />
                    ) : (
                      <SvgCheck />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Register Factory name" />
                </ListItemButton>
              </ListItem>
            )}
            <ListItem disablePadding secondaryAction={<SvgChevronRight />}>
              <ListItemButton
                component="button"
                onClick={() =>
                  navigate(
                    isRegisteredToIoTCloud
                      ? "/iot-cloud/registration"
                      : "/iot-cloud/setup"
                  )
                }
                sx={{ padding: "20px" }}
              >
                <ListItemIcon sx={{ fontSize: 16 }}>
                  {isRegisteredToIoTCloud ? (
                    <SvgCheckChecked
                      sx={{
                        color: "success.main",
                      }}
                    />
                  ) : (
                    <SvgCheck />
                  )}
                </ListItemIcon>
                <ListItemText primary="Setup device with Arduino Cloud" />
              </ListItemButton>
            </ListItem>
          </List> */}
          <LandingCard
            to={"/iot-cloud/setup"}
            title="Arduino Cloud"
            description="Manage your connected device with IoT Things and Dashboards"
            icon={<SvgCloud />}
            plan="entry plan"
            tooltip={
              <Fragment>
                <b>{"Cloud Entry Plan Required"}</b>
                <p>
                  {
                    "The integration with Arduino Cloud requires an Arduino Cloud Plan with APIs. Subscribe or learn more about the different plans"
                  }
                </p>
                <a href="">{"EXPLORE ARDUINO PLANS"}</a>
              </Fragment>
            }
          />
          <LandingCard
            to={"/iot-cloud/setup"}
            title="PORTENTA X8 MANAGER"
            description="Start to securely update your Linux containers distribution"
            icon={<SvgLinux />}
            plan="ENTERPRISE PLAN"
            tooltip={
              <Fragment>
                <b>{"Cloud Enterprise Plan Required"}</b>
                <p>
                  {
                    "The secure Linux OS update requires an active Arduino Cloud Enteprise Plan with Portenta X8 Board Manager add-on, learn more on the "
                  }
                  <a href="">{"Arduino Pro Page"}</a>
                </p>
                <a href="">{"GO TO ENTERPRISE PLAN "}</a>
              </Fragment>
            }
          />
          <LandingCard
            to={"/shell"}
            title="Shell"
            description="Communicate with your Portenta X8 Through the Terminal, via cable or SSH"
            icon={<SvgShell />}
          />
          <LandingCard
            to={"/wlan"}
            title="WIFI SETTINGS"
            description="Configure the WiFi network to which the device will connect"
            icon={<SvgSettings />}
          />
        </Box>
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const Landing = React.memo(LandingComponent);
