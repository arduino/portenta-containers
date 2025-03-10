import React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { SvgArrowLeft } from "../assets/ArrowLeft";
import { SvgSuccess } from "../assets/Success";
import { InlineIcon } from "./InlineIcon";

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
          marginBottom: 0,
          textAlign: "center",
          position: "relative",
          width: "calc(100% + 40px)",
          marginX: "-20px",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            height: "100%",
            left: 0,
            top: "0.3em",
          }}
        >
          {back && !success ? (
            <Button
              color="primary"
              size="large"
              onClick={() => navigate(back)}
              sx={{ paddingY: 0.5 }}
            >
              {<SvgArrowLeft sx={{ fontSize: "1.5em" }} />}
            </Button>
          ) : null}
        </Box>
        <Typography
          variant="h1"
          sx={{
            marginBottom: 2,
            fontWeight: bold ? 700 : 400,
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {success ? (
            <InlineIcon>
              <SvgSuccess sx={{ color: "success.main", marginRight: 1 }} />
            </InlineIcon>
          ) : null}
          {title}
        </Typography>
      </Box>
      <Box>
        {subtitle && subtitle !== "" ? (
          <Typography
            variant="h2"
            sx={{
              marginTop: 0,
              marginBottom: 2,
              textAlign: "center",
              maxWidth: 600,
              marginX: "auto",
            }}
          >
            {subtitle ?? ""}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

export const BackTitle = React.memo(BackTitleComponent);
