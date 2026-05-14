"use client";

import { Alert, Snackbar } from "@mui/material";
import { LocalizationManagerToastState } from "../../types/LocalizationManager.types";

type Props = {
  toast: LocalizationManagerToastState;
  onClose: () => void;
};

export default function LocalizationToast({ toast, onClose }: Props) {
  return (
    <Snackbar
      open={toast.open}
      autoHideDuration={3500}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity={toast.sev}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {toast.msg}
      </Alert>
    </Snackbar>
  );
}