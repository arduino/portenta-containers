import React from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import portentaX8 from "../../../assets/portenta-x8.svg";
import { useReadFactoryNameQuery } from "../../../services/factory";
import {
  useDeleteIoTCloudRegistrationMutation,
  useReadIoTCloudRegistrationQuery,
} from "../../../services/iot-cloud";
import { BackTitle } from "../../BackTitle";
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
      <BackTitle back="/" title="Setup device with Arduino Cloud" />
      <PageBox>
        <Typography sx={{ marginBottom: 4, textAlign: "center" }}>
          {`Your device ${factoryNameInfo?.factoryName} is already registered as ${existingDeviceName?.name}, you can find it between your Devices’ in Arduino IoT Cloud`}
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
            <Box sx={{ height: 48, marginLeft: 2, flex: "1 1 auto" }}>
              {existingDeviceName?.name}
              {factoryNameInfo?.factoryName}
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
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const ArduinoCloudRegistration = React.memo(
  ArduinoCloudRegistrationComponent
);
