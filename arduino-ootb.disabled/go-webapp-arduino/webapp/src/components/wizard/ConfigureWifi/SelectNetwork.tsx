import React from "react";
import { Control, Controller } from "react-hook-form";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import lockIcon from "../../../assets/lock.svg";
import Wifi from "../../../assets/Wifi";
import { Network } from "../../../entities";
import { autocompleteProps } from "../../Autocomplete";
import { ConfigureWifiForm } from "./ConfigureWifiForm";

interface SelectNetworkComponent {
  control: Control<ConfigureWifiForm>;
  networkOptions: Network[];
  selectedNetwork: ConfigureWifiForm["network"];
  networksListIsLoading: boolean;
  onSwitchMode: () => void;
}

function SelectNetworkComponent(props: SelectNetworkComponent) {
  const {
    control,
    networkOptions,
    selectedNetwork,
    networksListIsLoading,
    onSwitchMode,
  } = props;

  return (
    <>
      <Controller
        control={control}
        name="network"
        render={({ field }) => (
          <>
            {/* {networksListIsLoading ? "true" : "false"} */}
            <Box sx={{ position: "relative" }}>
              <Autocomplete
                getOptionLabel={(option) => option.ssid}
                {...autocompleteProps<ConfigureWifiForm["network"]>(
                  networkOptions,
                  <Box onMouseDown={() => onSwitchMode()}>
                    {"Insert Network SSID manually"}
                  </Box>,
                  (props, option) => (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Wifi signal={option.signal ?? 0} />
                      <Box component="span" sx={{ flex: "1 1 auto" }}>
                        {option.ssid}
                      </Box>
                      {option.security ? (
                        <Box
                          component="img"
                          src={lockIcon}
                          alt={option.security}
                        />
                      ) : null}
                    </Box>
                    // </Box>
                  )
                )}
                noOptionsText={
                  networksListIsLoading
                    ? "Searching for Network.."
                    : "No corresponding Wi-Fi Network has been detected"
                }
                renderInput={(params) => (
                  <TextField {...params} variant="filled" label="Network" />
                )}
                {...field}
                onChange={(e, value) => value && field.onChange(value)}
              />
            </Box>
          </>
        )}
      />
      {/* {networksListIsLoading ? (
        <CircularProgress
          color="secondary"
          size={28}
          sx={{ position: "absolute", right: -36, top: 12 }}
        />
      ) : null} */}
      {selectedNetwork && selectedNetwork.security !== "" ? (
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
              helperText={
                error?.message ??
                `${selectedNetwork.security} password required`
              }
              {...field}
              sx={{ mt: "20px" }}
            />
          )}
        />
      ) : null}
    </>
  );
}

export const SelectNetwork = React.memo(SelectNetworkComponent);
