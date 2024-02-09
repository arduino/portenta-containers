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

const networkLabel = (network: ConfigureWifiForm["network"]) => {
  return network.ssid?.length > 0
    ? network.ssid.startsWith(" ") || network.ssid.endsWith(" ")
      ? `\`${network.ssid}\``
      : network.ssid
    : `[${network.bssid}]`;
};

const networkName = (network: ConfigureWifiForm["network"]) => {
  return (
    <Box
      component="span"
      sx={{
        flex: "1 1 auto",
        color: network.ssid?.length > 0 ? undefined : "#B2B2B2",
      }}
    >
      {networkLabel(network)}
    </Box>
  );
};

function SelectNetworkComponent(props: SelectNetworkComponent) {
  const { control, networkOptions, selectedNetwork, networksListIsLoading } =
    props;

  const [typeSsid, setTypeSsid] = useState(false);

  return (
    <>
      <Controller
        control={control}
        name="network"
        render={({ field, fieldState: { invalid } }) => (
          <>
            <Box sx={{ position: "relative" }}>
              {typeSsid ? (
                <TextField
                  id="ssid-input"
                  variant="filled"
                  fullWidth
                  label="Network"
                  type="text"
                  autoComplete="x8-wifi-ssid"
                  error={invalid}
                  autoFocus
                  {...field}
                  value={field.value?.ssid ?? ""}
                  onChange={(e) => field.onChange({ ssid: e.target.value })}
                />
              ) : (
                <Autocomplete
                  getOptionLabel={networkLabel}
                  isOptionEqualToValue={(option, value) => {
                    return option.ssid === value.ssid;
                  }}
                  {...autocompleteProps<ConfigureWifiForm["network"]>(
                    networkOptions,
                    <Box
                      onMouseDown={(event) => {
                        setTypeSsid(true);
                        event.preventDefault();
                      }}
                    >
                      {"Insert Network SSID manually"}
                    </Box>,
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
                        {networkName(option)}
                        {option.security ? (
                          <InlineIcon>
                            <SvgLock sx={{ fontSize: 17, marginLeft: 1.5 }} />
                          </InlineIcon>
                        ) : null}
                      </Box>
                    ),
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
                      onChange={
                        typeSsid
                          ? (e) =>
                              field.onChange({
                                ssid: e.target.value,
                              })
                          : undefined
                      }
                      error={invalid}
                    />
                  )}
                  {...field}
                  value={field.value ?? null}
                  onChange={(e, value) => {
                    value && field.onChange(value);
                  }}
                />
              )}
            </Box>
          </>
        )}
      />
      {(selectedNetwork && selectedNetwork.security !== "") || typeSsid ? (
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
                (selectedNetwork?.security
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
