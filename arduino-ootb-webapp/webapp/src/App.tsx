import React from "react";
import { Provider } from "react-redux";
import { Routes, Route, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import logoUrl from "./assets/logo.svg";
import { AssignHostname } from "./components/wizard/AssignHostname";
import { ConfigureEthernet } from "./components/wizard/ConfigureEthernet/ConfigureEthernet";
import { ConfigureLte } from "./components/wizard/ConfigureLte/ConfigureLte";
import { ConfigureWifi } from "./components/wizard/ConfigureWifi/ConfigureWifi";
import { Landing } from "./components/wizard/Landing/Landing";
import { RegisterFactoryName } from "./components/wizard/RegisterFactoryName/RegisterFactoryName";
import { Settings } from "./components/wizard/Settings";
import { ArduinoCloudRegistration } from "./components/wizard/SetupArduinoCloud/ArduinoCloudRegistration";
import { SetupArduinoCloud } from "./components/wizard/SetupArduinoCloud/SetupArduinoCloud";
import { Shell } from "./components/wizard/Shell";
import { store } from "./store";
import { mobileMQ } from "./theme";

function App() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
        backgroundColor: "#2F2F2F",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Provider store={store}>
        <Box
          component="header"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            padding: 3.5,
            [mobileMQ]: {
              padding: 2,
            },
          }}
        >
          <Button color="primary" onClick={() => navigate("/")}>
            <img src={logoUrl} alt="Arduino Pro" />
          </Button>
          <Button
            variant="text"
            size="small"
            href={`${import.meta.env.VITE_ARDUINO_PRO_SUBSCRIBE}`}
            rel="noopener noreferrer"
            sx={{ color: "#fff", fontSize: 10.5, fontWeight: 700 }}
          >
            SUBSCRIBE TO PRO
          </Button>
        </Box>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/wlan" element={<ConfigureWifi />} />
          <Route path="/settings/ethernet" element={<ConfigureEthernet />} />
          <Route path="/settings/lte" element={<ConfigureLte />} />
          <Route path="/factory" element={<RegisterFactoryName />} />
          <Route path="/shell" element={<Shell />} />
          <Route path="/hostname" element={<AssignHostname />} />
          <Route path="/iot-cloud/setup" element={<SetupArduinoCloud />} />
          <Route
            path="/iot-cloud/registration"
            element={<ArduinoCloudRegistration />}
          />
        </Routes>
      </Provider>
    </Box>
  );
}

export default App;
