import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { mobileMQ } from "../../../theme";
import { ButtonsRow } from "../../ButtonsRow";
import { LoadingButton } from "../../LoadingButton";

const factoryRegex = /^[a-z0-9-_]{1,64}$/i;

export const FactoryNameFormSchema = z.object({
  factoryName: z
    .string()
    .regex(
      factoryRegex,
      "The Factory Name can only contain alphanumeric characters, hyphens (-) and underscores (_)"
    ),
  boardName: z
    .string()
    .regex(
      factoryRegex,
      "The Board Name can only contain alphanumeric characters, hyphens (-) and underscores (_)"
    ),
});

export type FactoryNameForm = z.infer<typeof FactoryNameFormSchema>;

interface RegisterNameComponentProps {
  onSubmit: (values: { factoryName: string; boardName: string }) => void;
  loading: boolean;
}

function RegisterNameComponent(props: RegisterNameComponentProps) {
  const { onSubmit, loading } = props;

  const { control, handleSubmit, watch } = useForm<FactoryNameForm>({
    defaultValues: { factoryName: "", boardName: "" },
    resolver: zodResolver(FactoryNameFormSchema),
    mode: "onTouched",
  });

  const factoryName = watch("factoryName");

  return (
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
        name="factoryName"
        render={({ field, fieldState: { invalid, error } }) => (
          <TextField
            variant="filled"
            label={
              <Box>
                {"Factory name"}
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
        name="boardName"
        render={({ field, fieldState: { invalid, error } }) => (
          <TextField
            variant="filled"
            label={
              <Box>
                {"Assign a Board Name"}
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
      <Typography variant="body1" sx={{ marginTop: "20px" }}>
        {"No factory yet? "}
        <Box
          component="a"
          href="https://app.foundries.io/factories"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: "secondary.main",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          {"Click here"}
        </Box>
        {" to register one."}
      </Typography>
      <ButtonsRow>
        <LoadingButton
          type="submit"
          loading={loading}
          loadingChildren={"Registering"}
          disabled={!factoryName}
        >
          {"Register"}
        </LoadingButton>
      </ButtonsRow>
    </Box>
  );
}

export const RegisterName = React.memo(RegisterNameComponent);
