
//src/modules/management-applications/components/create/SummaryPanel.tsx
//bu dosya, baÅŸvuru oluÅŸturma sÃ¼recinin son adÄ±mÄ±nda, kullanÄ±cÄ±nÄ±n girdiÄŸi bilgileri Ã¶zetleyen bir paneli temsil eder. Bu panel, kullanÄ±cÄ±nÄ±n baÅŸvurusunu gÃ¶ndermeden Ã¶nce bilgilerini gÃ¶zden geÃ§irmesine olanak tanÄ±r. Her bir bilgi Ã¶ÄŸesi, etiket ve deÄŸer Ã§iftleri olarak gÃ¶rÃ¼ntÃ¼lenir ve panel, gÃ¶rsel olarak Ã§ekici ve kullanÄ±cÄ± dostu olacak ÅŸekilde tasarlanmÄ±ÅŸtÄ±r.
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

const NS = "management-applications:managementApplication.create.summaryPanel";

export default function SummaryPanel({ items }: SummaryPanelProps) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs("management-applications");

  const tr = (key: string, fallback: string) => {
    const fullKey = `${NS}.${key}`;
    const value = t(fullKey);
    return value && value !== fullKey ? value : fallback;
  };

  return (
    <SectionCard
      icon={<IconCircleCheck size={19} />}
      title={tr("title", "BaÅŸvuru Ã¶zeti")}
      description={tr("description", "GÃ¶ndermeden Ã¶nce bilgilerinizi kontrol edin.")}
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
