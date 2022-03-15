import React, { useRef } from "react";
import Box from "@mui/material/Box";

interface TooltipIconProps {
  backgroundColor?: string;
  icon: React.ReactNode;
  tooltip: string | React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  target?: string;
  rel?: string;
}

function TooltipIconComponent(props: TooltipIconProps) {
  const { backgroundColor, icon, tooltip, onClick } = props;
  const buttonRef = useRef<HTMLAnchorElement | HTMLButtonElement>();
  return (
    <Box
      sx={{
        minWidth: "22px",
        width: "22px",
        height: "1em",
        marginLeft: "-1em",
      }}
    >
      <Box
        component={props.href ? "a" : "button"}
        href={props.href}
        rel={props.rel}
        target={props.target}
        ref={buttonRef}
        onClick={onClick}
        sx={{
          color: "inherit",
          backgroundColor: "transparent",
          border: 0,
          padding: 0,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          paddingX: 1,
          cursor: "pointer",
          svg: {
            transition: (theme) =>
              theme.transitions.create(["color"], { duration: 200 }),
          },
          "&:hover,&:focus": {
            ".tooltip": {
              opacity: 1,
            },
            svg: {
              color: "secondary.main",
            },
          },
        }}
      >
        {icon}
        <Box
          component="span"
          sx={{
            marginLeft: "-1em",
            ">.MuiBox-root": {
              display: "flex",
              alignItems: "center",
              backgroundColor: backgroundColor ?? "#2F2F2F",
              marginLeft: 3,
              top: "0.5em",
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
            onMouseLeave={() => buttonRef.current && buttonRef.current.blur()}
            sx={{
              zIndex: 100,
              opacity: 0,
              ".Oob-InlineIcon": {
                marginRight: 1,
              },
            }}
          >
            {tooltip}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export const TooltipIcon = React.memo(TooltipIconComponent);
