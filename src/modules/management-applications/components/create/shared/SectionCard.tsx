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
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.64)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.94),
        boxShadow: "0 8px 22px rgba(15, 23, 42, 0.028)",
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
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
            <Typography
              variant="body2"
              color="text.secondary"
              mt={0.35}
              sx={{
                maxWidth: 780,
                fontSize: 13.25,
                fontWeight: 500,
                lineHeight: 1.55,
              }}
            >
              {description}
            </Typography>
          </Box>
        </Stack>

        {children}
      </Stack>
    </Box>
  );
}
