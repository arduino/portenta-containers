import React from "react";
import Box, { BoxProps } from "@mui/material/Box";
import Paper, { PaperProps } from "@mui/material/Paper";
import { PopperProps } from "@mui/material/Popper";

export function autocompleteProps<T>(
  options: T[],
  ActionOption?: React.ReactNode,
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: T,
  ) => React.ReactNode,
  sx?: BoxProps["sx"],
) {
  const props = {
    openOnFocus: true,
    PaperComponent: (props: PaperProps) => (
      <Paper
        {...props}
        sx={{
          borderRadius: 0,
          background: "#111111",
          minHeight: "1px",
          ".MuiAutocomplete-noOptions": {
            backgroundColor: "primary.main",
            fontSize: 14,
          },
        }}
      />
    ),
    renderOption: (props: React.HTMLAttributes<HTMLLIElement>, option: T) => (
      <Box
        component="li"
        {...props}
        sx={{
          display: "flex",
          alignItems: "baseline",
          backgroundColor: "primary.main",
          marginBottom: 0,
          borderRadius: 0,
          fontSize: 14,
          "&.MuiAutocomplete-option.Mui-focused": {
            backgroundColor: "primary.main",
          },
          ":hover": {
            backgroundColor: "rgba(255,255,255,0.2) !important",
          },
          "&.MuiAutocomplete-option": {
            paddingX: "20px",
          },
        }}
      >
        {renderOption ? renderOption(props, option) : null}
      </Box>
    ),
    PopperComponent: (props: PopperProps) => {
      if (!props.open) {
        return null;
      }
      return (
        <Box
          sx={{
            backgroundColor: "primary.main",
            border: "1px solid",
            borderColor: "secondary.main",
            borderTop: 0,
            borderBottomLeftRadius: 3,
            borderBottomRightRadius: 3,
            position: "absolute",
            top: 56,
            left: 0,
            right: 0,
            padding: 0,
            zIndex: 1000,
            ul: {
              padding: 0,
              borderRadius: 0,
              "&:first-of-type": {
                marginTop: 1,
              },
            },
          }}
        >
          {typeof props.children === "function"
            ? props.children({
                placement: "auto",
              })
            : props.children}
          {ActionOption ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                backgroundColor: "primary.main",
                marginBottom: 0,
                color: "secondary.main",
                cursor: "pointer",
                paddingX: "20px",
                paddingY: 0.75,
                fontWeight: 700,
                fontSize: 16,
                ":hover": {
                  backgroundColor: "rgba(255,255,255,0.2) !important",
                },
              }}
            >
              {ActionOption}
            </Box>
          ) : null}
        </Box>
      );
    },
    sx: {
      // "&.Mui-focused .MuiAutocomplete-inputRoot": {
      //   borderWidth: 2,
      // },
      "&.MuiAutocomplete-noOptions": {
        backgroundColor: "primary.main",
      },
      ...sx,
    },
    options: options,
  };

  return props;
}
