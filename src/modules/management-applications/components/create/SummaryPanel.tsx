"use client";

import { alpha, Box, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconCircleCheck } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import SectionCard from "./shared/SectionCard";

type SummaryPanelProps = {
  items: Array<{
    label: string;
    value: string;
  }>;
};

const NS = "property:managementApplication.create.summaryPanel";

export default function SummaryPanel({ items }: SummaryPanelProps) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs(["property"]);

  const tr = (key: string, fallback: string) => {
    const fullKey = `${NS}.${key}`;
    const value = t(fullKey);
    return value && value !== fullKey ? value : fallback;
  };

  return (
    <SectionCard
      icon={<IconCircleCheck size={19} />}
      title={tr("title", "Başvuru özeti")}
      description={tr("description", "Göndermeden önce bilgilerinizi kontrol edin.")}
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
              p: 1.35,
              borderRadius: 3.25,
              border: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
              bgcolor: alpha(theme.palette.background.default, 0.28),
              transition: "all 160ms ease",
              "&:hover": {
                borderColor: alpha(theme.palette.primary.main, 0.22),
                bgcolor: alpha(theme.palette.primary.main, 0.025),
              },
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={850}>
              {item.label}
            </Typography>

            <Typography fontWeight={950} mt={0.25} sx={{ fontSize: 14 }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
}