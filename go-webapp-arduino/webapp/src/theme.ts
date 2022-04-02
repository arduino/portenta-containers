import { createTheme, ThemeOptions } from "@mui/material/styles";
import "@fontsource/open-sans";
import "@fontsource/roboto-mono";

const pro = "#111111";
const eLime = "#DEF154";
const errorMain = "#DA5B4A";
const errorDark = "#C11F09";
const warningMain = "#F1C40F";
const successMain = "#1DA086";
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
      dark: errorDark,
    },
    warning: {
      main: warningMain,
    },
    success: {
      main: successMain,
    },
  },
  shape: {
    borderRadius: 3,
  },
  typography: {
    fontFamily: "Open Sans",
    h1: {
      fontSize: "28px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "48px",
      letterSpacing: "0.01em",
    },
    h2: {
      fontSize: 20,
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "34px",
      letterSpacing: "0.01em",
    },
    h3: {
      fontSize: 16,
      fontStyle: "normal",
      fontWeight: 400,
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
            fontSize: 14,
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
          fontSize: 16,
          lineHeight: "27px",
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
          "& input": {
            paddingBottom: "4px",
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
          ".MuiAlert-message,.MuiAlert-icon": {
            padding: 0.5,
          },
          ".MuiAlert-action": {
            padding: 0,
          },
          ".MuiAlert-message": {
            flex: "1 1 auto",
            display: "flex",
            justifyContent: "space-between",
          },
          ".MuiAlert-action .MuiButtonBase-root": {
            color: "#000",
            width: 24,
            height: 24,
          },
          ".MuiAlert-standardError": {
            backgroundColor: "#F9E9E6",
            color: errorMain,
            fontWeight: "bold",
          },
          ".MuiAlert-standardWarning": {
            backgroundColor: "#F9E9E6",
            color: warningMain,
            fontWeight: "bold",
          },
          ".MuiAlert-standardSuccess": {
            backgroundColor: "#F7F9F9",
            color: "#000000",
            border: "1px solid",
            borderColor: successMain,
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
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: "36px",
        },
      },
    },
  },
};

export const arduinoProTheme = createTheme(arduinoProThemeOptions);

export const mobileMQ =
  "@media screen and (max-height: 900px), screen and (max-width: 820px)";
