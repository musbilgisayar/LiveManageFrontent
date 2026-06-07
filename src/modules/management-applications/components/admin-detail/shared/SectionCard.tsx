"use client";

import React from "react";

import {
  alpha,
  Box,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import type { Theme } from "@mui/material/styles";

type SectionCardProps = {
  title: string;
  icon: React.ReactNode;
  description?: string;
  children: React.ReactNode;
};

export default function SectionCard({
  title,
  icon,
  description,
  children,
}: SectionCardProps) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        position: "relative",
        p: { xs: 2, md: 2.25 },
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
        bgcolor: theme.palette.background.paper,
        boxShadow: `0 10px 26px ${alpha("#0f172a", 0.035)}`,
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: alpha(theme.palette.primary.main, 0.72),
        },
      }}
    >
      <Stack spacing={1.75}>
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              "& svg": {
                width: 19,
                height: 19,
                strokeWidth: 1.9,
              },
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: 15, md: 15.5 },
                letterSpacing: "-0.015em",
                color: "text.primary",
                lineHeight: 1.25,
              }}
            >
              {title}
            </Typography>

            {description ? (
              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.35,
                  maxWidth: 860,
                  fontSize: 12.8,
                  fontWeight: 500,
                  lineHeight: 1.55,
                }}
              >
                {description}
              </Typography>
            ) : null}
          </Box>
        </Stack>

        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.85) }} />

        <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
      </Stack>
    </Box>
  );
}