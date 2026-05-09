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
        p: { xs: 2, md: 2.35 },
        borderRadius: 4.5,
        border: `1px solid ${alpha(theme.palette.divider, 0.72)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.84),
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.032)",
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography fontWeight={900} fontSize={16}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.25}>
              {description}
            </Typography>
          </Box>
        </Stack>

        {children}
      </Stack>
    </Box>
  );
}