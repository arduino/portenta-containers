import React from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useReadFactoryNameQuery } from "../../../services/factory";
import { BackTitle } from "../../BackTitle";
import { ButtonsRow } from "../../ButtonsRow";
import { PageBox } from "../../PageBox";

interface SetupCompletedComponentProps {
  deviceName: string;
}

function SetupCompletedComponent(props: SetupCompletedComponentProps) {
  const { deviceName } = props;

  const { data: factoryNameInfo } = useReadFactoryNameQuery(undefined);

  return (
    <>
      <BackTitle back="/" title="Setup completed!" />
      <PageBox>
        <Box
          sx={{
            marginX: "auto",
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Box sx={{ maxWidth: 500, marginX: "auto" }}>
            <Typography>
              {`Your `}
              <code>
                {factoryNameInfo?.factoryName === "" ? "Portenta X8" : ""}
              </code>
              {` is now available in your Arduino Cloud as `}
              <code>{deviceName}</code>
              {` and you can start creating your `}
              <a
                href={import.meta.env.VITE_ARDUINO_IOT_CLOUD_THINGS}
                target="_blank"
                rel="noreferrer"
              >
                {"Things"}
              </a>
              {`.`}
            </Typography>
            <Box
              component="a"
              href={import.meta.env.VITE_ARDUINO_IOT_CLOUD_API_KEYS_HELP}
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
