// src/modules/permissions/components/dashboard/PermissionRecentChangesCard.tsx

"use client";

import {
  alpha,
  Avatar,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import {
  IconCheck,
  IconRefresh,
  IconShieldMinus,
  IconShieldPlus,
} from "@tabler/icons-react";

import type {
  PermissionRecentChangeDto,
  TranslateFn,
} from "../../types/Permission.types";

type Props = {
  changes: PermissionRecentChangeDto[];
  locale: string;
  t: TranslateFn;
};

export default function PermissionRecentChangesCard({
  changes,
  locale,
  t,
}: Props) {
  const theme = useTheme();

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };

  const getActionConfig = (
    action: PermissionRecentChangeDto["action"]
  ) => {
    switch (action) {
      case "granted":
        return {
          icon: IconShieldPlus,
          color: theme.palette.success.main,
          label: tr(
            "permissions:recentChanges.actions.granted",
            "Permission Verildi"
          ),
        };

      case "revoked":
        return {
          icon: IconShieldMinus,
          color: theme.palette.error.main,
          label: tr(
            "permissions:recentChanges.actions.revoked",
            "Permission Kaldırıldı"
          ),
        };

      case "synced":
        return {
          icon: IconRefresh,
          color: theme.palette.info.main,
          label: tr(
            "permissions:recentChanges.actions.synced",
            "Permission Senkronize Edildi"
          ),
        };

      default:
        return {
          icon: IconCheck,
          color: theme.palette.primary.main,
          label: tr(
            "permissions:recentChanges.actions.seeded",
            "Permission Seed İşlemi"
          ),
        };
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(locale || "tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent>
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {tr(
                "permissions:dashboard.sections.recentChanges",
                "Son Permission Değişiklikleri"
              )}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {tr(
                "permissions:recentChanges.description",
                "Sistemde gerçekleşen son permission operasyonları"
              )}
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            {changes.map((change, index) => {
              const config = getActionConfig(change.action);
              const Icon = config.icon;

              return (
                <Stack key={change.id} spacing={2}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
                  >
                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,
                        backgroundColor: alpha(config.color, 0.12),
                        color: config.color,
                      }}
                    >
                      <Icon size={20} />
                    </Avatar>

                    <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        justifyContent="space-between"
                        alignItems={{
                          xs: "flex-start",
                          sm: "center",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 800,
                            wordBreak: "break-word",
                          }}
                        >
                          {change.permissionCode}
                        </Typography>

                        <Chip
                          size="small"
                          label={config.label}
                          sx={{
                            fontWeight: 700,
                            color: config.color,
                            backgroundColor: alpha(
                              config.color,
                              0.12
                            ),
                          }}
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {change.actorName}
                        {" • "}
                        {change.targetName}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatDate(change.occurredAtUtc)}
                      </Typography>

                      {change.correlationId ? (
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "monospace",
                            color: theme.palette.text.secondary,
                          }}
                        >
                          {change.correlationId}
                        </Typography>
                      ) : null}
                    </Stack>
                  </Stack>

                  {index < changes.length - 1 ? (
                    <Divider />
                  ) : null}
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}