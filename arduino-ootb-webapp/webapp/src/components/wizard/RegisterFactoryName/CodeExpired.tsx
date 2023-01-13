import React from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useDeleteRequestMutation } from "../../../services/factory";
import { ButtonsRow } from "../../ButtonsRow";
import { LoadingButton } from "../../LoadingButton";

function CodeExpiredComponent() {
  const [deleteRequest, deleteRequestRequest] = useDeleteRequestMutation();

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
        <LoadingButton
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => deleteRequest("")}
          loading={deleteRequestRequest.isLoading}
        >
          {"Generate a new code"}
        </LoadingButton>
      </ButtonsRow>
    </>
  );
}

export const CodeExpired = React.memo(CodeExpiredComponent);
