import React, { useState } from "react";
import { Control, Controller } from "react-hook-form";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { SvgLock } from "../../../assets/Lock";
import { SvgWifi } from "../../../assets/Wifi";
import { Network } from "../../../entities";
import { autocompleteProps } from "../../Autocomplete";
import { InlineIcon } from "../../InlineIcon";
import { ConfigureWifiForm } from "./ConfigureWifiForm";

interface SelectNetworkComponent {
  control: Control<ConfigureWifiForm>;
  networkOptions: Network[];
  selectedNetwork: ConfigureWifiForm["network"];
  networksListIsLoading: boolean;
  onSwitchMode: () => void;
}

function SelectNetworkComponent(props: SelectNetworkComponent) {
  const { control, networkOptions, selectedNetwork, networksListIsLoading } =
    props;

  const [freeSolo, setFreeSolo] = useState(false);

  return (
    <>
      <Controller
        control={control}
        name="network"
        render={({ field }) => (
          <>
            <Box sx={{ position: "relative" }}>
              <Autocomplete
                getOptionLabel={(option) => option.ssid}
                freeSolo={freeSolo}
                {...autocompleteProps<ConfigureWifiForm["network"]>(
                  networkOptions,
                  freeSolo ? null : (
                    <Box
                      onMouseDown={(event) => {
                        setFreeSolo(true);
                        event.preventDefault();
                      }}
                    >
                      {"Insert Network SSID manually"}
                    </Box>
                  ),
                  (props, option) => (
                    <Box
                      sx={{
                        display: "flex",
                        width: "100%",
                      }}
                    >
                      <InlineIcon>
                        <SvgWifi
                          signal={option.signal ?? 0}
                          sx={{ fontSize: 15, marginRight: 1.5 }}
                        />
                      </InlineIcon>
                      <Box
                        component="span"
                        sx={{
                          flex: "1 1 auto",
                          opacity: option.ssid?.length > 0 ? 1 : 0.75,
                        }}
                      >
                        {option.ssid?.length > 0 ? option.ssid : "(No name)"}
                      </Box>
                      {option.security ? (
                        <InlineIcon>
                          <SvgLock sx={{ fontSize: 17, marginLeft: 1.5 }} />
                        </InlineIcon>
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
                  <TextField
                    {...params}
                    variant="filled"
                    label="Network"
                    helperText=" "
                    onChange={
                      freeSolo
                        ? (e) =>
                            field.onChange({
                              ssid: e.target.value,
                            })
                        : undefined
                    }
                  />
                )}
                {...field}
                value={field.value ?? null}
                onChange={(e, value) => value && field.onChange(value)}
              />
            </Box>
          </>
        )}
      />
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
                (selectedNetwork.security
                  ? `${selectedNetwork.security} password required`
                  : " ")
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
