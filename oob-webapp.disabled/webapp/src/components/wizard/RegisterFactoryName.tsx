import React, { useState } from "react";
import { useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { FactoryNameInfo } from "../../entities";
import { useRegisterFactoryNameMutation } from "../../hooks/query/factory";
import { useBoard } from "../../hooks/query/useBoard";
import { BackTitle } from "../BackTitle";
import { Code } from "../Code";
import { DeviceStatus } from "../DeviceStatus/DeviceStatus";

function RegisterFactoryNameComponent() {
  const { data: board } = useBoard();
  const [name, setName] = useState<string | undefined>();
  const [factoryNameInfo, setFactoryNameInfo] = useState<FactoryNameInfo>();

  const queryClient = useQueryClient();
  const { mutate: registerName, isLoading: registerNameIsLoading } =
    useRegisterFactoryNameMutation({
      onSuccess: (data) => {
        queryClient.invalidateQueries("connection");
        setFactoryNameInfo(data);
      },
    });

  return (
    <>
      <BackTitle title="Register Factory Name" />
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
              {"GO TO FOUNDRIES.IO"}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            width: 500,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            flex: "1 1 auto",
          }}
        >
          <TextField
            id="password-input"
            variant="filled"
            label={
              <Box>
                Assign a name to the board
                <Box sx={{ color: "#da5b4a", display: "inline", ml: 0.5 }}>
                  *
                </Box>
              </Box>
            }
            type="text"
            autoComplete="current-password"
            value={name}
            onChange={(e) => setName(e.target.value)}
            helperText={`The name must have between 3 and 20 characters without any space or symbol`}
            sx={{ mt: "20px" }}
          />
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => {
              if (name) {
                registerName({ name });
              }
            }}
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
              mt: 3,
              transitionProperty: "width",
              transitionDuration: "shorter",
              transitionTimingFunction: "easeInOut",
            }}
          >
            {registerNameIsLoading ? "Registering" : "Register"}
          </Button>
        </Box>
      )}
      <DeviceStatus />
    </>
  );
}

export const RegisterFactoryName = React.memo(RegisterFactoryNameComponent);
