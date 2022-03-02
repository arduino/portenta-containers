import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import lockIcon from "../../assets/lock.svg";
import Wifi from "../../assets/Wifi";
import { Network } from "../../entities";
import {
  useConnectMutation,
  useNetworkList,
} from "../../hooks/query/useNetworkList";
import { BackTitle } from "../BackTitle";
import { DeviceStatus } from "../DeviceStatus/DeviceStatus";
import { PageBox } from "../PageBox";

const WifiFormSchema = z.object({
  network: z.object({
    ssid: z.string().min(0).max(32),
    signal: z.number(),
    security: z.string(),
  }),
  password: z.string().min(0).max(64),
});

type WifiForm = z.infer<typeof WifiFormSchema>;

function App() {
  const queryClient = useQueryClient();
  const { data: networksList, isLoading } = useNetworkList();
  const [connectedNetwork, setConnectedNetwork] = useState<Network>();

  const { control, handleSubmit, watch } = useForm<WifiForm>({
    defaultValues: { network: undefined, password: "" },
    resolver: zodResolver(WifiFormSchema),
    mode: "onSubmit",
  });

  const network = watch("network");

  const { mutate: connect, isLoading: connectIsLoading } = useConnectMutation({
    onSuccess: () => {
      queryClient.invalidateQueries("connection");
      setConnectedNetwork(network);
    },
  });

  // const networks: Record<string, Network> = useMemo(() => {
  //   const networks: Record<string, Network> = {};

  //   if (networksList) {
  //     for (let i = 0; i < networksList.length; i++) {
  //       const network = networksList[i];
  //       networks[network.ssid] = network;
  //     }
  //   }

  //   return networks;
  // }, [networksList]);

  // const selectedNetwork = useMemo(() => {
  //   if (!ssid) {
  //     return undefined;
  //   }

  //   return networks[ssid];
  // }, [ssid, networks]);

  const networkOptions = useMemo(
    () => [...(networksList ?? []), { ssid: "" }] as Network[],
    [networksList]
  );

  return (
    <>
      {connectedNetwork ? (
        <PageBox>
          <BackTitle success title="Configure Wi-Fi" />
          {`Your Arduino Portenta X8 has been successfully configured to use the Wi-Fi network ${connectedNetwork.ssid}.`}
          <Button
            component={Link}
            to="/landing"
            variant="contained"
            color="secondary"
            size="large"
            type="submit"
            sx={{
              ml: "auto",
              mt: "auto",
              transitionProperty: "width",
              transitionDuration: "shorter",
              transitionTimingFunction: "easeInOut",
            }}
          >
            {"OK"}
          </Button>
        </PageBox>
      ) : (
        <PageBox>
          <BackTitle title="Configure Wi-Fi" />
          <Box
            component="form"
            onSubmit={handleSubmit((values) => {
              if (values.network && values.password) {
                connect({
                  ssid: values.network.ssid,
                  password: values.password,
                });
              }
            })}
            sx={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              flex: "1 1 auto",
            }}
          >
            <Controller
              control={control}
              name="network"
              render={({ field, fieldState: { invalid, error } }) => (
                <Autocomplete
                  options={networkOptions}
                  getOptionLabel={(option) => option.ssid}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="filled"
                      label="Network"
                      error={invalid}
                      helperText={error?.message}
                    />
                  )}
                  PopperComponent={(props: React.HTMLProps<HTMLDivElement>) => {
                    return (
                      <Box
                        sx={{
                          backgroundColor: "primary.main",
                          border: "1px solid",
                          borderColor: "secondary.main",
                          borderTop: 0,
                          borderBottomLeftRadius: 3,
                          borderBottomRightRadius: 3,
                          position: "absolute",
                          top: 56,
                          left: 0,
                          right: 0,
                          padding: 0,
                          zIndex: 1000,
                          ul: {
                            padding: 0,
                            borderRadius: 0,
                          },
                        }}
                      >
                        {props.children}
                      </Box>
                    );
                  }}
                  renderOption={(props, option) =>
                    option.ssid === "" ? (
                      <MenuItem
                        sx={{
                          color: "secondary.main",
                          backgroundColor: "primary.main",
                        }}
                      >
                        {"Insert Network SSID manually"}
                      </MenuItem>
                    ) : (
                      <Box
                        component="li"
                        {...props}
                        sx={{
                          display: "flex",
                          alignItems: "baseline",
                          backgroundColor: "primary.main",
                          marginBottom: 0,
                        }}
                      >
                        <Wifi signal={option.signal} />
                        {option.ssid}
                        {option.security ? (
                          <Box
                            component="img"
                            src={lockIcon}
                            alt={option.security}
                            sx={{ marginLeft: "auto" }}
                          />
                        ) : null}
                      </Box>
                    )
                  }
                  {...field}
                  onChange={(e, value) => value && field.onChange(value)}
                />
              )}
            />
            {isLoading ? (
              <CircularProgress
                color="secondary"
                size={28}
                sx={{ position: "absolute", right: -36, top: 12 }}
              />
            ) : null}
            {network && network.security !== "" ? (
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
                        <Box
                          sx={{ color: "#da5b4a", display: "inline", ml: 0.5 }}
                        >
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
                      error ?? `${network.security} password required`
                    }
                    {...field}
                    sx={{ mt: "20px" }}
                  />
                )}
              />
            ) : null}
            <Button
              variant="contained"
              color="secondary"
              size="large"
              type="submit"
              startIcon={
                <Box
                  sx={{
                    maxWidth: connectIsLoading ? 24 : 0,
                    width: 24,
                    height: 22,
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    transitionProperty: "maxWidth",
                    transitionDuration: "shorter",
                    transitionTimingFunction: "easeInOut",
                  }}
                >
                  <CircularProgress color="primary" size={22} />
                </Box>
              }
              sx={{
                ml: "auto",
                mt: "auto",
                transitionProperty: "width",
                transitionDuration: "shorter",
                transitionTimingFunction: "easeInOut",
              }}
            >
              {connectIsLoading ? "Connecting" : "Connect"}
            </Button>
          </Box>
        </PageBox>
      )}
      <DeviceStatus />
    </>
  );
}

export default App;
