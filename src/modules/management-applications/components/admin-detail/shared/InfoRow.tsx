"use client";

import React from "react";

import {
  alpha,
  Box,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import type { Theme } from "@mui/material/styles";

type InfoRowProps = {
  label: string;
  value?: string | number | null;
  wide?: boolean;
};

export default function InfoRow({
  label,
  value,
  wide,
}: InfoRowProps) {
  const theme = useTheme<Theme>();

  const normalizedValue =
    value === null ||
    value === undefined ||
    value === ""
      ? "Belirtilmedi"
      : value;

  return (
    <Box
      sx={{
        px: 1.25,
        py: 1.1,

        borderRadius: 2,

        border: `1px solid ${alpha(
          theme.palette.divider,
          0.8,
        )}`,

        bgcolor: alpha(
          theme.palette.background.paper,
          0.68,
        ),

        transition:
          "border-color 160ms ease, background-color 160ms ease",

        "&:hover": {
          borderColor: alpha(
            theme.palette.primary.main,
            0.16,
          ),

          bgcolor: alpha(
            theme.palette.primary.main,
            0.018,
          ),
        },
      }}
    >
      <Stack
        direction={wide ? "column" : "row"}
        justifyContent="space-between"
        alignItems={
          wide ? "flex-start" : "center"
        }
        spacing={wide ? 0.7 : 2}
      >
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: 12.4,
            fontWeight: 700,
            lineHeight: 1.35,
            letterSpacing: 0.15,
            flexShrink: 0,
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            color:
              normalizedValue === "Belirtilmedi"
                ? theme.palette.text.secondary
                : theme.palette.text.primary,

            fontWeight:
              normalizedValue === "Belirtilmedi"
                ? 600
                : 800,

            fontSize: 14.2,

            lineHeight: 1.45,

            textAlign: wide
              ? "left"
              : "right",

            wordBreak: "break-word",

            fontStyle:
              normalizedValue === "Belirtilmedi"
                ? "italic"
                : "normal",
          }}
        >
          {normalizedValue}
        </Typography>
      </Stack>
    </Box>
  );
}