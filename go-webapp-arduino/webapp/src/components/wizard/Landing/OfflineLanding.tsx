import React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import { SvgChevronRight } from "../../../assets/ChevronRight";
import SvgEthernet from "../../../assets/Ethernet";
import SvgOffline from "../../../assets/Offline";
import { SvgWifi } from "../../../assets/Wifi";
import { DeviceStatus } from "../../DeviceStatus/DeviceStatus";
import { PageBox } from "../../PageBox";

function OfflineLandingComponent() {
  const navigate = useNavigate();

  return (
    <>
      <PageBox>
        <Typography variant="h1" textAlign="center" sx={{ marginBottom: 2 }}>
          Welcome to the <b>Arduino Portenta X8</b>
        </Typography>
        <Typography variant="h2" sx={{ marginBottom: 3 }}>
          Choose connectivity to start using your device
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            flex: "1 1 auto",
            alignItems: "center",
          }}
        >
          <List sx={{ width: "100%" }}>
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
                <ListItemIcon sx={{ fontSize: 32, marginRight: "10px" }}>
                  <SvgWifi signal={100} />
                </ListItemIcon>
                <ListItemText primary="WiFi Connection" />
              </ListItemButton>
            </ListItem>
            <ListItem
              disablePadding
              secondaryAction={<SvgChevronRight />}
              sx={{ borderBottom: "1px solid #58585A" }}
            >
              <ListItemButton
                component="button"
                onClick={() => navigate("/ethernet")}
                sx={{ padding: "20px" }}
              >
                <ListItemIcon sx={{ fontSize: 32, marginRight: "10px" }}>
                  <SvgEthernet />
                </ListItemIcon>
                <ListItemText primary="Ethernet Connection" />
              </ListItemButton>
            </ListItem>
            <ListItem
              disablePadding
              secondaryAction={<SvgChevronRight />}
              sx={{ borderBottom: "1px solid #58585A" }}
            >
              <ListItemButton
                component="button"
                onClick={() => navigate("/shell")}
                sx={{ padding: "20px" }}
              >
                <ListItemIcon sx={{ fontSize: 32, marginRight: "10px" }}>
                  <SvgOffline />
                </ListItemIcon>
                <ListItemText primary="Use locally (Shell only)" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const OfflineLanding = React.memo(OfflineLandingComponent);
