import React from "react";
import Box from "@mui/material/Box";
import { BoxProps } from "@mui/system";

function CodeComponent(props: BoxProps) {
  return (
    <Box
      sx={{
        border: (theme) => `1px solid ${theme.palette.secondary.main}`,
        borderRadius: 2,
        paddingX: 1,
        paddingY: "5px",
        display: "inline-block",
        fontFamily: "monospace",
        fontSize: "0.7em",
        marginX: 0.5,
      }}
      {...props}
    />
  );
}

export const Code = React.memo(CodeComponent);
