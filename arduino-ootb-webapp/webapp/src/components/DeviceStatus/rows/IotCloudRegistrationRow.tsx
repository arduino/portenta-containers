import React from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { SvgArrowRight } from "../../../assets/ArrowRight";
import { useTouchSelectAll } from "../../../hooks/useTouchSelectAll";
import { useReadIoTCloudRegistrationQuery } from "../../../services/iot-cloud";
import { TooltipIcon } from "../../TooltipIcon";
import { StatusKeyValue } from "../StatusKeyValue";

function IotCloudRegistrationRowComponent() {
  const selectAll = useTouchSelectAll();

  const { data: ioTCloudRegistrationInfo, isLoading } =
    useReadIoTCloudRegistrationQuery(undefined, {
      pollingInterval: 3000,
    });

  if (!ioTCloudRegistrationInfo?.registered) {
    return null;
  }

  return (
    <StatusKeyValue
      keyName="Arduino Cloud"
      keyNameMobile="Arduino Cloud"
      value={
        ioTCloudRegistrationInfo?.registered
          ? ioTCloudRegistrationInfo.deviceName ?? "Unknown"
          : undefined
      }
      status={
        ioTCloudRegistrationInfo?.registered
          ? "g"
          : // : ioTCloudRegistrationInfo?.authenticationPending
            // ? "y"
            "r"
      }
      loading={isLoading}
      renderValue={(value) =>
        value ? (
          <>
            <Box
              component="span"
              onTouchStart={selectAll}
              sx={{
                marginX: 3,
                textTransform: "uppercase",
              }}
            >
              {value}
            </Box>
            <TooltipIcon
              icon={<SvgArrowRight />}
              href={`${import.meta.env.VITE_ARDUINO_IOT_CLOUD_DEVICES}`}
              target="_blank"
              rel="noopener noreferrer"
              tooltip={"Go to Arduino Cloud"}
              backgroundColor="#202020"
            />
          </>
        ) : (
          <Button
            component={Link}
            to="/factory"
            color="primary"
            variant="text"
            size="small"
            sx={{
              paddingX: 1,
              fontSize: "inherit",
              marginX: 3,
            }}
          >
            {"Not configured"}
          </Button>
        )
      }
    />
  );
}

export const IotCloudRegistrationRow = React.memo(
  IotCloudRegistrationRowComponent,
);
