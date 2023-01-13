import React, { useState } from "react";
import { z } from "zod";
import { IoTCloudRegistrationStatus } from "../../../entities";
import { useCreateIoTCloudRegistrationMutation } from "../../../services/iot-cloud";
import { ArduinoProAlert } from "../../ArduinoProAlert";
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
      <ArduinoProAlert
        message={
          registrationError ??
          "An error has occurred in the registration process"
        }
        open={Boolean(registrationError)}
        severity="error"
      />
      {deviceName && setupCompleted && registrationResult ? (
        <SetupCompleted
          deviceId={registrationResult.deviceId ?? ""}
          deviceName={deviceName}
          thingId={registrationResult.thingId ?? ""}
          thingName={registrationResult.thingName ?? ""}
          dashboardId={registrationResult.dashboardId ?? ""}
          dashboardName={registrationResult.dashboardName ?? ""}
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
              setRegistrationError(
                (error as { data: { error: string } }).data.error
              );
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
