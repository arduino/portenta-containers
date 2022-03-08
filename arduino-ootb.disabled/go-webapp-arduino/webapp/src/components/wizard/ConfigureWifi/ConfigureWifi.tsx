import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { Network } from "../../../entities";
import {
  useCreateWlanConnectionMutation,
  useReadWlanNetworkListQuery,
} from "../../../services/networking";
import { BackTitle } from "../../BackTitle";
import { DeviceStatus } from "../../DeviceStatus/DeviceStatus";
import { PageBox } from "../../PageBox";
import {
  ConfigureWifiForm,
  ConfigureWifiFormSchema,
} from "./ConfigureWifiForm";
import { SelectNetwork } from "./SelectNetwork";
import { TypeNetwork } from "./TypeNetwork";

function ConfigureWifiComponent() {
  const { data: networksList, isLoading: networksListIsLoading } =
    useReadWlanNetworkListQuery();
  const [connectedSsid, setConnectedSsid] = useState<string>();
  const [mode, setMode] = useState<"select" | "manual">("select");

  const { control, handleSubmit, watch, formState, setError, setValue } =
    useForm<ConfigureWifiForm>({
      defaultValues: { network: undefined, password: "" },
      resolver: zodResolver(ConfigureWifiFormSchema),
      mode: "onTouched",
    });

  const network = watch("network");

  const [connect, { isLoading: connectIsLoading }] =
    useCreateWlanConnectionMutation();

  const networkOptions = useMemo(
    () => [...(networksList ?? []), { ssid: undefined }] as Network[],
    [networksList]
  );

  return (
    <>
      {connectedSsid ? (
        <PageBox>
          <BackTitle back="/wlan" success title="Configure Wi-Fi" />
          {`Your Arduino Portenta X8 has been successfully configured to use the Wi-Fi network ${connectedSsid}.`}
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
          <BackTitle back="/landing" title="Configure Wi-Fi" />
          <Box
            component="form"
            onSubmit={handleSubmit(async (values) => {
              if (values.network) {
                const data = await connect({
                  ssid: values.network.ssid,
                  password: values.password ?? "",
                });
                if ("data" in data) {
                  setConnectedSsid(values.network.ssid);
                } else if ("error" in data) {
                  setError(values.password ? "password" : "network.ssid", {
                    type: "value",
                    message: values.password
                      ? "Insert a valid WPA2 password"
                      : "Couldn't connect to the network. Please make sure you've entered the correct SSID.",
                  });
                }
              }
            })}
            sx={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              flex: "1 1 auto",
            }}
          >
            {mode === "select" ? (
              <SelectNetwork
                control={control}
                networkOptions={networksList ?? []}
                networksListIsLoading={networksListIsLoading}
                selectedNetwork={network}
                onSwitchMode={() => {
                  setValue("network", {
                    ssid: "",
                    security: "",
                    signal: 0,
                  });
                  setMode("manual");
                }}
              />
            ) : (
              <TypeNetwork
                control={control}
                networkOptions={networkOptions}
                networksListIsLoading={networksListIsLoading}
                selectedNetwork={network}
                onSwitchMode={() => {
                  setMode("select");
                }}
              />
            )}
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
              disabled={!formState.isValid}
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

export const ConfigureWifi = React.memo(ConfigureWifiComponent);
