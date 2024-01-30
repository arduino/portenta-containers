import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card, { CardProps } from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import SvgCloud from "../../../assets/Cloud";
import SvgInfo from "../../../assets/Info";
import SvgLinux from "../../../assets/Linux";
import SvgSettings from "../../../assets/Settings";
import SvgShell from "../../../assets/Shell";
import { useDeviceConnectionStatus } from "../../../hooks/useDeviceConnected";
import { ArduinoProAlert } from "../../ArduinoProAlert";
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
  external?: boolean;
}

function LandingCard(props: LandingCardProps) {
  const { to, external, icon, title, plan, description, tooltip } = props;

  const actionArea = (
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
          <Tooltip
            title={
              <Box
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
              >
                {tooltip}
              </Box>
            }
          >
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
  );

  const cardProps: CardProps = {
    elevation: 4,
    sx: { maxWidth: 260, minWidth: 260, marginX: 2, marginBottom: 2 },
  };

  if (external) {
    return (
      <Card component="a" href={to} target="_blank" {...cardProps}>
        {actionArea}
      </Card>
    );
  }

  return (
    <Card component={Link} to={to} {...cardProps}>
      {actionArea}
    </Card>
  );
}

function LandingComponent() {
  const {
    configured: networkConfigured,
    connected: nerworkConnected,
    isLoading,
  } = useDeviceConnectionStatus();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          paddingBottom: "15vh",
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (!networkConfigured) {
    return <OfflineLanding />;
  }

  return (
    <>
      <ArduinoProAlert
        button={
          <Button component={Link} to="/wlan" variant="text" size="small">
            {"Configure WiFi"}
          </Button>
        }
        message="Connection lost. Use an ethernet cable or choose a network"
        open={!nerworkConnected}
        severity="error"
      />
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
            paddingY: 5,
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
                <a href={import.meta.env.VITE_ARDUINO_PLANS}>
                  {"EXPLORE ARDUINO PLANS"}
                </a>
              </Fragment>
            }
          />
          <LandingCard
            to={"/factory"}
            title="PORTENTA X8 MANAGER"
            description="Security updates and remote fleet management"
            icon={<SvgLinux />}
            plan="ENTERPRISE PLAN"
            tooltip={
              <Fragment>
                <b>{"Cloud Enterprise Plan Required"}</b>
                <p>
                  {
                    "The secure Linux OS update requires an active Arduino Cloud Enteprise Plan with Portenta X8 Board Manager add-on, learn more on the "
                  }
                  <a href={import.meta.env.VITE_ARDUINO_PRO}>
                    {"Arduino Pro Page"}
                  </a>
                </p>
                <a href={import.meta.env.VITE_ARDUINO_PLANS_ENTERPRISE}>
                  {"GO TO ENTERPRISE PLAN "}
                </a>
              </Fragment>
            }
          />
          <LandingCard
            to={"/shell"}
            title="Shell"
            description="Open a shell in the python devel container"
            icon={<SvgShell />}
          />
          <LandingCard
            to={"/wlan"}
            title="WIFI SETTINGS"
            description="Connect to a WiFi network"
            icon={<SvgSettings />}
          />
        </Box>
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const Landing = React.memo(LandingComponent);
