"use client";

import React from "react";
import { Card, CardContent, Stack, TextField, Typography } from "@mui/material";

type LocalizationSelectedKeyCardProps = {
  namespace: string;
  fullKey: string;
  t: (key: string) => string;
};

export default function LocalizationSelectedKeyCard({
  namespace,
  fullKey,
  t,
}: LocalizationSelectedKeyCardProps) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t("localization:detail.selectedKey.title") || "Seçili Anahtar"}
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label={t("localization:detail.fields.namespace") || "Namespace"}
            value={namespace}
            size="small"
            InputProps={{ readOnly: true }}
          />

          <TextField
            label={t("localization:detail.fields.key") || "Key"}
            value={fullKey}
            size="small"
            InputProps={{ readOnly: true }}
            sx={{ flex: 1 }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}