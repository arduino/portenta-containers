import React, { useEffect, useRef, useState } from "react";
import { useResizeDetector } from "react-resize-detector";
import Sarus from "@anephenix/sarus";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import "xterm/css/xterm.css";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import { debounce } from "@mui/material/utils";
import { SvgAlert } from "../../assets/Alert";
import { SvgShellIcon } from "../../assets/ShellIcon";
import { useWindowResize } from "../../hooks/useWindowResize";
import { mobileMQ } from "../../theme";
import { BackTitle } from "../BackTitle";
import { DeviceStatus } from "../DeviceStatus";
import { PageBox } from "../PageBox";

function ShellComponent() {
  const termDivRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef(new Terminal());
  const fitAddonRef = useRef(new FitAddon());
  const wsRef = useRef<Sarus | null>(null);
  const { width, height, ref } = useResizeDetector();

  const [connected, setConnected] = useState(true);
  const [alertClosed, setAlertClosed] = useState(false);

  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null,
    );
  };

  const handleCloseMenu = () => {
    setContextMenu(null);
  };

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

      setAlertClosed(false);

      termRef.current.write(event.data);
    };

    const socketOpened = () => {
      setConnected(true);
    };

    const socketClosed = (event: CloseEvent) => {
      setConnected(false);

      if (!event.wasClean) {
        // eslint-disable-next-line no-console
        console.error("Websocket connection closed: ", event);
      }

      termRef.current.clear();
    };

    const throwError = (error: Error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      setConnected(false);
    };

    const sarus = new Sarus({
      url: `ws://${window.location.hostname}${
        window.location.port.length ? `:${window.location.port}` : ""
      }/api/shell`,
      eventListeners: {
        open: [socketOpened],
        message: [parseMessage],
        close: [socketClosed],
        error: [throwError],
      },
    });

    wsRef.current = sarus;

    const debouncedPaste = debounce((pasted: string) => {
      for (let i = 0; i < pasted.length; i++) {
        const k = pasted[i];
        sarus.send(k);
      }
    });

    const send = (msg: string) => {
      // eslint-disable-next-line no-console
      console.log("[XTR]", JSON.stringify(msg));
      sarus.send(msg);
    };

    termRef.current.onKey((e) => send(e.key));

    termRef.current.attachCustomKeyEventHandler((key: KeyboardEvent) => {
      if (key.code === "KeyV") {
        if (key.metaKey || (key.shiftKey && key.ctrlKey)) {
          navigator.clipboard.readText().then(debouncedPaste);
          return false;
        }
      }
      return true;
    });
  }, []);

  useEffect(() => {
    if (termDivRef.current) {
      termRef.current.loadAddon(fitAddonRef.current);
      fitAddonRef.current.fit();
    }
  }, [width, height]);

  useWindowResize(() => {
    fitAddonRef.current.fit();
  });

  return (
    <>
      <PageBox
        maxWidth={1440}
        sx={{ main: { maxHeight: "60vh", paddingX: 2 } }}
      >
        <BackTitle
          bold
          back="/"
          title={
            <Box component="span" sx={{ maxWidth: { xs: "70vw" } }}>
              <Box
                component={SvgShellIcon}
                sx={{ marginRight: 2, height: 18 }}
              />
              <span>{"Arduino Portenta X8 Shell"}</span>
            </Box>
          }
          subtitle="Shell is running in python-alpine container"
        />
        <Snackbar
          open={!connected && !alertClosed}
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
            {/* <Button
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
            </Button> */}
          </Alert>
        </Snackbar>
        <Box
          onContextMenu={handleContextMenu}
          ref={ref}
          sx={{
            padding: 1,
            paddingRight: 2,
            backgroundColor: "#000",
            borderRadius: "3px",
            border: "1px solid",
            borderColor: "#95A5A6",
            width: "100%",
            flex: "1 1 50vh",
            minHeight: 0,
            opacity: connected ? 1 : 0.5,
            pointerEvents: connected ? undefined : "none",
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
            [mobileMQ]: {
              minHeight: 320,
            },
          }}
        >
          <div ref={termDivRef} id="xterm-container" />
        </Box>

        <Button
          component="a"
          href={`${import.meta.env.VITE_ARDUINO_DOCS_X8_URL}`}
          rel="noopener noreferrer"
          target="_blank"
          variant="text"
          color="secondary"
          size="large"
          sx={{
            marginTop: 1,
            fontWeight: 700,
            marginRight: "auto",
            marginLeft: "-20px",
          }}
        >
          {"GO TO DOCUMENTATION"}
        </Button>
        <Menu
          open={contextMenu !== null}
          onClose={handleCloseMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
          sx={{
            ".MuiMenuItem-root": {
              typography: "body2",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              navigator.clipboard.writeText(termRef.current.getSelection());
            }}
          >
            Copy
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              navigator.clipboard.readText().then((pasted) => {
                for (let i = 0; i < pasted.length; i++) {
                  const k = pasted[i];
                  wsRef.current?.send(k);
                }
              });
            }}
          >
            Paste
          </MenuItem>
        </Menu>
      </PageBox>
      <DeviceStatus wide />
    </>
  );
}

export const Shell = React.memo(ShellComponent);
