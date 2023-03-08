import * as React from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { SvgClose } from "../../assets/Close";
import {
  useCreateFirmwareDownloadMutation,
  useReadProgressQuery,
  //useReadProgressQuery,
  useReadUpdateAvailableQuery,
} from "../../services/firmware";
import {
  STATUS_IN_PROGRESS,
  STATUS_MD5,
  STATUS_TAR,
  STATUS_DBUS,
  STATUS_COMPLETED,
} from "../../utils/constants";
import ProgressBar from "../ProgressBar";

const CustomDialog = styled(Dialog)(() => ({
  //REMOVE AND USE NORMAL THEME - FIXME
  "& .MuiDialog-paper": {
    backgroundColor: "#000",
    border: "2px solid black",
  },
  "& .MuiDialogTitle-root": {
    backgroundColor: "#000",
  },
  "& .MuiDialogContent-root": {
    padding: "28px 60px 28px 60px !important",
    backgroundColor: "#000",
  },
  "& .MuiDialogActions-root": {
    padding: "0px 60px 12px 60px !important",
    backgroundColor: "#000",
    maxWidth: "100%",
  },
}));

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

export interface UpdateDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  updateAvailable?: string;
}

export default function UpdateDialog(props: UpdateDialogProps) {
  const { isOpen, handleClose } = props;
  const { data: updateAvailable, refetch: refetchAvailable } =
    useReadUpdateAvailableQuery();

  const [downloadingImage, setDownloadingImage] = React.useState(false);
  const [create] = useCreateFirmwareDownloadMutation();

  const { data: progress, refetch: refetchProgress } = useReadProgressQuery(
    undefined,
    {
      pollingInterval: 1000,
    }
  );

  function startDownloading() {
    setDownloadingImage(true);
    create();
  }

  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        refetchAvailable();
        refetchProgress();
        setDownloadingImage(false);
      }, 500);
    }
  }, [isOpen, refetchAvailable, refetchProgress]);

  // if (progress?.md5Error) {
  //   return (

  //   );
  // } else if (progress?.untarError) {
  //   return (

  //   );
  // } else if (progress?.offlineUpdateError) {
  //   return (

  //   );
  // }

  if (updateAvailable) {
    return (
      <div>
        <CustomDialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={isOpen}
          maxWidth="md"
        >
          <CustomDialogTitle id="customized-dialog-title" onClose={handleClose}>
            {"Updating OS"}
          </CustomDialogTitle>

          <DialogContent>
            {downloadingImage ? (
              <>
                <Typography gutterBottom>
                  Do not turn off your Portenta X8 or disconnect from the
                  network.
                </Typography>
                {progress && progress?.percentage > 0 && (
                  <ProgressBar percentage={progress?.percentage} />
                )}
                {progress?.status === STATUS_IN_PROGRESS &&
                  progress?.percentage > 0 && (
                    <Typography gutterBottom sx={{ fontSize: "12px" }}>
                      Downloading Image...
                    </Typography>
                  )}
                {progress?.status === STATUS_MD5 && (
                  <Typography gutterBottom sx={{ fontSize: "12px" }}>
                    Checking MD5...
                  </Typography>
                )}
                {progress?.status === STATUS_TAR && (
                  <Typography gutterBottom sx={{ fontSize: "12px" }}>
                    Untar archive...
                  </Typography>
                )}
                {progress?.status === STATUS_DBUS && (
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
                {progress?.status === STATUS_COMPLETED &&
                  !progress?.offlineUpdateError && (
                    <Alert severity="success">
                      {"OS updated successfully, system will reboot in minutes"}
                    </Alert>
                  )}
              </>
            ) : (
              <Typography gutterBottom sx={{ fontWeight: 700 }}>
                Do you want to update the latest version of the Operating
                System?
              </Typography>
            )}
          </DialogContent>
          {!downloadingImage && (
            <DialogActions>
              <Button
                sx={{
                  color: "#fff",
                  borderColor: "#fff",
                }}
                variant="outlined"
                onClick={() => {
                  handleClose();
                  setDownloadingImage(false);
                }}
              >
                Cancel
              </Button>
              <Button variant="contained" onClick={() => startDownloading()}>
                Update
              </Button>
            </DialogActions>
          )}
        </CustomDialog>
      </div>
    );
  } else {
    return (
      <div>
        <CustomDialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={isOpen}
          maxWidth="md"
        >
          <CustomDialogTitle id="customized-dialog-title" onClose={handleClose}>
            {"Check for updates"}
          </CustomDialogTitle>

          <DialogContent>
            <Typography gutterBottom sx={{ fontWeight: 700 }}>
              Your Portenta X8 Operating System is already updated to the latest
              version
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={handleClose}>
              CLOSE
            </Button>
          </DialogActions>
        </CustomDialog>
      </div>
    );
  }
}
