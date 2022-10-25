import React from "react";
import Box, { BoxProps } from "@mui/material/Box";

function CodeComponent(props: BoxProps) {
  return (
    <Box
      className="Oob-Code"
      {...props}
      sx={{
        border: (theme) => `1px solid ${theme.palette.secondary.main}`,
        borderRadius: 2,
        paddingX: 1,
        paddingY: "5px",
        display: "inline-block",
        fontFamily: "monospace",
        fontSize: "0.7em",
        marginX: 0.5,
        lineHeight: "24px",
        ...props.sx,
      }}
    />
  );
}

export const Code = React.memo(CodeComponent);
