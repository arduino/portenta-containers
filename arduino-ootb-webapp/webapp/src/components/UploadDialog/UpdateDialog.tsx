import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SvgClose } from "../../assets/Close";
import {
  useDownloadFirmwareMutation,
  useInstallFirmwareMutation,
  useLazyReadUpdateAvailableQuery,
  useReadProgressQuery,
} from "../../services/firmware";
import { mobileMQ } from "../../theme";
import { DarkDialog } from "../DarkDialog";
import { LoadingButton } from "../LoadingButton";
import ProgressBar from "../ProgressBar";

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

function CustomDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <SvgClose />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

export default function UpdateDialog() {
  const [open, setOpen] = React.useState(false);
  const [showInstallConfirm, setShowInstallConfirm] = React.useState(false);
  const [primaryCtaLoading, setPrimaryCtaLoading] = React.useState(false);
  const [readUpdateAvailable, readUpdateAvailableRequest] =
    useLazyReadUpdateAvailableQuery();

  const [download, downloadRequest] = useDownloadFirmwareMutation();
  const [install, installRequest] = useInstallFirmwareMutation();

  const { data: progress } = useReadProgressQuery(undefined, {
    pollingInterval: 500,
  });

  const status = React.useMemo(() => progress?.status, [progress]);

  React.useEffect(() => {
    if (status === "install-untar") {
      setShowInstallConfirm(false);
    }
    if (status === "install-untar" || status === "download-in-progress") {
      setPrimaryCtaLoading(false);
    }
  }, [status]);

  const updatesButton = (
    <Button
      onClick={() => {
        setOpen(true);
        readUpdateAvailable();
      }}
      variant="text"
      sx={{
        marginBottom: 2,
        marginX: 0,
        [mobileMQ]: {
          marginX: "auto",
        },
        whiteSpace: "nowrap",
        fontWeight: 700,
      }}
    >
      {status === "idle" ||
      status === "download-expired" ||
      status === "download-completed"
        ? "CHECK FOR UPDATES"
        : status === "download-in-progress"
          ? `DOWNLOADING UPDATE... ${Math.floor(progress?.percentage ?? 0)}%`
          : status === "install-completed"
            ? "Install update"
            : status === "install-dbus" ||
                status === "install-untar" ||
                status === "install-in-progress"
              ? "Installing update..."
              : ""}
    </Button>
  );

  if (readUpdateAvailableRequest.data?.updateAvailable) {
    return (
      <div>
        {updatesButton}
        <DarkDialog
          aria-labelledby="customized-dialog-title"
          open={open}
          maxWidth="sm"
          onClose={() => setOpen(false)}
          TransitionProps={{
            onExited: () => {
              downloadRequest.reset();
              installRequest.reset();
              setShowInstallConfirm(false);
            },
          }}
        >
          <CustomDialogTitle
            id="customized-dialog-title"
            onClose={() => setOpen(false)}
          >
            {"Updating OS"}
          </CustomDialogTitle>
          <DialogContent sx={{ fontSize: 16 }}>
            {showInstallConfirm ? (
              <>
                <Typography fontSize="inherit" gutterBottom>
                  Warning: the update will erase the board OS and existing
                  containers. Do you want to proceed?
                </Typography>
              </>
            ) : (
              <>
                {status === "idle" || status === "download-expired" ? (
                  <Typography
                    fontSize="inherit"
                    gutterBottom
                    sx={{ fontWeight: 700 }}
                  >
                    Do you want to update the latest version of the Operating
                    System?
                  </Typography>
                ) : (
                  <>
                    {status === "download-in-progress" ||
                    status === "download-md5" ? (
                      <Typography fontSize="inherit" gutterBottom>
                        Do not turn off your Portenta X8 or disconnect from the
                        network.
                      </Typography>
                    ) : null}
                    {status === "download-completed" ||
                    status === "install-untar" ||
                    status === "install-dbus" ? (
                      <Typography fontSize="inherit" gutterBottom>
                        {
                          "Update download finalized. The device will restart automatically to install the update in "
                        }
                        <Typography
                          fontSize="inherit"
                          component="span"
                          fontWeight={700}
                        >
                          30
                        </Typography>
                        {" seconds."}
                        <Typography
                          fontSize="inherit"
                          fontWeight={700}
                          marginTop={1}
                        >
                          Do not turn off your Portenta X8 in the process.
                        </Typography>
                      </Typography>
                    ) : null}
                    {status === "download-in-progress" &&
                      progress &&
                      progress?.percentage > 0 && (
                        <ProgressBar value={progress?.percentage} />
                      )}
                    {status === "download-md5" || status === "install-untar" ? (
                      <ProgressBar />
                    ) : null}
                    {status === "download-in-progress" &&
                      progress?.percentage !== undefined &&
                      progress?.percentage > 0 && (
                        <Typography
                          fontSize="inherit"
                          component={Stack}
                          flexDirection="row"
                          gutterBottom
                          sx={{ fontSize: "12px" }}
                        >
                          {`Downloading Image...`}
                          <Box component="span" sx={{ marginLeft: "auto" }}>
                            {`${Math.floor(progress?.percentage ?? 0)}%`}
                          </Box>
                        </Typography>
                      )}
                    {status === "download-md5" && (
                      <Typography gutterBottom sx={{ fontSize: "12px" }}>
                        Checking MD5...
                      </Typography>
                    )}
                    {status === "install-untar" && (
                      <Typography gutterBottom sx={{ fontSize: "12px" }}>
                        Untar archive...
                      </Typography>
                    )}
                    {status === "install-dbus" && (
                      <Typography gutterBottom sx={{ fontSize: "12px" }}>
                        Triggering the update...
                      </Typography>
                    )}
                    {progress?.md5Error && (
                      <Alert severity="error">{progress?.md5Error}</Alert>
                    )}
                    {progress?.untarError && (
                      <Alert severity="error">{progress?.untarError}</Alert>
                    )}
                    {progress?.offlineUpdateError && (
                      <Alert severity="error">
                        {"An error has occurred while performing the update"}
                      </Alert>
                    )}
                    {status === "install-completed" &&
                      !progress?.offlineUpdateError && (
                        <Alert severity="success">
                          {
                            "OS updated successfully, system will reboot in minutes"
                          }
                        </Alert>
                      )}
                  </>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            {status === "download-in-progress" ? (
              <>
                <Button
                  variant="text"
                  color="secondary"
                  onClick={() => {
                    setOpen(false);
                  }}
                  sx={{ marginRight: "-20px" }}
                >
                  {"Continue in backgroud"}
                </Button>
              </>
            ) : status === "download-completed" && showInstallConfirm ? (
              <>
                <Button
                  variant="text"
                  color="secondary"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  {"Do it later"}
                </Button>
                <LoadingButton
                  variant="contained"
                  loading={primaryCtaLoading}
                  onClick={() => {
                    install();
                    setPrimaryCtaLoading(true);
                  }}
                  sx={{
                    fontFamily: "Roboto mono",
                    borderRadius: "32px",
                    fontSize: 16,
                    letterSpacing: "0.5px",
                    padding: "5px 20px",
                    fontWeight: 700,
                  }}
                >
                  {"ERASE OS AND UPDATE"}
                </LoadingButton>
              </>
            ) : status === "download-completed" ? (
              <>
                <Button
                  variant="text"
                  color="secondary"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  {"Do it later"}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setShowInstallConfirm(true)}
                >
                  {"Install now"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={status === "install-untar" ? "text" : "outlined"}
                  color={status === "install-untar" ? "secondary" : "inherit"}
                  onClick={() => setOpen(false)}
                  sx={{
                    marginRight:
                      status === "install-untar" ? "-20px" : undefined,
                  }}
                >
                  {status === "install-untar"
                    ? "Continue in backgroud"
                    : "cancel"}
                </Button>
                {status === "idle" || status === "download-expired" ? (
                  <LoadingButton
                    variant="contained"
                    loading={primaryCtaLoading}
                    onClick={() => {
                      download();
                      setPrimaryCtaLoading(true);
                    }}
                    sx={{
                      fontFamily: "Roboto mono",
                      borderRadius: "32px",
                      fontSize: 16,
                      letterSpacing: "0.5px",
                      padding: "5px 20px",
                      fontWeight: 700,
                    }}
                  >
                    {"Download"}
                  </LoadingButton>
                ) : null}
              </>
            )}
          </DialogActions>
          <DialogActions
            sx={{ flexDirection: "column", alignItems: "stretch" }}
          >
            {status === "idle" ||
            status === "download-expired" ||
            showInstallConfirm ? (
              <>
                <Box
                  component="hr"
                  sx={{ marginY: 2, width: "100%", opacity: 0.5 }}
                />
                <Typography variant="caption" marginBottom={2}>
                  {"Review the "}
                  <a href="https://docs.arduino.cc/tutorials/portenta-x8/x8-firmware-release-notes/">
                    {"Release notes"}
                  </a>
                  {" page to stay informed about the latest updates."}
                </Typography>
              </>
            ) : null}
          </DialogActions>
        </DarkDialog>
      </div>
    );
  } else {
    return (
      <div>
        {updatesButton}
        <DarkDialog
          onClose={() => setOpen(false)}
          aria-labelledby="customized-dialog-title"
          open={open}
          maxWidth="md"
        >
          <CustomDialogTitle
            id="customized-dialog-title"
            onClose={() => setOpen(false)}
          >
            {"Check for updates"}
          </CustomDialogTitle>

          <DialogContent>
            <Typography gutterBottom sx={{ fontWeight: 700 }}>
              Your Portenta X8 Operating System is already updated to the latest
              version
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={() => setOpen(false)}>
              CLOSE
            </Button>
          </DialogActions>
        </DarkDialog>
      </div>
    );
  }
}
