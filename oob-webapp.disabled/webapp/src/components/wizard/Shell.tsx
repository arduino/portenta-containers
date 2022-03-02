import React, { useEffect, useRef, useState } from "react";
import Sarus from "@anephenix/sarus";
import { Terminal } from "xterm";
import Box from "@mui/material/Box";
import "xterm/css/xterm.css";

function ShellComponent() {
  const termDivRef = useRef(null);
  const termRef = useRef(new Terminal());

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (termDivRef.current) {
      termRef.current.open(termDivRef.current);
    }

    const noteOpened = () => {
      setConnected(true);
    };

    const parseMessage = (event: { data: string }) => {
      // eslint-disable-next-line no-console
      console.log("[SSH]", JSON.stringify(event.data));

      termRef.current.write(event.data);
    };

    const noteClosed = () => {
      setConnected(false);
      termRef.current.clear();
    };

    const throwError = (error: Error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      setConnected(false);
    };

    const sarus = new Sarus({
      url: "ws://localhost:1323/api/shell",
      eventListeners: {
        open: [noteOpened],
        message: [parseMessage],
        close: [noteClosed],
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

  return (
    <Box
      sx={{
        maxWidth: 510,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          padding: 1,
          paddingRight: 2,
          backgroundColor: "#000",
          borderRadius: 1,
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
        }}
      >
        <div ref={termDivRef} id="xterm-container" />
      </Box>
      {connected ? "connected" : "NOT connected"}
    </Box>
  );
}

export const Shell = React.memo(ShellComponent);
