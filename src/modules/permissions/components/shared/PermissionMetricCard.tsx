// src/modules/permissions/components/shared/PermissionMetricCard.tsx

"use client";

import { alpha, Box, Card, CardContent, Chip, Stack, Typography, useTheme } from "@mui/material";
import {
  IconAlertTriangle,
  IconCheck,
  IconKey,
  IconShieldLock,
} from "@tabler/icons-react";

import type { TranslateFn } from "../../types/Permission.types";
import type { PermissionDashboardMetric } from "../../hooks/usePermissionDashboard";

type Props = {
  metric: PermissionDashboardMetric;
  locale: string;
  t: TranslateFn;
};

export default function PermissionMetricCard({ metric, t }: Props) {
  const theme = useTheme();

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };

  const color =
    metric.severity === "success"
      ? theme.palette.success.main
      : metric.severity === "warning"
        ? theme.palette.warning.main
        : metric.severity === "error"
          ? theme.palette.error.main
          : metric.severity === "info"
            ? theme.palette.info.main
            : theme.palette.primary.main;

  const Icon =
    metric.severity === "success"
      ? IconCheck
      : metric.severity === "warning"
        ? IconAlertTriangle
        : metric.severity === "error"
          ? IconShieldLock
          : IconKey;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 3,
        borderColor: alpha(color, 0.24),
        background: `linear-gradient(135deg, ${alpha(color, 0.10)} 0%, ${alpha(
          theme.palette.background.paper,
          0.96
        )} 52%)`,
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                color,
                backgroundColor: alpha(color, 0.12),
              }}
            >
              <Icon size={23} />
            </Box>

            <Chip
              size="small"
              label={metric.value.toLocaleString()}
              sx={{
                fontWeight: 800,
                color,
                backgroundColor: alpha(color, 0.1),
              }}
            />
          </Stack>

          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {metric.value.toLocaleString()}
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {tr(metric.labelKey, metric.fallbackLabel)}
            </Typography>

            {metric.helperKey && metric.fallbackHelper ? (
              <Typography variant="body2" color="text.secondary">
                {tr(metric.helperKey, metric.fallbackHelper)}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}