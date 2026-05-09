"use client";

import React from "react";

import {
  alpha,
  Box,
  Typography,
  useTheme,
} from "@mui/material";

import type { Theme } from "@mui/material/styles";

type InfoBoxProps = {
  label: string;
  value: string;
};

export default function InfoBox({
  label,
  value,
}: InfoBoxProps) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 3,
        border: `1px solid ${alpha(
          theme.palette.text.primary,
          0.08,
        )}`,
        bgcolor: alpha(
          theme.palette.text.primary,
          0.018,
        ),
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={800}
      >
        {label}
      </Typography>

      <Typography
        fontWeight={900}
        sx={{ mt: 0.25 }}
      >
        {value}
      </Typography>
    </Box>
  );
}