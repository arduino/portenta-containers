import React from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { BackTitle } from "../../BackTitle";
import { ButtonsRow } from "../../ButtonsRow";
import { PageBox } from "../../PageBox";

interface SetupCompletedComponentProps {
  deviceName: string;
  thingId: string;
}

function SetupCompletedComponent(props: SetupCompletedComponentProps) {
  const { deviceName, thingId } = props;

  return (
    <>
      <PageBox>
        <BackTitle
          back="/"
          title={
            <span>
              <b>{"Arduino Cloud"}</b>
              {" setup completed"}
            </span>
          }
          subtitle="Your device is now ready to be used on Arduino IoT Cloud. "
        />
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
              {`We have created for you a new `}
              <a
                href={(
                  import.meta.env.VITE_ARDUINO_IOT_CLOUD_THING ?? ""
                ).replace("THING_ID", thingId)}
                target="_blank"
                rel="noreferrer"
              >
                {"IoT Thing"}
              </a>
              {" called "}
              <code>{deviceName}</code>
              {
                ", with a template project in it and already connected to your Portenta X8."
              }
            </Typography>
            <Box
              component="a"
              href={import.meta.env.VITE_ARDUINO_IOT_CLOUD_THINGS_HELP}
              target="_blank"
              rel="noreferrer"
              sx={{ marginTop: 4, display: "block" }}
            >
              {"Want to know more?"}
            </Box>
          </Box>
        </Box>
        <ButtonsRow>
          <Button variant="outlined" component={Link} to="/">
            {"Home"}
          </Button>
          <Button
            variant="contained"
            component="a"
            href={import.meta.env.VITE_ARDUINO_IOT_CLOUD_THINGS}
          >
            {"GO TO ARDUINO CLOUD"}
          </Button>
        </ButtonsRow>
      </PageBox>
    </>
  );
}

export const SetupCompleted = React.memo(SetupCompletedComponent);
