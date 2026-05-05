"use client";

import { Card, CardContent, Typography } from "@mui/material";

interface ChargePreviewCardProps {
  title: string;
  value: string | number;
}

export default function ChargePreviewCard({ title, value }: ChargePreviewCardProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={800}
          textTransform="uppercase"
        >
          {title}
        </Typography>

        <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}