import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useDeviceConnectionStatus } from "../../../hooks/useDeviceConnected";
import { useCreateEthernetConnectionMutation } from "../../../services/networking";
import { mobileMQ } from "../../../theme";
import { ArduinoProAlert } from "../../ArduinoProAlert";
import { BackTitle } from "../../BackTitle";
import { ButtonsRow } from "../../ButtonsRow";
import { DeviceStatus } from "../../DeviceStatus";
import { LoadingButton } from "../../LoadingButton";
import { PageBox } from "../../PageBox";
import {
  ConfigureEthernetForm,
  ConfigureEthernetFormSchema,
} from "./ConfigureEthernetForm";

function ConfigureEthernetComponent() {
  const navigate = useNavigate();
  const [configurationError, setConfigurationError] = useState<unknown | null>(
    null,
  );

  const {
    ethernet: { connection, isLoading },
  } = useDeviceConnectionStatus();

  const { control, handleSubmit, watch, setValue, formState } =
    useForm<ConfigureEthernetForm>({
      defaultValues: { networkMode: "auto", dnsMode: "auto" },
      resolver: zodResolver(ConfigureEthernetFormSchema),
      mode: "onTouched",
    });

  const networkMode = watch("networkMode");
  const dnsMode = watch("dnsMode");

  const [createEthernetConnectionMutation] =
    useCreateEthernetConnectionMutation();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initialSetValue = (name: any, value: any) =>
      setValue(name, value, { shouldDirty: false });

    if (
      Object.values(formState.touchedFields).length === 0 &&
      !isLoading &&
      connection
    ) {
      initialSetValue("networkMode", connection.isDhcp ? "auto" : "static");
      initialSetValue("ip", connection.ip);
      initialSetValue("mask", connection.subnet);
      initialSetValue("gateway", connection.gateway);
      if (connection.preferredDns !== "" || connection.alternateDns !== "") {
        initialSetValue(
          "preferredDns",
          connection.preferredDns === "" ? undefined : connection.preferredDns,
        );
        initialSetValue(
          "alternateDns",
          connection.alternateDns === "" ? undefined : connection.alternateDns,
        );
        initialSetValue("dnsMode", "manual");
      }
    }
  }, [
    connection,
    formState.isDirty,
    formState.touchedFields,
    isLoading,
    setValue,
  ]);

  return (
    <>
      <PageBox>
        <ArduinoProAlert
          message="An error has occurred while updating the network configuration"
          open={Boolean(configurationError)}
          severity="error"
        />
        <BackTitle
          back="/"
          title="Ethernet Connection"
          subtitle="Set your Ethernet configuration"
        />
        {isLoading ? (
          <Box
            key="isLoading"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              paddingBottom: "15vh",
            }}
          >
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit(async (values) => {
              try {
                await createEthernetConnectionMutation({
                  connectionName: "Wired connection 1",
                  ...values,
                }).unwrap();

                navigate("/");
              } catch (error) {
                setConfigurationError(error);
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
            <Grid container spacing={3} rowSpacing={3}>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="networkMode"
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          color="secondary"
                          checked={field.value === "auto"}
                          onChange={(_, checked) => {
                            field.onChange(checked ? "auto" : "static");
                            if (checked) {
                              setValue("ip", undefined);
                              setValue("mask", undefined);
                              setValue("gateway", undefined);
                            }
                          }}
                        />
                      }
                      label="DHCP — Obtain an IP address automatically"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="ip"
                  render={({ field, fieldState: { invalid, error } }) => (
                    <TextField
                      label="IP address"
                      fullWidth
                      error={invalid}
                      helperText={error?.message}
                      InputLabelProps={{ shrink: true }}
                      {...field}
                      disabled={networkMode === "auto"}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  control={control}
                  name="mask"
                  render={({ field, fieldState: { invalid, error } }) => (
                    <TextField
                      label="Subnet Mask"
                      fullWidth
                      error={invalid}
                      helperText={error?.message}
                      InputLabelProps={{ shrink: true }}
                      {...field}
                      disabled={networkMode === "auto"}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  control={control}
                  name="gateway"
                  render={({ field, fieldState: { invalid, error } }) => (
                    <TextField
                      label="Default Gateway"
                      fullWidth
                      error={invalid}
                      helperText={error?.message}
                      InputLabelProps={{ shrink: true }}
                      {...field}
                      disabled={networkMode === "auto"}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="dnsMode"
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          color="secondary"
                          checked={field.value === "auto"}
                          onChange={(_, checked) => {
                            field.onChange(checked ? "auto" : "manual");
                            if (checked) {
                              setValue("preferredDns", undefined);
                              setValue("alternateDns", undefined);
                            }
                          }}
                        />
                      }
                      label="Obtain DNS server addresses automatically"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  control={control}
                  name="preferredDns"
                  render={({ field, fieldState: { invalid, error } }) => (
                    <TextField
                      label="Preferred DNS server"
                      fullWidth
                      error={invalid}
                      helperText={error?.message}
                      {...field}
                      disabled={dnsMode === "auto"}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  control={control}
                  name="alternateDns"
                  render={({ field, fieldState: { invalid, error } }) => (
                    <TextField
                      label="Alternate DNS server"
                      fullWidth
                      error={invalid}
                      helperText={error?.message}
                      {...field}
                      disabled={dnsMode === "auto"}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <ButtonsRow>
              <LoadingButton
                type="submit"
                // loading={connectIsLoading}
                loading={false}
                loadingChildren={"Connecting"}
              >
                {"Save"}
              </LoadingButton>
            </ButtonsRow>
          </Box>
        )}
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const ConfigureEthernet = React.memo(ConfigureEthernetComponent);
