"use client";

import React from "react";
import { Box, Stack, TextField, Typography } from "@mui/material";

import type { LanguageItem } from "@/modules/localization/services/localizationService";

type LocalizationLanguageRowProps = {
  language: LanguageItem;
  value: string;
  label: string;
  defaultLabel: string;
  onChange: (culture: string, value: string) => void;
};

export default function LocalizationLanguageRow({
  language,
  value,
  label,
  defaultLabel,
  onChange,
}: LocalizationLanguageRowProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems="center"
    >
      <Box sx={{ width: 220, display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 20, marginRight: 8 }}>
          {language.flagEmoji ?? "🏳️"}
        </span>

        <div>
          <Typography variant="subtitle2">{language.name}</Typography>

          <Typography variant="caption" color="text.secondary">
            {language.cultureCode}
            {language.isDefault ? ` • ${defaultLabel}` : ""}
          </Typography>
        </div>
      </Box>

      <TextField
        fullWidth
        size="small"
        label={label}
        value={value}
        onChange={(event) => onChange(language.cultureCode, event.target.value)}
      />
    </Stack>
  );
}