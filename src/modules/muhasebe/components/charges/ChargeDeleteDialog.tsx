"use client";

import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import type { ChargeItem } from "@/modules/muhasebe/types/MuhasebeCharge.types";

interface ChargeDeleteDialogProps {
  item: ChargeItem | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ChargeDeleteDialog({
  item,
  loading = false,
  onClose,
  onConfirm,
}: ChargeDeleteDialogProps) {
  return (
    <Dialog open={Boolean(item)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Taslak Tahakkuku Sil</DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary">
          <strong>{item?.unit}</strong> için oluşturulan taslak tahakkuku silmek
          istediğinize emin misiniz?
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Vazgeç</Button>

        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
          {loading ? "Siliniyor..." : "Sil"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}