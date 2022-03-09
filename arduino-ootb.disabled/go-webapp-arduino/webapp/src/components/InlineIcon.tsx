import React from "react";
import Box, { BoxProps } from "@mui/material/Box";

function InlineIconComponent(props: BoxProps) {
  const { children } = props;
  return (
    <Box
      className="Oob-InlineIcon"
      sx={{
        display: "inline-flex",
        alignSelf: "center",
        ...props.sx,
      }}
    >
      {children}
    </Box>
  );
}

export const InlineIcon = React.memo(InlineIconComponent);
