"use client";

import { alpha, Box, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconCircleCheck } from "@tabler/icons-react";

import SectionCard from "./shared/SectionCard";

type SummaryPanelProps = {
  items: Array<{
    label: string;
    value: string;
  }>;
};

export default function SummaryPanel({ items }: SummaryPanelProps) {
  const theme = useTheme<Theme>();

  return (
    <SectionCard
      icon={<IconCircleCheck size={19} />}
      title="Başvuru özeti"
      description="Göndermeden önce bilgilerinizi kontrol edin."
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 1.25,
        }}
      >
        {items.map((item) => (
          <Box
            key={item.label}
            sx={{
              p: 1.3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
              bgcolor: alpha(theme.palette.background.default, 0.28),
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              {item.label}
            </Typography>

            <Typography fontWeight={900} mt={0.25} sx={{ fontSize: 14 }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
}