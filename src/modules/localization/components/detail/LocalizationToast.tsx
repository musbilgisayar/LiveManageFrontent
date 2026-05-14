"use client";

import React from "react";
import { Alert, Snackbar } from "@mui/material";

import type { LocalizationToastState } from "@/modules/localization/types/LocalizationDetail.types";

type LocalizationToastProps = {
  toast: LocalizationToastState;
  onClose: () => void;
};

export default function LocalizationToast({
  toast,
  onClose,
}: LocalizationToastProps) {
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