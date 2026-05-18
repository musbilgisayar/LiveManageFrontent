"use client";

import React from "react";

import {
  alpha,
  Box,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

import { useI18nNs } from "@/app/context/i18nContext";

import type {
  AdminManagementApplicationReviewSummary,
} from "../../types/adminManagementApplication.types";

type ReviewListHeroProps = {
  summary: AdminManagementApplicationReviewSummary;
};

export default function ReviewListHero({
  summary,
}: ReviewListHeroProps) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs("management-applications");

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 2.6,
        },
        borderRadius: 5,
        bgcolor: alpha(theme.palette.primary.main, 0.055),
        border: `1px solid ${alpha(
          theme.palette.primary.main,
          0.12,
        )}`,
      }}
    >
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack spacing={0.7}>
          <Typography variant="h4" fontWeight={950}>
            {t("admin.reviewList.title")}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              maxWidth: 760,
            }}
          >
            {t("admin.reviewList.description")}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
        >
          <SummaryChip
            label={t("admin.reviewList.summary.total")}
            value={summary.total}
          />

          <SummaryChip
            label={t("admin.reviewList.summary.pending")}
            value={summary.pending}
          />

          <SummaryChip
            label={t("admin.reviewList.summary.inReview")}
            value={summary.inReview}
          />

          <SummaryChip
            label={t("admin.reviewList.summary.missing")}
            value={summary.missing}
          />

          <SummaryChip
            label={t("admin.reviewList.summary.critical")}
            value={summary.critical}
          />
        </Stack>
      </Stack>
    </Box>
  );
}

function SummaryChip({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <Chip
      label={`${label}: ${value}`}
      size="small"
      sx={{
        borderRadius: 999,
        fontWeight: 850,
      }}
    />
  );
}