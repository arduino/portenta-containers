import React from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { ButtonsRow } from "../../ButtonsRow";

function CodeExpiredComponent() {
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
            "Your code is expired: create a new one and paste it on the Arduino Cloud Pro to complete the registration of the Board with the Factory."
          }
        </Typography>
      </Box>
      <ButtonsRow>
        <Button
          variant="outlined"
          color="secondary"
          size="large"
          component={Link}
          to="/"
          sx={{ marginRight: 3 }}
        >
          {"Home"}
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

export const CodeExpired = React.memo(CodeExpiredComponent);
