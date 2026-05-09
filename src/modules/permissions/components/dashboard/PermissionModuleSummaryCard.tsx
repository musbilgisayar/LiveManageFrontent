// src/modules/permissions/components/dashboard/PermissionModuleSummaryCard.tsx

"use client";

import {
  alpha,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import {
  IconHierarchy,
  IconShieldLock,
  IconWorld,
  IconUser,
  IconBuildingCommunity,
} from "@tabler/icons-react";

import type {
  PermissionModuleSummaryDto,
  TranslateFn,
} from "../../types/Permission.types";

type Props = {
  module: PermissionModuleSummaryDto;
  locale: string;
  t: TranslateFn;
};

export default function PermissionModuleSummaryCard({
  module,
  t,
}: Props) {
  const theme = useTheme();

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };

  const sensitiveRatio =
    module.totalPermissions <= 0
      ? 0
      : (module.sensitivePermissions / module.totalPermissions) * 100;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 3,
        transition: "all .2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent>
        <Stack spacing={2.5}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {tr(
                  module.displayNameKey,
                  module.fallbackDisplayName
                )}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {module.module}
              </Typography>
            </Stack>

            <Chip
              icon={<IconHierarchy size={14} />}
              label={module.totalPermissions}
              sx={{
                fontWeight: 800,
              }}
            />
          </Stack>

          <Divider />

          <Stack spacing={1.5}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <IconShieldLock
                  size={18}
                  color={theme.palette.warning.main}
                />

                <Typography variant="body2">
                  {tr(
                    "permissions:dashboard.cards.sensitivePermissions",
                    "Hassas Permission"
                  )}
                </Typography>
              </Stack>

              <Typography
                variant="body2"
                sx={{ fontWeight: 800 }}
              >
                {module.sensitivePermissions}
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={sensitiveRatio}
              sx={{
                height: 8,
                borderRadius: 999,
                backgroundColor: alpha(
                  theme.palette.warning.main,
                  0.12
                ),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                },
              }}
            />
          </Stack>

          <Divider />

          <Stack spacing={1.25}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <IconBuildingCommunity
                  size={16}
                  color={theme.palette.primary.main}
                />

                <Typography variant="body2">
                  tenant
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {module.tenantScoped}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <IconUser
                  size={16}
                  color={theme.palette.success.main}
                />

                <Typography variant="body2">
                  self
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {module.selfScoped}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <IconWorld
                  size={16}
                  color={theme.palette.info.main}
                />

                <Typography variant="body2">
                  global
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {module.globalScoped}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}