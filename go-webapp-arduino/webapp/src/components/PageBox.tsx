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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        paddingX: {
          xs: 2,
          md: 0,
        },
        paddingBottom: {
          xs: "78px",
          md: 2,
        },
        ...otherProps.sx,
      }}
    >
      <Box
        component="main"
        sx={{
          maxWidth: 600,
          width: "100%",
          flex: "0 1 480px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export const PageBox = React.memo(PageBoxComponent);
