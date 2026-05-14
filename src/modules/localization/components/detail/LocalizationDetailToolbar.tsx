"use client";

import React from "react";
import { Box, Button, Toolbar } from "@mui/material";

type LocalizationDetailToolbarProps = {
  t: (key: string) => string;
  onBack: () => void;
  onOpenCreateDialog: () => void;
};

export default function LocalizationDetailToolbar({
  t,
  onBack,
  onOpenCreateDialog,
}: LocalizationDetailToolbarProps) {
  return (
    <Toolbar
      disableGutters
      sx={{ mb: 2, gap: 2, flexWrap: "wrap", alignItems: "center" }}
    >
      <Button variant="outlined" onClick={onBack}>
        {t("localization:detail.actions.backToList") ||
          "← Listeye Dön"}
      </Button>

      <Box sx={{ flex: 1 }} />

      <Button variant="contained" onClick={onOpenCreateDialog}>
        {t("localization:detail.actions.addNewKey") ||
          "Yeni Anahtar Ekle"}
      </Button>
    </Toolbar>
  );
}