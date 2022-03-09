import React from "react";
import Box from "@mui/material/Box";
import { InlineIcon } from "./InlineIcon";

interface TooltipIconProps {
  backgroundColor?: string;
  icon: React.ReactNode;
  tooltip: string | React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function TooltipIconComponent(props: TooltipIconProps) {
  const { backgroundColor, icon, tooltip, onClick } = props;
  return (
    <Box
      sx={{
        display: "inline-flex",
        marginLeft: 2,
        color: "inherit",
        "&:hover": {
          ".tooltip": {
            opacity: 1,
          },
        },
      }}
    >
      <InlineIcon>{icon}</InlineIcon>
      <Box
        sx={{
          position: "relative",
          marginLeft: "-1em",
          ">.MuiBox-root": {
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            backgroundColor: backgroundColor ?? "#2F2F2F",
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            border: 0,
            padding: 0,
            color: "secondary.main",
            fontWeight: 700,
            fontFamily: "Roboto Mono",
            fontSize: "14px",
            whiteSpace: "nowrap",
            transition: (theme) =>
              theme.transitions.create(["opacity"], { duration: 200 }),
          },
        }}
      >
        <Box
          className="tooltip"
          component="button"
          onClick={onClick}
          sx={{
            zIndex: 100,
            opacity: 0,
            ".Oob-InlineIcon": {
              marginRight: 1,
            },
          }}
        >
          <InlineIcon>{icon}</InlineIcon>
          {tooltip}
        </Box>
      </Box>
    </Box>
  );
}

export const TooltipIcon = React.memo(TooltipIconComponent);
