import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { differenceInMilliseconds } from "date-fns";
import { z } from "zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { ButtonsRow } from "../../ButtonsRow";
import { Code } from "../../Code";
import { Copy } from "../../Copy";

export const FactoryNameFormSchema = z.object({
  name: z.string().min(1).max(64),
});

export type FactoryNameForm = z.infer<typeof FactoryNameFormSchema>;

interface CopyCodeComponentProps {
  userCode: string;
  userCodeExpiryTimestamp: string;
}

function CopyCodeComponent(props: CopyCodeComponentProps) {
  const { userCode, userCodeExpiryTimestamp } = props;
  const [codeTimeout, setCodeTimeout] = useState(
    differenceInMilliseconds(new Date(userCodeExpiryTimestamp), new Date())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCodeTimeout((t) => {
        if (t > 1000) {
          return t - 1000;
        }

        clearInterval(interval);
        return 0;
      });
    }, 1000);
  }, []);

  return (
    <>
      <Box
        sx={{
          maxWidth: 500,
          width: "100%",
          margin: "auto",
        }}
      >
        <Typography variant="body1" lineHeight="34px">
          {
            "To complete the registration of the Board with the Factory copy the following code and paste it in the Arduino Cloud Pro:"
          }
          <Box
            sx={{
              display: "inline-block",
              marginLeft: 1,
              "&:hover .Oob-Code": { backgroundColor: "#58585A" },
            }}
          >
            <Copy value={userCode}>
              <Code>{userCode}</Code>
            </Copy>
          </Box>
        </Typography>
        <Typography variant="body1" lineHeight="34px" sx={{ marginTop: 2 }}>
          {"The code will expire in "}
          <b>{Math.floor(codeTimeout / 60000)}</b>
          {" minutes"}
        </Typography>
      </Box>
      <ButtonsRow>
        <Button
          variant="outlined"
          color="secondary"
          size="large"
          component={Link}
          to="/"
          sx={{ mr: 3 }}
        >
          {"Back"}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          component="a"
          href={`${import.meta.env.VITE_ARDUINO_CLOUD_URL}`}
          rel="noopener noreferrer"
        >
          {"COMPLETE REGISTRATION"}
        </Button>
      </ButtonsRow>
    </>
  );
}

export const CopyCode = React.memo(CopyCodeComponent);
