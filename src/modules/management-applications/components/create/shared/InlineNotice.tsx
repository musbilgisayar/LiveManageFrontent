"use client";

import React from "react";
import { alpha, Box, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";

type InlineNoticeProps = {
  children: React.ReactNode;
  tone: "info" | "warning";
};

export default function InlineNotice({ children, tone }: InlineNoticeProps) {
  const theme = useTheme<Theme>();
  const color =
    tone === "warning" ? theme.palette.warning.main : theme.palette.info.main;

  return (
    <Box
      sx={{
        p: 1.3,
        borderRadius: 3.25,
        bgcolor: alpha(color, 0.065),
        border: `1px solid ${alpha(color, 0.16)}`,
      }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        {children}
      </Typography>
    </Box>
  );
}