import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SvgSuccess } from "../../../assets/Success";
import {
  useCreateWlanConnectionMutation,
  useReadWlanConnectionQuery,
  useReadWlanNetworkListQuery,
} from "../../../services/networking";
import { mobileMQ } from "../../../theme";
import { openWifiInfo } from "../../../uiSlice";
import { BackTitle } from "../../BackTitle";
import { ButtonsRow } from "../../ButtonsRow";
import { DeviceStatus } from "../../DeviceStatus/DeviceStatus";
import { LoadingButton } from "../../LoadingButton";
import { PageBox } from "../../PageBox";
import {
  ConfigureWifiForm,
  ConfigureWifiFormSchema,
} from "./ConfigureWifiForm";
import { SelectNetwork } from "./SelectNetwork";

function ConfigureWifiComponent() {
  const dispatch = useDispatch();
  const { data: networksList, isLoading: networksListIsLoading } =
    useReadWlanNetworkListQuery();
  const { data: wlanConnection, isSuccess: wlanConnectionIsSuccess } =
    useReadWlanConnectionQuery();
  const [connectedSsid, setConnectedSsid] = useState<string>();

  const { control, handleSubmit, watch, setError, setValue } =
    useForm<ConfigureWifiForm>({
      defaultValues: {
        network: wlanConnection?.network
          ? networksList?.find((n) => n.ssid === wlanConnection.network)
          : undefined,
        password: wlanConnection?.password ?? "",
      },
      resolver: zodResolver(ConfigureWifiFormSchema),
      mode: "onTouched",
    });

  const network = watch("network");

  const [connect, { isLoading: connectIsLoading }] =
    useCreateWlanConnectionMutation();

  useEffect(() => {
    if (wlanConnection && wlanConnectionIsSuccess && networksList) {
      const network = networksList.find(
        (n) => n.ssid === wlanConnection.network,
      );
      if (network && network.ssid !== "") {
        setValue("network", network);
      }
    }
  }, [networksList, setValue, wlanConnection, wlanConnectionIsSuccess]);

  return (
    <>
      {connectedSsid ? (
        <PageBox>
          <BackTitle back="/wlan" success title="Configure Wi-Fi" />
          <Snackbar open={true}>
            <Alert
              icon={<SvgSuccess sx={{ color: "success.main", height: 20 }} />}
              severity="success"
              sx={{ width: "100%" }}
            >
              {`The Board is now connected to the Wi-Fi network ${connectedSsid}`}
              <Button
                variant="text"
                size="small"
                color="success"
                sx={{
                  paddingY: 0,
                  paddingX: 1,
                  fontFamily: "inherit",
                  fontWeight: 700,
                  color: "success.main",
                  fontSize: 12,
                  marginLeft: 2,
                  marginRight: -1,
                  textTransform: "none",
                }}
                onClick={() => dispatch(openWifiInfo())}
              >
                More info
              </Button>
            </Alert>
          </Snackbar>
          <Typography textAlign="center" sx={{ marginTop: 6 }}>
            {`Your Arduino Portenta X8 has been successfully configured to use the Wi-Fi network `}
            <b>{connectedSsid}</b>
            {`.`}
          </Typography>
          <ButtonsRow>
            <Button
              component={Link}
              to="/"
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
          </ButtonsRow>
        </PageBox>
      ) : (
        <PageBox>
          <BackTitle back="/" title="Configure Wi-Fi" />
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
              width: "100%",
              marginTop: 6,
              [mobileMQ]: {
                marginTop: 0,
              },
            }}
          >
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
              }}
            />
            <ButtonsRow>
              <LoadingButton
                type="submit"
                loading={connectIsLoading}
                loadingChildren={"Connecting"}
                disabled={!network?.ssid}
              >
                {"Connect"}
              </LoadingButton>
            </ButtonsRow>
          </Box>
        </PageBox>
      )}
    </>
  );
}

function ConfigureWifiWrapper() {
  const { isSuccess } = useReadWlanConnectionQuery();
  const { isSuccess: networksListIsSuccess } = useReadWlanNetworkListQuery();

  if (!isSuccess || !networksListIsSuccess) {
    return (
      <>
        <PageBox>
          <BackTitle back="/" title="Configure Wi-Fi" />
          <Stack
            height="100%"
            justifyContent="center"
            alignItems="center"
            paddingBottom="10vh"
          >
            <CircularProgress color="secondary" />
          </Stack>
        </PageBox>
        <DeviceStatus />
      </>
    );
  }

  return (
    <>
      <ConfigureWifiComponent />
      <DeviceStatus />
    </>
  );
}

export const ConfigureWifi = React.memo(ConfigureWifiWrapper);
