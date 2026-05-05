"use client";

import React from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import type { ChargeItem } from "@/modules/muhasebe/types/MuhasebeCharge.types";

interface ChargeCancelDialogProps {
  item: ChargeItem | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ChargeCancelDialog({
  item,
  loading = false,
  onClose,
  onConfirm,
}: ChargeCancelDialogProps) {
  return (
    <Dialog open={Boolean(item)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Tahakkuku İptal Et</DialogTitle>

      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Kesinleşmiş kayıt silinmez. İptal edilerek audit izi korunur.
        </Alert>

        <Typography variant="body2" color="text.secondary">
          <strong>{item?.unit}</strong> tahakkukunu iptal etmek istediğinize emin
          misiniz?
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Vazgeç</Button>

        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
          {loading ? "İptal ediliyor..." : "İptal Et"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}