import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { SvgClose } from "../../assets/Close";
import {
  useDownloadFirmwareMutation,
  useInstallFirmwareMutation,
  useReadProgressQuery,
  //useReadProgressQuery,
  useReadUpdateAvailableQuery,
} from "../../services/firmware";
import { mobileMQ } from "../../theme";
import { DarkDialog } from "../DarkDialog";
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
  const { data: updateAvailable } = useReadUpdateAvailableQuery();

  // const [downloadingImage, setDownloadingImage] = React.useState(false);
  const [download] = useDownloadFirmwareMutation();
  const [install] = useInstallFirmwareMutation();

  const { data: progress } = useReadProgressQuery(undefined, {
    pollingInterval: 500,
  });

  const status = progress?.status;

  if (updateAvailable) {
    return (
      <div>
        {updateAvailable ? (
          <Button
            onClick={() => setOpen(true)}
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
            {status === "idle" || status === "download-expired"
              ? "CHECK FOR UPDATES"
              : status === "download-in-progress"
                ? `DOWNLOADING UPDATE... ${Math.floor(
                    progress?.percentage ?? 0,
                  )}%`
                : status === "install-completed"
                  ? "Install update"
                  : status === "install-dbus" ||
                      status === "install-untar" ||
                      status === "install-in-progress"
                    ? "Installing update..."
                    : ""}
          </Button>
        ) : null}
        <DarkDialog
          aria-labelledby="customized-dialog-title"
          open={open}
          maxWidth="sm"
        >
          <CustomDialogTitle
            id="customized-dialog-title"
            onClose={() => setOpen(false)}
          >
            {"Updating OS"}
          </CustomDialogTitle>
          <DialogContent>
            {status === "idle" || status === "download-expired" ? (
              <Typography gutterBottom sx={{ fontWeight: 700 }}>
                Do you want to update the latest version of the Operating
                System?
              </Typography>
            ) : (
              <>
                {status === "download-in-progress" ? (
                  <Typography gutterBottom>
                    Do not turn off your Portenta X8 or disconnect from the
                    network.
                  </Typography>
                ) : null}
                {status === "download-completed" ? (
                  <Typography gutterBottom>
                    {
                      "Update download finalized. The device will restart automatically to install the update in"
                    }
                    <Typography component="span" fontWeight={700}>
                      30
                    </Typography>
                    {" seconds."}
                    <Typography fontWeight={700}>
                      Do not turn off your Portenta X8 in the process.
                    </Typography>
                  </Typography>
                ) : null}
                {status === "download-in-progress" &&
                  progress &&
                  progress?.percentage > 0 && (
                    <ProgressBar percentage={progress?.percentage} />
                  )}
                {status === "download-in-progress" &&
                  progress?.percentage !== undefined &&
                  progress?.percentage > 0 && (
                    <Typography gutterBottom sx={{ fontSize: "12px" }}>
                      Downloading Image...
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
                      {"OS updated successfully, system will reboot in minutes"}
                    </Alert>
                  )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            {status === "download-in-progress" ? (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  {"Continue in backgroud"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  sx={{
                    color: "#fff",
                    borderColor: "#fff",
                  }}
                  variant="outlined"
                  onClick={() => setOpen(false)}
                >
                  {status === "download-completed" ? "cancel" : "Do it later"}
                </Button>
                {status === "download-completed" ? (
                  <Button variant="contained" onClick={() => install()}>
                    {"Install now"}
                  </Button>
                ) : status === "idle" || status === "download-expired" ? (
                  <Button variant="contained" onClick={() => download()}>
                    {"Download"}
                  </Button>
                ) : null}
              </>
            )}
          </DialogActions>
          <DialogActions
            sx={{ flexDirection: "column", alignItems: "stretch" }}
          >
            {status === "idle" || status === "download-expired" ? (
              <>
                <Box component="hr" sx={{ marginY: 2, width: "100%" }} />
                <Typography variant="body2" marginBottom={1}>
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
