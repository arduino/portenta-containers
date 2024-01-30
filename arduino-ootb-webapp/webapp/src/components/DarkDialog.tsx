import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import { SvgClose } from "../assets/Close";

export const DarkDialog = styled(Dialog)(() => ({
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

export interface DarkDialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

export function DarkDialogTitle(props: DarkDialogTitleProps) {
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
