import React, { useEffect, useRef, useState } from "react";
import Sarus from "@anephenix/sarus";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import "xterm/css/xterm.css";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import { SvgAlert } from "../../assets/Alert";
import { SvgShell } from "../../assets/Shell";
import { useWindowResize } from "../../hooks/useWindowResize";
import { BackTitle } from "../BackTitle";
import { DeviceStatus } from "../DeviceStatus";

function ShellComponent() {
  const termDivRef = useRef(null);
  const termRef = useRef(new Terminal());
  const fitAddonRef = useRef(new FitAddon());

  const [connectionClosed, setConnectionClosed] = useState(false);
  const [alertClosed, setAlertClosed] = useState(false);

  useEffect(() => {
    if (termDivRef.current) {
      termRef.current.open(termDivRef.current);
      termRef.current.loadAddon(fitAddonRef.current);
      fitAddonRef.current.fit();
    }

    // const noteOpened = () => {};

    const parseMessage = (event: { data: string }) => {
      // eslint-disable-next-line no-console
      console.log("[SSH]", JSON.stringify(event.data));

      setConnectionClosed(false);
      setAlertClosed(false);

      termRef.current.write(event.data);
    };

    const socketClosed = () => {
      setConnectionClosed(true);
      termRef.current.clear();
    };

    const throwError = (error: Error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      setConnectionClosed(true);
    };

    const sarus = new Sarus({
      url: "ws://localhost:1323/api/shell",
      eventListeners: {
        // open: [noteOpened],
        open: [],
        message: [parseMessage],
        close: [socketClosed],
        error: [throwError],
      },
    });

    const send = (msg: string) => {
      // eslint-disable-next-line no-console
      console.log("[XTR]", JSON.stringify(msg));
      sarus.send(msg);
    };

    termRef.current.onKey((e) => send(e.key));
  }, []);

  useWindowResize(() => {
    fitAddonRef.current.fit();
  });

  return (
    <>
      <Box
        sx={{
          maxWidth: 1440,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          flex: "1 1 auto",
          paddingX: "30px",
        }}
      >
        <BackTitle
          bold
          back="/"
          title={
            <span>
              <SvgShell sx={{ marginRight: 2, height: 18 }} />
              <span>{"Arduino Portenta X8 Shell"}</span>
            </span>
          }
          subtitle="Use the shell to communicate with the Board"
        />
        <Snackbar
          open={connectionClosed && !alertClosed}
          onClose={() => {
            setAlertClosed(true);
          }}
        >
          <Alert
            icon={<SvgAlert sx={{ color: "error.dark", height: 20 }} />}
            onClose={() => {
              setAlertClosed(true);
            }}
            severity="error"
            sx={{ width: "100%" }}
          >
            {"Connection with the Board has been lost"}
            <Button
              variant="text"
              size="small"
              color="error"
              sx={{
                paddingY: 0,
                paddingX: 1,
                fontFamily: "inherit",
                fontWeight: 700,
                color: "error.dark",
                fontSize: 12,
                marginRight: 1,
              }}
            >
              Troubleshoot
            </Button>
          </Alert>
        </Snackbar>
        <Box
          sx={{
            padding: 1,
            paddingRight: 2,
            backgroundColor: "#000",
            borderRadius: "3px",
            border: "1px solid",
            borderColor: "#95A5A6",
            width: "100%",
            flex: "1 1 auto",
            maxHeight: "calc(100vh - 508px)",
            opacity: connectionClosed ? 0.5 : 1,
            pointerEvents: connectionClosed ? "none" : undefined,
            ".xterm-viewport::-webkit-scrollbar": {
              width: "12px",
            },

            ".xterm-viewport::-webkit-scrollbar-track": {
              background: "#000",
            },

            ".xterm-viewport::-webkit-scrollbar-thumb": {
              backgroundColor: "#B2B2B2",
              borderRadius: "20px",
              border: "3px solid black",
            },
            "&>div": {
              width: "100%",
              height: "100%",
            },
          }}
        >
          <div ref={termDivRef} id="xterm-container" />
        </Box>
        <Button
          variant="text"
          color="secondary"
          size="large"
          sx={{
            marginTop: 1,
            marginBottom: 5,
            fontWeight: 700,
            marginRight: "auto",
            marginLeft: "-20px",
          }}
        >
          {"GO TO SHELL DOCUMENTATION"}
        </Button>
      </Box>
      <DeviceStatus wide />
    </>
  );
}

export const Shell = React.memo(ShellComponent);
