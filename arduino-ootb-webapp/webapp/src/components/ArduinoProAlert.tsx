import React, { useEffect, useState } from "react";
import Alert, { AlertProps } from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import { SvgAlert } from "../assets/Alert";
import { SvgSuccess } from "../assets/Success";

interface ArduinoProAlertProps {
  open: boolean;
  onClose?: () => void;
  message: string | React.ReactNode;
  button?: React.ReactNode;
  severity: AlertProps["severity"];
}

function ArduinoProAlertComponent(props: ArduinoProAlertProps) {
  const { button, message, open, onClose, severity } = props;
  const [closed, setClosed] = useState(open);

  useEffect(() => {
    if (open) {
      setClosed(false);
    }
  }, [open]);

  return (
    <Snackbar
      open={open && !closed}
      onClose={() => {
        setClosed(true);
        onClose?.();
      }}
      autoHideDuration={8000}
    >
      <div>
        <Alert
          icon={severity === "error" ? <SvgAlert /> : <SvgSuccess />}
          onClose={() => {
            setClosed(true);
            onClose?.();
          }}
          severity={severity}
          sx={{ width: "100%", "& .MuiAlert-message": { overflow: "hidden" } }}
        >
          <>
            <Box sx={{ marginRight: 2, whiteSpace: "nowrap" }}>{message}</Box>
            {button}
          </>
        </Alert>
      </div>
    </Snackbar>
  );
}

export const ArduinoProAlert = React.memo(ArduinoProAlertComponent);
