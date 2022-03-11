import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { HashRouter } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import App from "./App";
import { arduinoProTheme } from "./theme";

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={arduinoProTheme}>
      <CssBaseline />
      <HashRouter>
        <App />
      </HashRouter>
      ,
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
