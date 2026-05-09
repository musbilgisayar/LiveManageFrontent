"use client";

import React from "react";

import {
  alpha,
  Chip,
  useTheme,
} from "@mui/material";

import type { Theme } from "@mui/material/styles";

type MetaChipProps = {
  label: string;
};

export default function MetaChip({
  label,
}: MetaChipProps) {
  const theme = useTheme<Theme>();

  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      sx={{
        fontWeight: 800,
        bgcolor: alpha(
          theme.palette.background.paper,
          0.72,
        ),
      }}
    />
  );
}