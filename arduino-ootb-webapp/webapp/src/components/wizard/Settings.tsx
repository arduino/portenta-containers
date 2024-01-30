import React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { SvgChevronRight } from "../../assets/ChevronRight";
import SvgEthernet from "../../assets/Ethernet";
import SvgLte from "../../assets/Lte";
import { SvgWifi } from "../../assets/Wifi";
import { BackTitle } from "../BackTitle";
import { DeviceStatus } from "../DeviceStatus";
import { PageBox } from "../PageBox";

interface SettingsProps {}

function SettingsComponent(props: SettingsProps) {
  // const {} = props;
  const navigate = useNavigate();

  return (
    <>
      <PageBox>
        <BackTitle back=".." title="Settings" />
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
          <List sx={{ width: "100%" }}>
            <ListItem
              disablePadding
              secondaryAction={<SvgChevronRight />}
              sx={{ borderBottom: "1px solid #58585A" }}
            >
              <ListItemButton
                component="button"
                onClick={() => navigate("/settings/wlan")}
                sx={{ padding: "20px" }}
              >
                <ListItemIcon sx={{ fontSize: 16 }}>
                  <SvgWifi signal={100} />
                </ListItemIcon>
                <ListItemText primary="WiFi Network" />
              </ListItemButton>
            </ListItem>
            <ListItem
              disablePadding
              secondaryAction={<SvgChevronRight />}
              sx={{ borderBottom: "1px solid #58585A" }}
            >
              <ListItemButton
                component="button"
                onClick={() => navigate("/settings/lte")}
                sx={{ padding: "20px" }}
              >
                <ListItemIcon>
                  <SvgLte />
                </ListItemIcon>
                <ListItemText primary="LTE/4G SIM" />
              </ListItemButton>
            </ListItem>
            <ListItem
              disablePadding
              secondaryAction={<SvgChevronRight />}
              sx={{ borderBottom: "1px solid #58585A" }}
            >
              <ListItemButton
                component="button"
                onClick={() => navigate("/settings/ethernet")}
                sx={{ padding: "20px" }}
              >
                <ListItemIcon>
                  <SvgEthernet />
                </ListItemIcon>
                <ListItemText primary="Ethernet network" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const Settings = React.memo(SettingsComponent);
