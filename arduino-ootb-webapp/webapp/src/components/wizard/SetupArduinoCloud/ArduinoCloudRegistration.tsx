import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import portentaX8 from "../../../assets/portenta-x8.svg";
import { useReadFactoryNameQuery } from "../../../services/factory";
import {
  useDeleteIoTCloudRegistrationMutation,
  useReadIoTCloudRegistrationQuery,
} from "../../../services/iot-cloud";
import { BackTitle } from "../../BackTitle";
import { ButtonsRow } from "../../ButtonsRow";
import { DeviceStatus } from "../../DeviceStatus";
import { PageBox } from "../../PageBox";
import DeleteDeviceDialog from "./DeleteDeviceDialog";

const deviceNameRegex = /^[a-zA-Z0-9-_]{1,32}$/i;

export const SetupIoTCloudFormSchema = z.object({
  deviceName: z
    .string()
    .regex(
      deviceNameRegex,
      "The Device Name can only contain alphanumeric characters, hyphens (-) and underscores (_)"
    ),
});

export type SetupIoTCloudForm = z.infer<typeof SetupIoTCloudFormSchema>;

function ArduinoCloudRegistrationComponent() {
  const navigate = useNavigate();

  const { data: existingDeviceName, isLoading: existingDeviceNameIsLoading } =
    useReadIoTCloudRegistrationQuery();
  const { data: factoryNameInfo, isLoading: factoryNameIsLoading } =
    useReadFactoryNameQuery(undefined);

  const [deleteIoTCloudRegistration, deleteIoTCloudRegistrationRequest] =
    useDeleteIoTCloudRegistrationMutation();

  if (factoryNameIsLoading || existingDeviceNameIsLoading) {
    return null;
  }

  return (
    <>
      <PageBox>
        <BackTitle back="/" title="Setup device with Arduino Cloud" />
        <Typography
          textAlign="center"
          sx={{ marginBottom: 4, textAlign: "center" }}
        >
          {`Your `}
          <code>
            {factoryNameInfo?.factoryName === "" ? "Portenta X8" : ""}
          </code>
          {` is already registered as `}
          <code>{existingDeviceName?.deviceName}</code>
          {`, you can find it between your `}
          <a
            href={import.meta.env.VITE_ARDUINO_IOT_CLOUD_DEVICES}
            target="_blank"
            rel="noreferrer"
          >
            {"Devices in Arduino IoT Cloud"}
          </a>
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
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              backgroundColor: "#202020",
              paddingX: 2.5,
              paddingY: 2,
            }}
          >
            <Box
              component="img"
              src={portentaX8}
              alt="arduino pro"
              sx={{ width: "72px" }}
            />
            <Box
              sx={{
                height: 48,
                marginX: 2,
                flex: "1 1 auto",
                marginLeft: 2,
                minWidth: 0,
              }}
            >
              <Box
                component="code"
                sx={{
                  maxWidth: "100%",
                  minWidth: 0,
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  display: "block",
                }}
              >
                {existingDeviceName?.deviceName}
              </Box>
              <Box
                sx={{
                  fontSize: "12px",
                  flex: "1 1 auto",
                  maxWidth: "100%",
                }}
              >
                {"Arduino Portenta X8"}
              </Box>
            </Box>
            <DeleteDeviceDialog
              onDelete={() => {
                deleteIoTCloudRegistration({});
                navigate("/");
              }}
              loading={deleteIoTCloudRegistrationRequest.isLoading}
            />
          </Box>
        </Box>
        <ButtonsRow>
          <Button
            variant="outlined"
            component="a"
            href={import.meta.env.VITE_ARDUINO_IOT_CLOUD_THINGS}
          >
            {"GO TO ARDUINO CLOUD"}
          </Button>
          <Button variant="contained" component={Link} to="/">
            {"Back"}
          </Button>
        </ButtonsRow>
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const ArduinoCloudRegistration = React.memo(
  ArduinoCloudRegistrationComponent
);
