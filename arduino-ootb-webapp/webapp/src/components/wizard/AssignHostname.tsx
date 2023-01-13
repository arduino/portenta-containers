import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { SvgAlert } from "../../assets/Alert";
import { BoardHostname } from "../../entities";
import {
  useReadHostnameQuery,
  useUpdateHostnameMutation,
} from "../../services/board";
import { BackTitle } from "../BackTitle";
import { ButtonsRow } from "../ButtonsRow";
import { DeviceStatus } from "../DeviceStatus/DeviceStatus";
import { LoadingButton } from "../LoadingButton";
import { PageBox } from "../PageBox";

const HostnameFormSchema = z.object({
  hostname: z.string().regex(/^[a-zA-Z0-9-]+$/),
});

type HostnameForm = z.infer<typeof HostnameFormSchema>;

function AssignHostnameComponent() {
  const [receivedHostname, setReceivedHostname] = useState<BoardHostname>();
  const { data: currentHostname } = useReadHostnameQuery();

  const [updateHostname, { isLoading: updateHostnameIsLoading }] =
    useUpdateHostnameMutation();

  const { control, handleSubmit, watch } = useForm<HostnameForm>({
    defaultValues: { hostname: currentHostname?.hostname ?? "" },
    resolver: zodResolver(HostnameFormSchema),
    mode: "onSubmit",
  });

  const hostname = watch("hostname");

  return (
    <>
      <PageBox>
        <BackTitle
          title="Assign an Hostname"
          subtitle="Set a custom Hostname for this board"
          back="/"
        />
        {receivedHostname ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              flex: "1 1 auto",
              width: "100%",
            }}
          >
            <p>{`The Hostname of this board is now: `}</p>
            <Typography sx={{ color: "secondary.main" }}>
              {receivedHostname.hostname}
            </Typography>
            <ButtonsRow>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={Link}
                to="/"
                sx={{
                  mr: 5,
                  transitionProperty: "width",
                  transitionDuration: "shorter",
                  transitionTimingFunction: "easeInOut",
                }}
              >
                {"Home"}
              </Button>
            </ButtonsRow>
          </Box>
        ) : (
          <Box
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
              name="hostname"
              render={({ field, fieldState: { invalid, error } }) => (
                <Box sx={{ position: "relative" }}>
                  <TextField
                    id="password-input"
                    variant="filled"
                    fullWidth
                    label={
                      <Box>
                        Hostname
                        <Box
                          sx={{
                            color: "error.main",
                            display: "inline",
                            ml: 0.5,
                          }}
                        >
                          *
                        </Box>
                      </Box>
                    }
                    type="text"
                    error={invalid}
                    helperText={
                      error ? (
                        <Box
                          sx={{
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            img: { mr: 0.8 },
                          }}
                        >
                          <SvgAlert />
                          {"Invalid hostname"}
                        </Box>
                      ) : undefined
                    }
                    {...field}
                    sx={{
                      marginTop: 3,
                      ".MuiInputBase-input": {
                        paddingRight: "36px",
                      },
                    }}
                  />
                  <Typography
                    sx={{
                      position: "absolute",
                      right: 12,
                      top: 50,
                      fontSize: 16,
                      color: (theme) => theme.palette.grey[500],
                    }}
                  >
                    {".local"}
                  </Typography>
                </Box>
              )}
            />
            <ButtonsRow>
              <LoadingButton
                loading={updateHostnameIsLoading}
                onClick={handleSubmit(async ({ hostname }) => {
                  const data = await updateHostname({
                    hostname: `${hostname}.local`,
                  });
                  if ("data" in data) {
                    setReceivedHostname(data.data);
                  }
                })}
                disabled={!hostname}
              >
                {"Assign hostname"}
              </LoadingButton>
            </ButtonsRow>
          </Box>
        )}
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const AssignHostname = React.memo(AssignHostnameComponent);
