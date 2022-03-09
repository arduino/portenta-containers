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
      dark: "#C11F09",
    },
    warning: {
      main: "#F1C40F",
    },
    success: {
      main: "#1DA086",
    },
  },
  shape: {
    borderRadius: 3,
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
      fontSize: "20px",
    },
  },
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          left: "10px",
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
          paddingLeft: "20px",
          paddingRight: "20px",
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
    MuiAutocomplete: {
      styleOverrides: {
        inputRoot: {
          paddingLeft: "20px",
          paddingRight: "20px",
        },
        input: {
          "&.MuiFilledInput-input": {
            paddingLeft: 0,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: "21px",
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
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: "2px",
        },
        root: {
          fontFamily: "Roboto mono",
          borderRadius: "32px",
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
            paddingLeft: 0,
            paddingRight: 0,
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
    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      },
      styleOverrides: {
        root: {
          ".MuiPaper-root": {
            height: 35,
            minWidth: 588,
          },
          ".MuiAlert-message,.MuiAlert-icon,.MuiAlert-action": {
            padding: 0.5,
          },
          ".MuiAlert-message": {
            flex: "1 1 auto",
            display: "flex",
            justifyContent: "space-between",
          },
          ".MuiAlert-action": {
            marginLeft: 0,
          },
          ".MuiAlert-action .MuiButtonBase-root": {
            paddingTop: 0,
            paddingBottom: 0,
            color: "#000",
          },
          ".MuiAlert-standardError": {
            backgroundColor: "#F9E9E6",
            color: "#DA5B4A",
            fontWeight: "bold",
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: "1em",
        },
      },
    },
  },
};

export const arduinoProTheme = createTheme(arduinoProThemeOptions);
