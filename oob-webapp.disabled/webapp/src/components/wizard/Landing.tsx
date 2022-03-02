import React from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import checkChecked from "../../assets/check-checked.svg";
import check from "../../assets/check.svg";
import chevronRight from "../../assets/chevron-right.svg";
import { useFactoryName } from "../../hooks/query/factory";
import { useBoardHostname } from "../../hooks/query/useBoard";
import { useConnection } from "../../hooks/query/useNetworkList";
import { DeviceStatus } from "../DeviceStatus/DeviceStatus";
import { PageBox } from "../PageBox";

function LandingComponent() {
  const { data: connection } = useConnection();
  const { data: factoryNameInfo } = useFactoryName();
  const { data: hostname } = useBoardHostname();

  return (
    <>
      <PageBox>
        <Typography variant="h3" component="h1">
          Welcome to the <b>Arduino Portenta X8</b>
        </Typography>
        <Typography variant="h4">Setup your board to get started</Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 9,
            width: "100%",
          }}
        >
          <List sx={{ width: "100%" }}>
            <ListItem
              disablePadding
              secondaryAction={<img src={chevronRight} />}
              sx={{ borderBottom: "1px solid #58585A" }}
            >
              <ListItemButton
                component={Link}
                to="/hostname"
                sx={{ padding: "20px" }}
              >
                <ListItemIcon>
                  <img src={hostname?.hostname ? checkChecked : check} />
                </ListItemIcon>
                <ListItemText primary="Assign an Hostname" />
              </ListItemButton>
            </ListItem>
            <ListItem
              disablePadding
              secondaryAction={<img src={chevronRight} />}
              sx={{ borderBottom: "1px solid #58585A" }}
            >
              <ListItemButton
                component={Link}
                to="/wlan"
                sx={{ padding: "20px" }}
              >
                <ListItemIcon>
                  <img src={connection?.connected ? checkChecked : check} />
                </ListItemIcon>
                <ListItemText primary="Configure Wi-Fi" />
              </ListItemButton>
            </ListItem>
            {factoryNameInfo?.deviceName ? (
              <ListItem disablePadding sx={{ padding: "20px" }}>
                <ListItemIcon>
                  <img src={checkChecked} />
                </ListItemIcon>
                <ListItemText primary="Register Factory name" />
              </ListItem>
            ) : (
              <ListItem
                disablePadding
                secondaryAction={<img src={chevronRight} />}
              >
                <ListItemButton
                  component={Link}
                  to="/factory"
                  sx={{ padding: "20px" }}
                >
                  <ListItemIcon>
                    <img src={check} />
                  </ListItemIcon>
                  <ListItemText primary="Register Factory name" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const Landing = React.memo(LandingComponent);
