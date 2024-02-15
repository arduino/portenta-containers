import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { SvgAlert } from "../../../assets/Alert";
import { useDeviceConnectionStatus } from "../../../hooks/useDeviceConnected";
import { useCreateLteConnectionMutation } from "../../../services/networking";
import { mobileMQ } from "../../../theme";
import { ArduinoProAlert } from "../../ArduinoProAlert";
import { BackTitle } from "../../BackTitle";
import { ButtonsRow } from "../../ButtonsRow";
import { DeviceStatus } from "../../DeviceStatus";
import { LoadingButton } from "../../LoadingButton";
import { PageBox } from "../../PageBox";
import { ConfigureLteForm, ConfigureLteFormSchema } from "./ConfigureLteForm";

function ConfigureLteComponent() {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  const [configurationError, setConfigurationError] = useState<unknown | null>(
    null,
  );

  const {
    lte: { isLoading, connection },
  } = useDeviceConnectionStatus();

  const { control, handleSubmit, watch, setValue } = useForm<ConfigureLteForm>({
    defaultValues: { authentication: false },
    resolver: zodResolver(ConfigureLteFormSchema),
    mode: "onTouched",
  });

  const authentication = watch("authentication");

  const [createLteConnectionMutation] = useCreateLteConnectionMutation();

  return (
    <>
      <PageBox>
        <ArduinoProAlert
          message="We couldn’t connect to the Sim Network"
          open={Boolean(configurationError)}
          severity="error"
        />
        <BackTitle
          back="/"
          title="LTE/4G SIM"
          subtitle="Set your SIM configuration"
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
                setConnecting(true);

                await createLteConnectionMutation({
                  ...values,
                }).unwrap();

                setTimeout(() => {
                  if (connection) {
                    if (
                      connection?.connected !== "Locked" ||
                      connection?.unlockRetries >= 3
                    ) {
                      navigate("/");
                    } else {
                      setConfigurationError("Wrong PIN or APN entered");
                    }
                  }

                  setConnecting(false);
                }, 2000);
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
              <Grid item xs={12} md={6}>
                <Controller
                  control={control}
                  name="apn"
                  render={({ field, fieldState: { invalid, error } }) => (
                    <TextField
                      label="APN"
                      fullWidth
                      error={invalid}
                      helperText={error?.message}
                      InputLabelProps={{ shrink: true }}
                      {...field}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  control={control}
                  name="pin"
                  render={({ field, fieldState: { invalid, error } }) => (
                    <TextField
                      label="PIN"
                      fullWidth
                      error={invalid}
                      helperText={error?.message}
                      InputLabelProps={{ shrink: true }}
                      {...field}
                    />
                  )}
                />
              </Grid>
              {connection &&
              connection.connected !== "No Modem Found" &&
              connection.unlockRetries < 3 ? (
                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight="bold" color="error">
                    <SvgAlert
                      sx={{
                        color: "inherit",
                        height: "1em",
                        position: "relative",
                        top: "0.2em",
                        marginRight: 0.5,
                      }}
                    />
                    {configurationError
                      ? `${configurationError}. You have ${connection?.unlockRetries} PIN attempts left.`
                      : `You have ${connection?.unlockRetries} PIN attempt${
                          connection?.unlockRetries === 1 ? "" : "s"
                        } left.`}
                  </Typography>
                </Grid>
              ) : null}
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="authentication"
                  render={() => (
                    <Controller
                      control={control}
                      name="authentication"
                      render={({ field }) => (
                        <Stack direction="row" alignItems="center" gap={3}>
                          <FormLabel
                            id="authentcation-protocol-label"
                            sx={{ typography: "body2", color: "inherit" }}
                          >
                            {"Authentication Protocol: "}
                          </FormLabel>
                          <RadioGroup
                            row
                            aria-labelledby="authentcation-protocol-label"
                            name="position"
                            defaultValue="top"
                            value={field.value ? "true" : "false"}
                            onChange={(_, checked) => {
                              field.onChange(checked === "true");
                              if (checked) {
                                setValue("username", undefined);
                                setValue("password", undefined);
                              }
                            }}
                          >
                            <FormControlLabel
                              value="true"
                              control={<Radio />}
                              label="PAP/CHAP"
                              labelPlacement="end"
                              slotProps={{
                                typography: {
                                  typography: "body2",
                                },
                              }}
                            />
                            <FormControlLabel
                              value="false"
                              control={<Radio />}
                              label="None"
                              labelPlacement="end"
                              slotProps={{
                                typography: {
                                  typography: "body2",
                                },
                              }}
                            />
                          </RadioGroup>
                        </Stack>
                      )}
                    />
                  )}
                />
              </Grid>

              {authentication ? (
                <>
                  <Grid item xs={12} md={6}>
                    <Controller
                      control={control}
                      name="username"
                      render={({ field, fieldState: { invalid, error } }) => (
                        <TextField
                          label="Username"
                          fullWidth
                          error={invalid}
                          helperText={error?.message}
                          {...field}
                          disabled={!authentication}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      control={control}
                      name="password"
                      render={({ field, fieldState: { invalid, error } }) => (
                        <TextField
                          type="password"
                          label="Password"
                          fullWidth
                          error={invalid}
                          helperText={error?.message}
                          {...field}
                          disabled={!authentication}
                        />
                      )}
                    />
                  </Grid>
                </>
              ) : null}
            </Grid>
            <ButtonsRow>
              <LoadingButton
                type="submit"
                loading={isLoading || connecting}
                loadingChildren={"Connecting"}
              >
                {"Connect"}
              </LoadingButton>
            </ButtonsRow>
          </Box>
        )}
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const ConfigureLte = React.memo(ConfigureLteComponent);
