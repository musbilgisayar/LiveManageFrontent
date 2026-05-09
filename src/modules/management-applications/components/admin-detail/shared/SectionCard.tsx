"use client";

import React from "react";

import {
  alpha,
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import type { Theme } from "@mui/material/styles";

type SectionCardProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

export default function SectionCard({
  title,
  icon,
  children,
}: SectionCardProps) {
  const theme = useTheme<Theme>();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4.5,
        borderColor: alpha(theme.palette.text.primary, 0.08),
        bgcolor: alpha(theme.palette.background.paper, 0.86),
      }}
    >
      <CardContent sx={{ p: 2.35 }}>
        <Stack spacing={1.75}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.6,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            >
              {icon}
            </Box>

            <Typography fontWeight={950}>
              {title}
            </Typography>
          </Stack>

          <Divider />

          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}