import React from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useCreateEthernetConnectionMutation } from "../../../services/networking";
import { mobileMQ } from "../../../theme";
import { BackTitle } from "../../BackTitle";
import { ButtonsRow } from "../../ButtonsRow";
import { DeviceStatus } from "../../DeviceStatus/DeviceStatus";
import { LoadingButton } from "../../LoadingButton";
import { PageBox } from "../../PageBox";
import {
  ConfigureEthernetForm,
  ConfigureEthernetFormSchema,
} from "./ConfigureEthernetForm";

function ConfigureEthernetComponent() {
  const navigate = useNavigate();

  const { control, handleSubmit, watch, setValue } =
    useForm<ConfigureEthernetForm>({
      defaultValues: { networkMode: "auto", dnsMode: "auto" },
      resolver: zodResolver(ConfigureEthernetFormSchema),
      mode: "onTouched",
    });

  const networkMode = watch("networkMode");
  const dnsMode = watch("dnsMode");

  const [createEthernetConnectionMutation] =
    useCreateEthernetConnectionMutation();

  return (
    <>
      <PageBox>
        <BackTitle
          back="/"
          title="Ethernet Connection"
          subtitle="Set your Ethernet configuration"
        />
        <Box
          component="form"
          onSubmit={handleSubmit(async (values) => {
            try {
              await createEthernetConnectionMutation({
                connectionName: "eth0",
                ...values,
              }).unwrap();

              navigate("/");
            } catch (error) {
              //     setError(values.password ? "password" : "network.ssid", {
              //       type: "value",
              //       message: values.password
              //         ? "Insert a valid WPA2 password"
              //         : "Couldn't connect to the network. Please make sure you've entered the correct SSID.",
              //     });
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
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const ConfigureEthernet = React.memo(ConfigureEthernetComponent);
