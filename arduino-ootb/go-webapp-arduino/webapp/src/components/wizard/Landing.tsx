import React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import { SvgCheck } from "../../assets/Check";
import { SvgCheckChecked } from "../../assets/CheckChecked";
import { SvgChevronRight } from "../../assets/ChevronRight";
import { useReadHostnameQuery } from "../../services/board";
import { useReadFactoryNameQuery } from "../../services/factory";
import { useReadWlanConnectionQuery } from "../../services/networking";
import { DeviceStatus } from "../DeviceStatus/DeviceStatus";
import { PageBox } from "../PageBox";

function LandingComponent() {
  const navigate = useNavigate();
  const { data: connection } = useReadWlanConnectionQuery();
  const { data: factoryNameInfo } = useReadFactoryNameQuery();
  const { data: hostname } = useReadHostnameQuery();

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
              secondaryAction={<SvgChevronRight />}
              sx={{ borderBottom: "1px solid #58585A" }}
            >
              <ListItemButton
                component="button"
                onClick={() => navigate("/hostname")}
                sx={{ padding: "20px" }}
              >
                <ListItemIcon sx={{ color: "success.main" }}>
                  {hostname?.hostname ? <SvgCheckChecked /> : <SvgCheck />}
                </ListItemIcon>
                <ListItemText primary="Assign an Hostname" />
              </ListItemButton>
            </ListItem>
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
                <ListItemIcon sx={{ color: "success.main" }}>
                  {connection?.connected ? <SvgCheckChecked /> : <SvgCheck />}
                </ListItemIcon>
                <ListItemText primary="Configure Wi-Fi" />
              </ListItemButton>
            </ListItem>
            {factoryNameInfo?.factoryName &&
            factoryNameInfo?.registrationComplete ? (
              <ListItem
                disablePadding
                disabled={factoryNameInfo?.registrationComplete === true}
                sx={{
                  padding: "20px",
                  opacity: factoryNameInfo?.registrationComplete ? 0.5 : 1,
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
                  <ListItemIcon>
                    {factoryNameInfo?.registrationComplete === false ? (
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
          </List>
        </Box>
        <Button
          component="a"
          variant="text"
          size="large"
          href={`${import.meta.env.VITE_ARDUINO_DOCS_X8_URL}`}
          rel="noopener noreferrer"
          sx={{ marginTop: "28px" }}
        >
          GO TO DOCUMENTATION
        </Button>
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const Landing = React.memo(LandingComponent);
