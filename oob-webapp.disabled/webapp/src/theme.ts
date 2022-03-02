import { createTheme, ThemeOptions } from "@mui/material/styles";
import "@fontsource/open-sans";
import "@fontsource/roboto-mono";

const pro = "#111111";
const eLime = "#DEF154";
const errorMain = "#DA5B4A";
const fog = "#DAE3E3";

export const arduinoProThemeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: pro,
    },
    secondary: {
      main: eLime,
    },
    mode: "dark",
    error: {
      main: errorMain,
    },
    warning: {
      main: "#F1C40F",
    },
    success: {
      main: "#1DA086",
    },
  },
  typography: {
    fontFamily: "Open Sans",
    h3: {
      fontSize: 28,
      lineHeight: "48px",
    },
    h4: {
      fontSize: 20,
      lineHeight: "34px",
    },
    body1: {
      letterSpacing: "1px",
    },
  },
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          left: 8,
          "&.MuiInputLabel-shrink": {
            color: "#fff",
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          border: "1px solid",
          borderRadius: 3,
          borderColor: "#B2B2B2",
          backgroundColor: pro,
          "&:before": {
            display: "none",
          },
          "&:after": {
            display: "none",
          },
          "&.Mui-focused": {
            borderColor: eLime,
            backgroundColor: pro,
          },
          "&:hover": {
            backgroundColor: pro,
          },
          "&.MuiInputBase-input": {
            paddingLeft: 12,
          },
          "&.Mui-error": {
            borderColor: errorMain,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 0,
          color: fog,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        color: "secondary",
      },
      styleOverrides: {
        sizeLarge: {
          fontSize: 20,
          letterSpacing: "2px",
        },
        root: {
          fontFamily: "Roboto mono",
          borderRadius: "32px",
          fontWeight: 400,
          fontSize: 16,
          letterSpacing: "12%",
          padding: "5px 20px",
        },
        contained: {
          "&.MuiButton-containedSecondary.Mui-disabled": {
            backgroundColor: eLime,
            color: pro,
            opacity: 0.5,
          },
        },
        outlined: {
          "&,&:hover": {
            borderWidth: "1.5px",
          },
        },
        text: {
          "&.MuiButton-textPrimary": {
            color: "#fff",
          },
          "&:hover": {
            background: "transparent",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          right: 19,
        },
        filled: {
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          ".MuiInputBase-input": {
            paddingLeft: 20,
            paddingRight: 20,
          },
        },
      },
    },
    MuiCircularProgress: {
      defaultProps: {
        disableShrink: true,
        thickness: 4.8,
      },
    },
  },
};

export const arduinoProTheme = createTheme(arduinoProThemeOptions);
