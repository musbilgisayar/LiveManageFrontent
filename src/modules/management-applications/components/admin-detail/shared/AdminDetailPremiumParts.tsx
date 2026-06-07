// components/admin-detail/shared/AdminDetailPremiumParts.tsx
"use client";

import React from "react";

import {
  alpha,
  Box,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

type PremiumInfoItemProps = {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
};

export function PremiumCardBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <Box sx={{ position: "relative", overflow: "hidden" }}>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(
              circle at top right,
              ${alpha(theme.palette.primary.main, 0.12)},
              transparent 42%
            )
          `,
        }}
      />

      <Stack spacing={2.25} sx={{ position: "relative", zIndex: 1 }}>
        {children}
      </Stack>
    </Box>
  );
}

export function PremiumHero({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 4,
        background: `
          linear-gradient(
            135deg,
            ${alpha(theme.palette.primary.main, 0.14)},
            ${alpha(theme.palette.primary.light, 0.04)}
          )
        `,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        {icon}

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.2,
              wordBreak: "break-word",
            }}
          >
            {title || "-"}
          </Typography>

          {subtitle}
        </Box>
      </Stack>
    </Box>
  );
}

export function PremiumInfoGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
        },
        gap: 1.5,
      }}
    >
      {children}
    </Box>
  );
}

export function PremiumInfoItem({
  icon,
  label,
  value,
}: PremiumInfoItemProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.25,
        p: 1.5,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.72),
        backdropFilter: "blur(10px)",
        minWidth: 0,
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: alpha(theme.palette.primary.main, 0.24),
          boxShadow: `0 10px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          color: "primary.main",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 0.4,
            color: "text.secondary",
            fontWeight: 700,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.primary",
            fontWeight: 700,
            wordBreak: "break-word",
            lineHeight: 1.45,
          }}
        >
          {value === null || value === undefined || value === "" ? "-" : value}
        </Typography>
      </Box>
    </Box>
  );
}