import React from "react";
import Box from "@mui/material/Box";

interface ButtonsRowProps {
  children: React.ReactNode | React.ReactNode[];
}

function ButtonsRowComponent(props: ButtonsRowProps) {
  const { children } = props;
  return (
    <Box
      sx={{
        marginTop: "auto",
        paddingTop: 8,
        display: "flex",
        justifyContent: "flex-end",
        flexDirection: {
          xs: "column",
          sm: "row",
        },
        ".MuiButton-root": {
          marginX: {
            xs: "auto",
            md: 0,
          },
          marginLeft: {
            xs: 0,
            md: 2,
          },
          marginBottom: 2,
        },
      }}
    >
      {children}
    </Box>
  );
}

export const ButtonsRow = React.memo(ButtonsRowComponent);
