"use client";

import React from "react";
import { alpha, Box, Stack, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";

type VerificationBadgeProps = {
  ok: boolean;
  icon: React.ReactNode;
  label: string;
  hint: string;
};

export default function VerificationBadge({
  ok,
  icon,
  label,
  hint,
}: VerificationBadgeProps) {
  const theme = useTheme<Theme>();
  const color = ok ? theme.palette.success.main : theme.palette.warning.main;

  return (
    <Box
      sx={{
        flex: 1,
        px: 1.45,
        py: 1.15,
        borderRadius: 3.25,
        border: `1px solid ${alpha(color, 0.18)}`,
        bgcolor: alpha(color, 0.06),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ display: "inline-flex", color }}>{icon}</Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={900}>
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {hint}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}