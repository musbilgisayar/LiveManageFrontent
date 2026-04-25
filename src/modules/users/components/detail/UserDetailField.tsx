//src/modules/users/components/detail/UserDetailField.tsx
"use client";

import { Stack, Typography } from "@mui/material";

type Props = {
  label: string;
  value: string;
};

export default function UserDetailField({ label, value }: Props) {
  return (
    <Stack spacing={0.5} sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}