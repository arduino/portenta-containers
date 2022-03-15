import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

export const FactoryNameFormSchema = z.object({
  name: z.string().min(1).max(64),
});

export type FactoryNameForm = z.infer<typeof FactoryNameFormSchema>;

interface RegisterNameComponentProps {
  onSubmit: (values: { name: string }) => void;
  loading: boolean;
}

function RegisterNameComponent(props: RegisterNameComponentProps) {
  const { onSubmit, loading } = props;

  const { control, handleSubmit, formState } = useForm<FactoryNameForm>({
    defaultValues: { name: "" },
    resolver: zodResolver(FactoryNameFormSchema),
    mode: "onTouched",
  });

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
      }}
    >
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState: { invalid, error } }) => (
          <TextField
            variant="filled"
            label={
              <Box>
                Factory name
                <Box sx={{ color: "#da5b4a", display: "inline", ml: 0.5 }}>
                  *
                </Box>
              </Box>
            }
            type="text"
            autoComplete="factory-name"
            error={invalid}
            helperText={error?.message}
            {...field}
            sx={{
              marginTop: 1,
            }}
          />
        )}
      />
      {formState.touchedFields.name ? null : (
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
      )}
      <Button
        type="submit"
        variant="contained"
        color="secondary"
        size="large"
        startIcon={
          <Box
            sx={{
              maxWidth: loading ? 24 : 0,
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
        {loading ? "Registering" : "Register"}
      </Button>
    </Box>
  );
}

export const RegisterName = React.memo(RegisterNameComponent);
