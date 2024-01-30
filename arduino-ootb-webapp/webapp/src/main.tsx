import React from "react";
import { HashRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import App from "./App";
import { arduinoProTheme, globalStyles } from "./theme";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={arduinoProTheme}>
      <GlobalStyles styles={globalStyles} />
      <CssBaseline />
      <HashRouter>
        <App />
      </HashRouter>
      ,
    </ThemeProvider>
  </React.StrictMode>,
);
