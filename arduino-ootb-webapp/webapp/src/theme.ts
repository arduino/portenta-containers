import { createTheme, ThemeOptions } from "@mui/material/styles";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/500.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/roboto-mono";

const pro = "#111111";
const eLime = "#DEF154";
const errorMain = "#DA5B4A";
const errorDark = "#C11F09";
const warningMain = "#F1C40F";
const successMain = "#1DA086";
const fog = "#DAE3E3";

const spacing = 8;

export const arduinoProThemeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: pro,
    },
    secondary: {
      main: eLime,
    },
    mode: "dark",
    background: {
      paper: "#202020",
    },
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
  spacing,
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
          fontWeight: 700,
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
      defaultProps: {
        variant: "filled",
      },
      styleOverrides: {
        root: {
          ".MuiInputBase-input": {
            paddingLeft: 0,
            paddingRight: 0,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          width: "100%",
          border: "4px solid",
          borderColor: "#202020",
          borderRadius: "5px",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#202020",
          display: "flex",
          justifyContent: "center",
          position: "relative",
          borderBottom: "1px solid #4E5B61",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 6,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "10px 15px",
        },
      },
    },
    MuiCircularProgress: {
      defaultProps: {
        disableShrink: true,
        thickness: 4.8,
      },
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: {
          lineHeight: "170%",
          letterSpacing: "0.01em",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          maxWidth: 382,
          width: "100%",
          margin: "auto",
          paddingTop: "20px",
          paddingBottom: "20px",
          display: "flex",
          justifyContent: "flex-end",
          ".MuiButton-root": {
            fontWeight: "bold",
          },
        },
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
            minWidth: 650,
          },
          ".MuiAlert-message,.MuiAlert-icon": {
            padding: 0.5,
          },
          ".MuiAlert-action": {
            padding: 0,
          },
          ".MuiAlert-message": {
            flex: "1 1 auto",
            lineHeight: "22px",
            display: "flex",
            justifyContent: "space-between",
          },
          ".MuiAlert-message .MuiButton-root": {
            lineHeight: "22px",
            fontWeight: 700,
            paddingY: 0,
            paddingX: 1,
            fontFamily: "inherit",
            fontSize: 12,
            marginLeft: 1,
            marginRight: 0,
            textTransform: "none",
            whiteSpace: "nowrap",
          },
          ".MuiAlert-action .MuiButtonBase-root": {
            color: "#000",
            width: 24,
            height: 24,
            lineHeight: "22px",
          },
          ".MuiAlert-standardError": {
            backgroundColor: "#F9E9E6",
            color: errorMain,
            fontWeight: "bold",
          },
          ".MuiAlert-standardError .MuiButton-root": {
            color: errorDark,
          },
          ".MuiAlert-standardError .MuiAlert-icon svg": {
            color: errorDark,
            height: 15,
            marginTop: "3px",
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
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#000",
          paddingTop: 2 * spacing,
          paddingBottom: 2 * spacing,
          paddingLeft: 2.5 * spacing,
          paddingRight: 2.5 * spacing,
          fontSize: 12,
        },
      },
    },
  },
};

export const arduinoProTheme = createTheme(arduinoProThemeOptions);

export const globalStyles = {
  a: {
    color: eLime,
    textDecoration: "none",
    fontWeight: 700,
  },
  code: {
    fontWeight: 700,
  },
};

export const mobileMQ =
  "@media screen and (max-height: 900px), screen and (max-width: 820px)";
