import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { BackTitle } from "../../BackTitle";
import { PageBox } from "../../PageBox";

interface SetupCompletedComponentProps {
  deviceName: string;
}

function SetupCompletedComponent(props: SetupCompletedComponentProps) {
  const { deviceName } = props;

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
          <Typography>
            {`Your PORTENTA_X8 is now available in your Arduino Cloud as ${deviceName} and you can start creating your Things.Want to know more?`}
          </Typography>
        </Box>
      </PageBox>
    </>
  );
}

export const SetupCompleted = React.memo(SetupCompletedComponent);
