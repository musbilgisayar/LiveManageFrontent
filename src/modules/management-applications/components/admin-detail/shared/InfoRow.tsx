"use client";

import React from "react";

import {
  Stack,
  Typography,
} from "@mui/material";

type InfoRowProps = {
  label: string;
  value: string;
  wide?: boolean;
};

export default function InfoRow({
  label,
  value,
  wide,
}: InfoRowProps) {
  return (
    <Stack
      direction={wide ? "column" : "row"}
      justifyContent="space-between"
      spacing={wide ? 0.35 : 1}
    >
      <Typography color="text.secondary">
        {label}
      </Typography>

      <Typography
        fontWeight={850}
        textAlign={wide ? "left" : "right"}
      >
        {value}
      </Typography>
    </Stack>
  );
}