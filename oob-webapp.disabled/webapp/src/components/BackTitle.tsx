import React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { SvgArrowLeft } from "../assets/ArrowLeft";
import { SvgSuccess } from "../assets/Success";

interface BackTitleProps {
  back?: string;
  title: string | React.ReactNode;
  subtitle?: string;
  success?: boolean;
  bold?: boolean;
}

function BackTitleComponent(props: BackTitleProps) {
  const { back, title, subtitle, success, bold } = props;

  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Box
        sx={{
          mb: 0,
          textAlign: "center",
          position: "relative",
          width: "calc(100% + 40px)",
          "&>img, &>button": { position: "absolute", left: 0, mt: 0.75 },
          marginX: "-20px",
        }}
      >
        {success ? (
          <SvgSuccess />
        ) : back ? (
          <Button
            color="primary"
            startIcon={<SvgArrowLeft />}
            onClick={() => navigate(back)}
          />
        ) : null}
        <Typography variant="h3" sx={{ mb: 2, fontWeight: bold ? 700 : 400 }}>
          {title}
        </Typography>
      </Box>
      <Typography
        variant="h4"
        sx={{
          mt: 0,
          mb: 2,
          textAlign: "center",
        }}
      >
        {subtitle ?? ""}
      </Typography>
    </Box>
  );
}

export const BackTitle = React.memo(BackTitleComponent);
