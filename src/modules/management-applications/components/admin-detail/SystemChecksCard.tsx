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
import {
  IconAlertTriangle,
  IconCheck,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import SectionCard from "./shared/SectionCard";

import {
  checkStatusLabelKey,
} from "../../utils/adminManagementApplication.utils";

import type {
  AdminApplicationCheckStatus,
  AdminApplicationSystemCheck,
} from "../../types/adminManagementApplication.types";

type SystemChecksCardProps = {
  checks: AdminApplicationSystemCheck[];
};

export default function SystemChecksCard({
  checks,
}: SystemChecksCardProps) {
  const { t } = useI18nNs("management-applications");

  return (
    <SectionCard
      title={t("admin.detail.systemChecks.title")}
      icon={<IconShieldCheck size={19} />}
    >
      <Stack spacing={1}>
        {checks.map((check) => (
          <SystemCheckRow
            key={check.id}
            check={check}
          />
        ))}
      </Stack>
    </SectionCard>
  );
}

function SystemCheckRow({
  check,
}: {
  check: AdminApplicationSystemCheck;
}) {
  const theme = useTheme<Theme>();

  const { t } = useI18nNs(
    "management-applications",
  );

  const color = getCheckColor(
    theme,
    check.status,
  );

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 3,
        border: `1px solid ${alpha(
          color,
          0.15,
        )}`,
        bgcolor: alpha(color, 0.035),
      }}
    >
      <Stack
        direction="row"
        spacing={1.1}
        alignItems="flex-start"
        justifyContent="space-between"
      >
        <Stack
          direction="row"
          spacing={1.1}
          alignItems="flex-start"
          sx={{ minWidth: 0 }}
        >
          <Box
            sx={{
              mt: 0.25,
              color,
            }}
          >
            {check.status === "passed" ? (
              <IconCheck size={17} />
            ) : check.status === "failed" ? (
              <IconX size={17} />
            ) : (
              <IconAlertTriangle size={17} />
            )}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={900}>
              {check.label}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {check.description}
            </Typography>
          </Box>
        </Stack>

        <Chip
          size="small"
          label={t(
            checkStatusLabelKey(
              check.status,
            ),
          )}
          sx={{
            fontWeight: 850,
            borderRadius: 999,
            bgcolor: alpha(color, 0.08),
            color,
            border: `1px solid ${alpha(
              color,
              0.16,
            )}`,
          }}
        />
      </Stack>
    </Box>
  );
}

function getCheckColor(
  theme: Theme,
  status: AdminApplicationCheckStatus,
) {
  if (status === "passed") {
    return theme.palette.success.main;
  }

  if (status === "failed") {
    return theme.palette.error.main;
  }

  return theme.palette.warning.main;
}