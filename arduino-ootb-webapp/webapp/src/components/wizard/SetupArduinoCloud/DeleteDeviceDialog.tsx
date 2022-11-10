import * as React from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";

interface DeleteDeviceDialogProps {
  onDelete: () => void;
  loading: boolean;
}

export default function DeleteDeviceDialog(props: DeleteDeviceDialogProps) {
  const { onDelete, loading } = props;
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    onDelete();
    handleClose();
  };

  return (
    <>
      <Button variant="contained" color="error" onClick={handleClickOpen}>
        {"Delete"}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Arduino Cloud API"}
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: (theme) => theme.spacing(1),
              width: 26,
              height: 26,
              padding: 1,
              fontSize: 14,
            }}
          >
            {"✕"}
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#202020" }}>
          <Box sx={{ maxWidth: 382, margin: "auto", paddingY: 3.5 }}>
            <DialogContentText
              id="alert-dialog-description"
              sx={{
                fontWeight: 700,
                color: "#fff",
                marginBottom: 2,
                fontSize: "20px",
              }}
            >
              Are you sure you want to delete the Arduino Cloud API key
              associated with this device?
            </DialogContentText>
            <DialogContentText sx={{ color: "#fff", fontSize: 16 }}>
              You won’t be able to use your Portenta X8 with Arduino Cloud IoT
              anymore, unless another Arduino Cloud API key is provided to the
              device.
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions>
          <Box>
            <Button
              onClick={handleClose}
              color="inherit"
              autoFocus
              sx={{ marginRight: 1 }}
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={handleDelete}
              variant="contained"
              color="error"
              loading={loading}
            >
              Delete
            </LoadingButton>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}
