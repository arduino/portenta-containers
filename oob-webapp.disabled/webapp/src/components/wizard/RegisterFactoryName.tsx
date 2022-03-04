import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { FactoryNameInfo } from "../../entities";
import { useReadBoardQuery } from "../../services/board";
import { useCreateFactoryNameMutation } from "../../services/factory";
import { BackTitle } from "../BackTitle";
import { Code } from "../Code";
import { DeviceStatus } from "../DeviceStatus/DeviceStatus";
import { PageBox } from "../PageBox";

export const FactoryNameFormSchema = z.object({
  name: z.string().min(1).max(64),
});

export type FactoryNameForm = z.infer<typeof FactoryNameFormSchema>;

function RegisterFactoryNameComponent() {
  const { data: board } = useReadBoardQuery();
  const [factoryNameInfo, setFactoryNameInfo] = useState<FactoryNameInfo>();

  const [registerName, { isLoading: registerNameIsLoading }] =
    useCreateFactoryNameMutation();

  const { control, handleSubmit } = useForm<FactoryNameForm>({
    defaultValues: { name: "" },
    resolver: zodResolver(FactoryNameFormSchema),
    mode: "onTouched",
  });

  return (
    <>
      <PageBox>
        <BackTitle back="/landing" title="Register Factory Name" />
        {factoryNameInfo ? (
          <Box
            sx={{
              width: 500,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              flex: "1 1 auto",
            }}
          >
            <p>
              {`Your `}
              <b>{board?.deviceModelName}</b>
              {` is named `}
              <b>{factoryNameInfo.deviceName}</b>
              {`.`}
            </p>
            <p>
              To complete the registration copy the challenge code
              <Code>{factoryNameInfo.userCode}</Code> and insert it in
              Foundries.io
            </p>
            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                component={Link}
                to="/landing"
                sx={{
                  mr: 5,
                  transitionProperty: "width",
                  transitionDuration: "shorter",
                  transitionTimingFunction: "easeInOut",
                }}
              >
                {"Finish"}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component="a"
                href={factoryNameInfo.browserURL}
                rel="noopener noreferrer"
                target="_blank"
                sx={{
                  transitionProperty: "width",
                  transitionDuration: "shorter",
                  transitionTimingFunction: "easeInOut",
                }}
              >
                {"Go to Arduino Cloud"}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit(async (values) => {
              const data = await registerName({ name: values.name });
              if ("data" in data) {
                setFactoryNameInfo(data.data);
              }
            })}
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
                  helperText={error?.message}
                  {...field}
                  sx={{ mt: "20px" }}
                />
              )}
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              startIcon={
                <Box
                  sx={{
                    maxWidth: registerNameIsLoading ? 24 : 0,
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
              {registerNameIsLoading ? "Registering" : "Register"}
            </Button>
          </Box>
        )}
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const RegisterFactoryName = React.memo(RegisterFactoryNameComponent);
