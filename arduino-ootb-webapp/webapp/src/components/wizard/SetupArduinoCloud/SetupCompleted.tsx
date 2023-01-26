import React from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { SvgShellIcon } from "../../../assets/ShellIcon";
import { BackTitle } from "../../BackTitle";
import { ButtonsRow } from "../../ButtonsRow";
import { PageBox } from "../../PageBox";
import { CopyShellCode } from "./CopyShellCode";

interface SetupCompletedComponentProps {
  deviceId: string;
  deviceName: string;
  thingId: string;
  thingName: string;
  dashboardId: string;
  dashboardName: string;
}

function SetupCompletedComponent(props: SetupCompletedComponentProps) {
  const {
    deviceId,
    deviceName,
    dashboardId,
    dashboardName,
    thingId,
    thingName,
  } = props;

  return (
    <>
      <PageBox>
        <BackTitle
          back="/"
          title={
            <span>
              <b>{"Arduino Cloud"}</b>
              {" setup completed!"}
            </span>
          }
        />
        <Box sx={{ paddingX: 1.5, textAlign: "center" }}>
          {"The device "}
          <Box
            component="a"
            href={(import.meta.env.VITE_ARDUINO_IOT_CLOUD_DEVICE ?? "").replace(
              "DEVICE_ID",
              deviceId
            )}
            target="_blank"
            rel="noreferrer"
            sx={{ textTransform: "uppercase" }}
          >
            {`${deviceName}`}
          </Box>
          {" has been successfully setup on Arduino IoT Cloud."}
        </Box>
        <Box
          sx={{
            marginX: "auto",
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Box sx={{ marginTop: 6 }}>
            <Typography>
              {`We have created for you an example made of `}
              <Box
                component="a"
                href={(
                  import.meta.env.VITE_ARDUINO_IOT_CLOUD_THING ?? ""
                ).replace("THING_ID", thingId)}
                target="_blank"
                rel="noreferrer"
                sx={{ textTransform: "uppercase" }}
              >
                {`${thingName} thing`}
              </Box>
              {" and "}
              <Box
                component="a"
                href={(
                  import.meta.env.VITE_ARDUINO_IOT_CLOUD_DASHBOARD ?? ""
                ).replace("DASHBOARD_ID", dashboardId)}
                target="_blank"
                rel="noreferrer"
                sx={{ textTransform: "uppercase" }}
              >
                {`${dashboardName} dashboard`}
              </Box>
              {`, to get the example working copy and run the following command in the shell:`}
              <CopyShellCode
                code={"$ python3 examples/arduino_iot_cloud_example.py"}
                sx={{ marginTop: 2, width: "100%" }}
              />
            </Typography>
          </Box>
        </Box>
        <ButtonsRow>
          <Button variant="text" component={Link} to="/">
            {"Back Home"}
          </Button>
          <Button
            variant="contained"
            component={Link}
            to="/shell"
            startIcon={<SvgShellIcon />}
          >
            {"Launch example"}
          </Button>
        </ButtonsRow>
      </PageBox>
    </>
  );
}

export const SetupCompleted = React.memo(SetupCompletedComponent);
