// src/modules/management-applications/components/create/upload/DocumentRequirementProgress.tsx
"use client";

import {
  alpha,
  Box,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconChecklist } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import type {
  DocumentRequirement,
  RequiredDocumentKind,
} from "../../../types/managementApplication.types";

type DocumentRequirementProgressProps = {
  requirements: DocumentRequirement[];
  uploadedKindCounts: Record<RequiredDocumentKind, number>;
};

const I18N_PREFIX = "management-applications";

const KEYS = {
  title: "management-applications:create.documentUploader.progress.title",
  subtitle: "management-applications:create.documentUploader.progress.subtitle",
} as const;

export default function DocumentRequirementProgress({
  requirements,
  uploadedKindCounts,
}: DocumentRequirementProgressProps) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs(I18N_PREFIX);

  const tr = (fullKey: string, fallback: string) => {
    const value = t(fullKey);

    if (!value) return fallback;
    if (value === fullKey) return fallback;
    if (value === `[${fullKey}]`) return fallback;

    return value;
  };

  const requiredItems = requirements.filter((item) => item.required);

  const completedCount = requiredItems.filter(
    (item) => (uploadedKindCounts?.[item.kind] ?? 0) > 0,
  ).length;

  const totalCount = requiredItems.length;

  const percent =
    totalCount === 0
      ? 100
      : Math.round((completedCount / totalCount) * 100);

  const subtitleText = tr(
    KEYS.subtitle,
    "{completed} / {total} zorunlu belge tamamlandı",
  )
    .replace("{completed}", String(completedCount))
    .replace("{total}", String(totalCount));

  return (
    <Box
      sx={{
        p: 1.6,
        borderRadius: 4,
        border: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.16),
        bgcolor: alpha(theme.palette.primary.main, 0.035),
        boxShadow: `0 14px 36px ${alpha(
          theme.palette.common.black,
          theme.palette.mode === "dark" ? 0.22 : 0.045,
        )}`,
      }}
    >
      <Stack spacing={1.2}>
        <Stack
          direction="row"
          spacing={1.2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2.3,
                display: "grid",
                placeItems: "center",
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.09),
              }}
            >
              <IconChecklist size={18} />
            </Box>

            <Box>
              <Typography fontWeight={950} sx={{ fontSize: 14 }}>
                {tr(KEYS.title, "Belge tamamlama durumu")}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {subtitleText}
              </Typography>
            </Box>
          </Stack>

          <Typography
            fontWeight={950}
            color="primary.main"
            sx={{
              fontSize: 18,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            %{percent}
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            height: 9,
            borderRadius: 999,
            bgcolor: alpha(theme.palette.primary.main, 0.08),

            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
            },
          }}
        />
      </Stack>
    </Box>
  );
}