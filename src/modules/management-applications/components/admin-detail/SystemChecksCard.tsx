"use client";

import React from "react";

import {
  alpha,
  Box,
  Chip,
  Divider,
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

  const passedCount = checks.filter(
    (x) => x.status === "passed",
  ).length;

  return (
    <SectionCard
      title={t("admin.detail.systemChecks.title")}
      description={t("admin.detail.systemChecks.description")}
      icon={<IconShieldCheck size={19} />}
    >
      <Stack spacing={1.25}>
        <Box>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            {passedCount}/{checks.length}{" "}
            {t("admin.detail.systemChecks.completed")}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.35 }}
          >
            {t("admin.detail.systemChecks.summaryTitle")}
          </Typography>
        </Box>

        <Divider />

        {checks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t("admin.detail.systemChecks.empty")}
          </Typography>
        ) : (
          <Stack spacing={0}>
            {checks.map((check, index) => (
              <React.Fragment key={check.id}>
                <SystemCheckRow check={check} />

                {index !== checks.length - 1 ? <Divider /> : null}
              </React.Fragment>
            ))}
          </Stack>
        )}
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

  const { t } = useI18nNs("management-applications");

  const color = getCheckColor(theme, check.status);

  return (
    <Box sx={{ py: 1.25 }}>
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="flex-start"
        justifyContent="space-between"
      >
        <Stack
          direction="row"
          spacing={1.15}
          alignItems="flex-start"
          sx={{ minWidth: 0 }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              color,
              bgcolor: alpha(color, 0.08),
              border: `1px solid ${alpha(color, 0.16)}`,
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
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.35,
              }}
            >
              {check.label}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
                lineHeight: 1.55,
                wordBreak: "break-word",
              }}
            >
              {check.description}
            </Typography>
          </Box>
        </Stack>

        <Chip
          size="small"
          label={t(checkStatusLabelKey(check.status))}
          sx={{
            flexShrink: 0,
            fontWeight: 800,
            borderRadius: 999,
            color,
            bgcolor: alpha(color, 0.08),
            border: `1px solid ${alpha(color, 0.16)}`,
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