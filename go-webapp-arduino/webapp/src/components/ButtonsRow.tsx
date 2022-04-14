import React from "react";
import Box from "@mui/material/Box";
import { mobileMQ } from "../theme";

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
        paddingBottom: 2,
        flexDirection: {
          xs: "column",
          sm: "row",
        },
        ".MuiButton-root": {
          marginX: {
            xs: "auto",
            md: 0,
          },
          "&:nth-child(2)": {
            marginLeft: {
              xs: "auto",
              md: 3,
            },
          },
        },
        [mobileMQ]: {
          paddingTop: 4,
        },
      }}
    >
      {children}
    </Box>
  );
}

export const ButtonsRow = React.memo(ButtonsRowComponent);
