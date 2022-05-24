import React from "react";
import { Link } from "react-router-dom";
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
  userCodeExpiresIn: number;
}

function CopyCodeComponent(props: CopyCodeComponentProps) {
  const { userCode, userCodeExpiresIn } = props;
  // const [_, setI] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setI((i) => i + 1);
  //   }, 1000);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

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
              display: "inline-flex",
              marginLeft: 1,
              "&:hover .Oob-Code": { backgroundColor: "#58585A" },
              "&.MuiBox-root .copy": {
                left: "100%",
                top: "50%",
                transform: "translateY(-50%)",
              },
            }}
          >
            <Copy value={userCode}>
              <Code>{userCode}</Code>
            </Copy>
          </Box>
        </Typography>
        <Typography variant="body1" lineHeight="34px" sx={{ marginTop: 2 }}>
          {"The code will expire in "}
          <b>{Math.ceil(userCodeExpiresIn / 60)}</b>
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
          href={`${import.meta.env.VITE_FOUNDRIES_BOARD_REG}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {"COMPLETE REGISTRATION"}
        </Button>
      </ButtonsRow>
    </>
  );
}

export const CopyCode = React.memo(CopyCodeComponent);
