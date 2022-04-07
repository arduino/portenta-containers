import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAfter } from "date-fns";
import { z } from "zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { SvgAlert } from "../../../assets/Alert";
import {
  useCreateFactoryNameMutation,
  useReadFactoryNameQuery,
} from "../../../services/factory";
import { BackTitle } from "../../BackTitle";
import { DeviceStatus } from "../../DeviceStatus/DeviceStatus";
import { PageBox } from "../../PageBox";
import { CodeExpired } from "./CodeExpired";
import { CopyCode } from "./CopyCode";
import { RegisterName } from "./RegisterName";

export const FactoryNameFormSchema = z.object({
  name: z.string().min(1).max(64),
});

export type FactoryNameForm = z.infer<typeof FactoryNameFormSchema>;

function RegisterFactoryNameComponent() {
  // const [codeTimeout, setCodeTimeout] = useState(15 * 60 * 1000);
  const { data: factoryNameInfo } = useReadFactoryNameQuery();
  const [registrationError, setRegistrationError] = useState<
    string | undefined
  >();
  const navigate = useNavigate();

  const [registerName, { isLoading: registerNameIsLoading }] =
    useCreateFactoryNameMutation();

  if (factoryNameInfo?.registrationComplete === true) {
    navigate("/");
  }

  return (
    <>
      <PageBox>
        <Snackbar
          open={Boolean(registrationError)}
          onClose={() => {
            setRegistrationError(undefined);
          }}
          autoHideDuration={8000}
        >
          <Alert
            icon={<SvgAlert sx={{ color: "error.dark", height: 20 }} />}
            onClose={() => {
              setRegistrationError(undefined);
            }}
            severity="error"
            sx={{ width: "100%" }}
          >
            {"An error has occurred in the registration process"}
          </Alert>
        </Snackbar>
        <BackTitle
          back="/"
          title="Register with Factory"
          subtitle={
            factoryNameInfo?.factoryName
              ? undefined
              : "Please enter the name of the factory associated with your Arduino Cloud plan with which the board should be registered:"
          }
        />
        <Typography
          component="div"
          fontFamily="monospace"
          fontWeight={700}
          fontSize={28}
          sx={{
            marginTop: -3,
            marginBottom: 5,
          }}
        >
          {factoryNameInfo?.factoryName}
        </Typography>
        <Box
          sx={{
            marginX: "auto",
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          {factoryNameInfo?.factoryName ? (
            isAfter(
              new Date(),
              new Date(factoryNameInfo.userCodeExpiryTimestamp)
            ) ? (
              <CodeExpired />
            ) : (
              <CopyCode
                userCode={factoryNameInfo.userCode}
                userCodeExpiryTimestamp={
                  factoryNameInfo.userCodeExpiryTimestamp
                }
              />
            )
          ) : (
            <RegisterName
              loading={registerNameIsLoading}
              onSubmit={async (values) => {
                const res = await registerName(values);
                if ("error" in res && "data" in res.error) {
                  setRegistrationError(res.error.data as string);
                }
              }}
            />
          )}
        </Box>
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const RegisterFactoryName = React.memo(RegisterFactoryNameComponent);
