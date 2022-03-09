import React from "react";
import { useNavigate } from "react-router-dom";
import { isAfter } from "date-fns";
import { z } from "zod";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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
  const navigate = useNavigate();

  const [registerName, { isLoading: registerNameIsLoading }] =
    useCreateFactoryNameMutation();

  if (factoryNameInfo?.registrationComplete === true) {
    navigate("/");
  }

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCodeTimeout((t) => {
  //       if (t > 1000) {
  //         return t - 1000;
  //       }

  //       clearInterval(interval);
  //       return 0;
  //     });
  //   }, 1000);
  // }, []);

  return (
    <>
      <PageBox>
        <BackTitle back="/" title="Register with Factory" />
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
          {factoryNameInfo?.deviceName}
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
          {factoryNameInfo ? (
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
              onSubmit={(values) => {
                registerName({ name: values.name });
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
