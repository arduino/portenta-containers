import React, { useState } from "react";
import { z } from "zod";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { SvgAlert } from "../../../assets/Alert";
import { IoTCloudRegistrationStatus } from "../../../entities";
import { useCreateIoTCloudRegistrationMutation } from "../../../services/iot-cloud";
import { DeviceStatus } from "../../DeviceStatus/DeviceStatus";
import { AssignName } from "./AssignName";
import { SetupCompleted } from "./SetupCompleted";
import { SetupDevice } from "./SetupDevice";

export const FactoryNameFormSchema = z.object({
  name: z.string().min(1).max(64),
});

export type FactoryNameForm = z.infer<typeof FactoryNameFormSchema>;

function SetupArduinoCloudComponent() {
  const [registrationError, setRegistrationError] = useState<
    string | undefined
  >();

  const [deviceName, setDeviceName] = useState<string | undefined>();
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [registrationResult, setRegistrationResult] =
    useState<IoTCloudRegistrationStatus | null>(null);

  const [createIoTCloudRegistration, { isLoading: setupDeviceIsLoading }] =
    useCreateIoTCloudRegistrationMutation();

  return (
    <>
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
      {deviceName && setupCompleted ? (
        <SetupCompleted
          deviceName={deviceName}
          thingId={registrationResult?.thingId ?? ""}
        />
      ) : deviceName ? (
        <SetupDevice
          onSubmit={async function (values: {
            clientId: string;
            clientSecret: string;
          }): Promise<void> {
            if (!deviceName) {
              return;
            }

            try {
              const response = await createIoTCloudRegistration({
                ...values,
                deviceName,
              }).unwrap();

              setRegistrationResult(response);

              setSetupCompleted(true);
            } catch (error) {
              //
            }
          }}
          loading={setupDeviceIsLoading}
        />
      ) : (
        <AssignName
          onSubmit={function (values: { deviceName: string }): void {
            setDeviceName(values.deviceName);
          }}
        />
      )}
      <DeviceStatus />
    </>
  );
}

export const SetupArduinoCloud = React.memo(SetupArduinoCloudComponent);
