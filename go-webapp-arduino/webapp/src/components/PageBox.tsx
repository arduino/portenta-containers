import React from "react";
import Box from "@mui/material/Box";
import { BoxProps } from "@mui/system";
import { mobileMQ } from "../theme";

function PageBoxComponent(props: BoxProps & { maxWidth?: number }) {
  const { children, maxWidth, ...otherProps } = props;

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
        overflowY: "auto",
        overflowX: "hidden",
        [mobileMQ]: {
          paddingX: 2,
        },
        ...otherProps.sx,
      }}
    >
      <Box
        component="main"
        sx={{
          maxWidth: maxWidth ?? 600,
          width: "100%",
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: 0,
          maxHeight: 500,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export const PageBox = React.memo(PageBoxComponent);
