import React from "react";
import { Control, Controller } from "react-hook-form";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Network } from "../../../entities";

import { ConfigureWifiForm } from "./ConfigureWifiForm";

interface TypeNetworkComponent {
  control: Control<ConfigureWifiForm>;
  networkOptions: Network[];
  selectedNetwork?: ConfigureWifiForm["network"];
  networksListIsLoading: boolean;
  onSwitchMode: () => void;
}

function TypeNetworkComponent(props: TypeNetworkComponent) {
  const { control } = props;
  return (
    <>
      <Controller
        control={control}
        name="network.ssid"
        render={({ field, fieldState: { invalid, error } }) => (
          <TextField
            id="ssid-input"
            variant="filled"
            label={
              <Box>
                Network
                <Box sx={{ color: "#da5b4a", display: "inline", ml: 0.5 }}>
                  *
                </Box>
              </Box>
            }
            type="text"
            autoComplete="x8-wifi-ssid"
            error={invalid}
            helperText={error?.message ?? " "}
            {...field}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState: { invalid, error } }) => (
          <TextField
            id="password-input"
            variant="filled"
            label={
              <Box>
                Password
                <Box sx={{ color: "#da5b4a", display: "inline", ml: 0.5 }}>
                  *
                </Box>
              </Box>
            }
            type="password"
            autoComplete="x8-wifi-password"
            // value={password}
            // onChange={(e) => setPassword(e.target.value)}
            error={invalid}
            // helperText={
            //   error ?? `${selectedNetwork.security} password required`
            // }
            {...field}
            sx={{ mt: "20px" }}
          />
        )}
      />
    </>
  );
}

export const TypeNetwork = React.memo(TypeNetworkComponent);
