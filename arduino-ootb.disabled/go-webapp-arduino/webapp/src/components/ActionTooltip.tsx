import React from "react";
import Box from "@mui/material/Box";
import { InlineIcon } from "./InlineIcon";

interface ActionTooltipProps {
  backgroundColor?: string;
  children: React.ReactNode | React.ReactNode[];
  icon: React.ReactNode;
  tooltipText: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function ActionTooltipComponent(props: ActionTooltipProps) {
  const { children, backgroundColor, icon, tooltipText, onClick } = props;
  return (
    <Box
      sx={{
        display: "flex",
        "&:hover": {
          ".tooltip": {
            opacity: 1,
          },
        },
      }}
    >
      {children}
      <Box
        sx={{
          position: "relative",
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
          }}
        >
          <InlineIcon>{icon}</InlineIcon>
          {tooltipText}
        </Box>
      </Box>
    </Box>
  );
}

export const ActionTooltip = React.memo(ActionTooltipComponent);
