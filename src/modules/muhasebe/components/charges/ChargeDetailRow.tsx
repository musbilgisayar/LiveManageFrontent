"use client";

import { Stack, Typography } from "@mui/material";

interface ChargeDetailRowProps {
  label: string;
  value: string;
}

export default function ChargeDetailRow({ label, value }: ChargeDetailRowProps) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Typography variant="body2" fontWeight={700} textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}