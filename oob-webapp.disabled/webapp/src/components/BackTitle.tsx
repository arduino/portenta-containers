import React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import arrowLeft from "../assets/arrow-left.svg";
import successIcon from "../assets/success.svg";

interface BackTitleProps {
  showBack?: boolean;
  title: string;
  subtitle?: string;
  success?: boolean;
}

function BackTitleComponent(props: BackTitleProps) {
  const { showBack, title, subtitle, success } = props;

  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          mb: 0,
          textAlign: "center",
          position: "relative",
          width: 620,
          "&>img, &>button": { position: "absolute", left: 0, mt: 0.75 },
        }}
      >
        {success ? (
          <img src={successIcon} alt="" />
        ) : showBack ? (
          <Button
            color="primary"
            startIcon={
              <Box component="img" src={arrowLeft} alt="" sx={{ mr: 1 }} />
            }
            onClick={() => navigate(-1)}
          />
        ) : null}
        <Typography variant="h3" sx={{ mb: 2 }}>
          {title}
        </Typography>
      </Box>
      <Typography
        variant="h4"
        sx={{
          mt: 0,
          mb: 4,
          textAlign: "center",
        }}
      >
        {subtitle ?? ""}
      </Typography>
    </Box>
  );
}

export const BackTitle = React.memo(BackTitleComponent);
