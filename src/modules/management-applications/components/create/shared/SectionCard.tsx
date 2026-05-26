"use client";

import React from "react";
import { alpha, Box, Stack, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";

type SectionCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
};

export default function SectionCard({
  icon,
  title,
  description,
  children,
}: SectionCardProps) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        p: { xs: 2.25, md: 2.75 },
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.96),
        boxShadow: `0 18px 46px ${alpha("#0f172a", 0.055)}`,
        transition: "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.045,
          )} 0%, transparent 42%)`,
        },
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: alpha(theme.palette.primary.main, 0.22),
          boxShadow: `0 22px 58px ${alpha("#0f172a", 0.075)}`,
        },
      }}
    >
      <Stack spacing={2.4} sx={{ position: "relative", zIndex: 1 }}>
        <Stack direction="row" spacing={1.45} alignItems="flex-start">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.09),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              boxShadow: `0 10px 22px ${alpha(theme.palette.primary.main, 0.1)}`,
              "& svg": {
                width: 20,
                height: 20,
                strokeWidth: 1.9,
              },
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: 15.5, md: 16.5 },
                letterSpacing: "-0.02em",
                color: theme.palette.text.primary,
                lineHeight: 1.25,
              }}
            >
              {title}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.45,
                maxWidth: 820,
                fontSize: 13.2,
                fontWeight: 500,
                lineHeight: 1.6,
              }}
            >
              {description}
            </Typography>
          </Box>
        </Stack>

        <Box>{children}</Box>
      </Stack>
    </Box>
  );
}