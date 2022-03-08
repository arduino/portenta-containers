import React from "react";
import Box from "@mui/material/Box";
import { BoxProps } from "@mui/system";

function PageBoxComponent(props: BoxProps) {
  const { children, ...otherProps } = props;

  return (
    <Box
      {...otherProps}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "1 1 auto",
        ...otherProps.sx,
      }}
    >
      <Box
        sx={{
          width: 600,
          minHeight: 468,
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export const PageBox = React.memo(PageBoxComponent);
