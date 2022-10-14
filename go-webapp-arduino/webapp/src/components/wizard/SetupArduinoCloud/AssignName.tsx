import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useReadIoTCloudRegistrationQuery } from "../../../services/iot-cloud";
import { BackTitle } from "../../BackTitle";
import { ButtonsRow } from "../../ButtonsRow";
import { LoadingButton } from "../../LoadingButton";
import { PageBox } from "../../PageBox";

const deviceNameRegex = /^[a-zA-Z0-9-_]{1,64}$/i;

export const SetupIoTCloudFormSchema = z.object({
  deviceName: z
    .string()
    .regex(
      deviceNameRegex,
      "The Device Name can only contain alphanumeric characters, hyphens (-) and underscores (_)"
    ),
});

export type SetupIoTCloudForm = z.infer<typeof SetupIoTCloudFormSchema>;

interface AssignNameComponentProps {
  onSubmit: (values: { deviceName: string }) => void;
}

function AssignNameComponent(props: AssignNameComponentProps) {
  const { onSubmit } = props;

  const { data: existingDeviceName, isSuccess } =
    useReadIoTCloudRegistrationQuery();

  const { control, handleSubmit, formState, setValue, trigger } =
    useForm<SetupIoTCloudForm>({
      defaultValues: { deviceName: "" },
      resolver: zodResolver(SetupIoTCloudFormSchema),
      mode: "onTouched",
    });

  useEffect(() => {
    if (isSuccess && existingDeviceName.deviceName) {
      setValue("deviceName", existingDeviceName.deviceName);
      trigger("deviceName");
    }
  }, [existingDeviceName, isSuccess, setValue, trigger]);

  return (
    <>
      <PageBox>
        <BackTitle
          back="/"
          title={
            <span>
              {"Setup device with "}
              <b>{"Arduino Cloud"}</b>
            </span>
          }
          subtitle={
            "Please assign a name to the device to start using it with Arduino Cloud:"
          }
        />
        <Box
          sx={{
            marginX: "auto",
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              flex: "1 1 auto",
              width: "100%",
            }}
          >
            <Controller
              control={control}
              name="deviceName"
              render={({ field, fieldState: { invalid, error } }) => (
                <TextField
                  variant="filled"
                  label={
                    <Box>
                      {"Device name"}
                      <Box
                        sx={{ color: "#da5b4a", display: "inline", ml: 0.5 }}
                      >
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
                loading={false}
                loadingChildren={"Registering"}
                disabled={!formState.isValid}
              >
                {"Continue"}
              </LoadingButton>
            </ButtonsRow>
          </Box>
        </Box>
      </PageBox>
    </>
  );
}

export const AssignName = React.memo(AssignNameComponent);
