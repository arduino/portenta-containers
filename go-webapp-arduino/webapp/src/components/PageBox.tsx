import React from "react";
import Box from "@mui/material/Box";
import { BoxProps } from "@mui/system";
import { mobileMQ } from "../theme";

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
        paddingX: 0,
        paddingBottom: 2,
        [mobileMQ]: {
          paddingX: 2,
          paddingBottom: "78px",
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
