import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import alertIcon from "../../assets/alert.svg";
import { BoardHostname } from "../../entities";
import {
  useBoardHostname,
  useUpdateHostnameMutation,
} from "../../hooks/query/useBoard";
import { BackTitle } from "../BackTitle";
import { DeviceStatus } from "../DeviceStatus/DeviceStatus";
import { PageBox } from "../PageBox";

const HostnameFormSchema = z.object({
  hostname: z.string().regex(/^[a-zA-Z0-9-]+$/),
});

type HostnameForm = z.infer<typeof HostnameFormSchema>;

function AssignHostnameComponent() {
  const [receivedHostname, setReceivedHostname] = useState<BoardHostname>();
  const { data: currentHostname } = useBoardHostname();
  const { mutate: updateHostname, isLoading: updateHostnameIsLoading } =
    useUpdateHostnameMutation({
      onSuccess: (data) => {
        setReceivedHostname(data);
      },
    });

  const { control, handleSubmit } = useForm<HostnameForm>({
    defaultValues: { hostname: currentHostname?.hostname ?? "" },
    resolver: zodResolver(HostnameFormSchema),
    mode: "onSubmit",
  });

  return (
    <>
      <PageBox>
        <BackTitle
          title="Assign an Hostname"
          subtitle="Set a custom Hostname for this board"
        />
        {receivedHostname ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              flex: "1 1 auto",
            }}
          >
            <p>{`The Hostname of this board is now: `}</p>
            <Typography sx={{ color: "secondary.main" }}>
              {receivedHostname.hostname}
            </Typography>
            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
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
                {"Home"}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              flex: "1 1 auto",
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
                        Assign a name to the board
                        <Box
                          sx={{ color: "#da5b4a", display: "inline", ml: 0.5 }}
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
                          <img src={alertIcon} alt="" />
                          {"Invalid hostname"}
                        </Box>
                      ) : undefined
                    }
                    {...field}
                    sx={{ mt: "20px" }}
                    InputProps={{}}
                  />
                  <Typography
                    sx={{
                      position: "absolute",
                      right: 12,
                      bottom: 8,
                      color: (theme) => theme.palette.grey[500],
                    }}
                  >
                    {".local"}
                  </Typography>
                </Box>
              )}
            />
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleSubmit(({ hostname }) => {
                updateHostname({ hostname: `${hostname}.local` });
              })}
              startIcon={
                <Box
                  sx={{
                    maxWidth: updateHostnameIsLoading ? 24 : 0,
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
                mt: 3,
                transitionProperty: "width",
                transitionDuration: "shorter",
                transitionTimingFunction: "easeInOut",
              }}
            >
              {"Assign hostname"}
            </Button>
          </Box>
        )}
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const AssignHostname = React.memo(AssignHostnameComponent);
