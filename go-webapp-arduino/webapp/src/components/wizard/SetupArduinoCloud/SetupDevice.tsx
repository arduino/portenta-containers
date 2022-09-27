import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { mobileMQ } from "../../../theme";
import { BackTitle } from "../../BackTitle";
import { ButtonsRow } from "../../ButtonsRow";
import { LoadingButton } from "../../LoadingButton";
import { PageBox } from "../../PageBox";

const clientIdRegex = /^[a-zA-Z0-9]{32}$/i;
const clientSecretRegex = /^[a-zA-Z0-9]{64}$/i;

export const SetupIoTCloudFormSchema = z.object({
  clientId: z
    .string()
    .regex(
      clientIdRegex,
      "The Client ID must contain 32 alphanumeric characters"
    ),
  clientSecret: z
    .string()
    .regex(
      clientSecretRegex,
      "The Client ID must contain 64 alphanumeric characters"
    ),
});

export type SetupIoTCloudForm = z.infer<typeof SetupIoTCloudFormSchema>;

interface SetupDeviceComponentProps {
  onSubmit: (values: { clientId: string; clientSecret: string }) => void;
  loading: boolean;
}

function SetupDeviceComponent(props: SetupDeviceComponentProps) {
  const { onSubmit, loading } = props;

  const { control, handleSubmit, formState } = useForm<SetupIoTCloudForm>({
    defaultValues: { clientId: "", clientSecret: "" },
    resolver: zodResolver(SetupIoTCloudFormSchema),
    mode: "onTouched",
  });

  return (
    <>
      <BackTitle
        back="/"
        title="Setup device with Arduino Cloud"
        subtitle={
          "Create an Arduno Cloud API Key and paste the credentials generated below. You can also re-use existing API Keys."
        }
      />
      <PageBox>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
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
          <Controller
            control={control}
            name="clientId"
            render={({ field, fieldState: { invalid, error } }) => (
              <TextField
                variant="filled"
                label={
                  <Box>
                    {"Client ID"}
                    <Box sx={{ color: "#da5b4a", display: "inline", ml: 0.5 }}>
                      *
                    </Box>
                  </Box>
                }
                type="text"
                autoComplete="factory-name"
                error={invalid}
                helperText={error?.message ?? " "}
                {...field}
                sx={{
                  marginTop: 1,
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="clientSecret"
            render={({ field, fieldState: { invalid, error } }) => (
              <TextField
                variant="filled"
                label={
                  <Box>
                    {"Client Secret"}
                    <Box sx={{ color: "#da5b4a", display: "inline", ml: 0.5 }}>
                      *
                    </Box>
                  </Box>
                }
                type="text"
                autoComplete="factory-name"
                error={invalid}
                helperText={error?.message ?? " "}
                {...field}
                sx={{
                  marginTop: 1,
                }}
              />
            )}
          />
          <ButtonsRow>
            <LoadingButton
              type="submit"
              loading={loading}
              loadingChildren={"Registering"}
              disabled={!formState.isValid}
            >
              {"Setup Device"}
            </LoadingButton>
          </ButtonsRow>
        </Box>
      </PageBox>
    </>
  );
}

export const SetupDevice = React.memo(SetupDeviceComponent);