import React from "react";
import Box from "@mui/material/Box";
import Button, { ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
  loadingChildren?: ButtonProps["children"];
}

function LoadingButtonComponent(props: LoadingButtonProps) {
  const { loading, loadingChildren, children, ...buttonProps } = props;
  return (
    <Button
      variant="contained"
      color="secondary"
      size="large"
      startIcon={
        <Box
          component="span"
          sx={(theme) => ({
            maxWidth: loading ? 24 : 0,
            maxHeight: loading ? 24 : 0,
            width: 24,
            height: 24,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            opacity: loading ? 1 : 0,
            transition: theme.transitions.create([
              "opacity",
              "max-height",
              "max-width",
            ]),
          })}
        >
          <CircularProgress color="primary" size="100%" />
        </Box>
      }
      sx={(theme) => ({
        marginLeft: "auto",
        marginTop: "auto",
        transition: theme.transitions.create("width"),
      })}
      {...buttonProps}
    >
      {loading ? loadingChildren ?? children : children}
    </Button>
  );
}

export const LoadingButton = React.memo(LoadingButtonComponent);
