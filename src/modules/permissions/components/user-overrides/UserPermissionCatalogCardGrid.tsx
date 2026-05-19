"use client";

import {
  alpha,
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Grid,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";

import {
  IconKey,
  IconShieldCheck,
  IconShieldOff,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import type { UserPermissionCatalogRow } from "../../types/UserPermissionOverride.types";

import { getSafePermissionText } from "../../utils/userPermissionOverride.utils";

interface Props {
  rows: UserPermissionCatalogRow[];
  disabled: boolean;
  savingPermissionId: string | null;

  selectedPermissionIds?: string[];

  onToggleSelection?: (permissionId: string) => void;

  onToggle: (
    row: UserPermissionCatalogRow,
    nextChecked: boolean,
  ) => void;
}

function getShortTitle(row: UserPermissionCatalogRow): string {
  const display =
    getSafePermissionText(row.displayName) ||
    getSafePermissionText(row.description);

  if (display && !display.includes(":")) {
    return display;
  }

  const parts = row.permissionCode.split(".");
  const action = parts.slice(-2).join(".");

  return action || row.permissionCode;
}

function getLevelLabel(row: UserPermissionCatalogRow): string {
  const level = String(row.level ?? "");

  if (level === "1") return "View";
  if (level === "2") return "Write";
  if (level === "3") return "Critical";
  if (level === "4") return "Sensitive";

  return level || "Permission";
}

export default function UserPermissionCatalogCardGrid({
  rows,
  disabled,
  savingPermissionId,

  selectedPermissionIds = [],
  onToggleSelection,

  onToggle,
}: Props) {
  const theme = useTheme();

  const { t } = useI18nNs(["permission", "permissions"]);

  const isDark = theme.palette.mode === "dark";

  const tr = (key: string, fallback: string): string => {
    const value = t(key);

    return !value || value === key || value === `[${key}]`
      ? fallback
      : value;
  };

  const getDescriptionText = (
    row: UserPermissionCatalogRow,
  ): string => {
    const desc =
      getSafePermissionText(row.description) ||
      getSafePermissionText(row.displayName);

    if (!desc) {
      return "Açıklama yok";
    }

    if (desc.includes(":")) {
      const translated = t(desc);

      return !translated ||
        translated === desc ||
        translated === `[${desc}]`
        ? desc
        : translated;
    }

    return desc;
  };

  return (
    <Grid container spacing={2}>
      {rows.map((row) => {
        const isSaving =
          savingPermissionId === row.permissionId;

        const levelLabel = getLevelLabel(row);

        const isCritical =
          levelLabel === "Critical" ||
          levelLabel === "Sensitive";

        const selected = selectedPermissionIds.includes(
          row.permissionId,
        );

        return (
          <Grid
            key={row.permissionId}
            size={{ xs: 12, md: 6, xl: 4 }}
            sx={{ display: "flex" }}
          >
            <Card
              elevation={0}
              sx={{
                width: "100%",
                borderRadius: 3,

                border: "1px solid",

                borderColor: selected
                  ? alpha(theme.palette.primary.main, 0.45)
                  : row.isDirect
                    ? alpha(theme.palette.success.main, 0.38)
                    : isCritical
                      ? alpha(theme.palette.warning.main, 0.35)
                      : alpha(
                          theme.palette.divider,
                          isDark ? 0.45 : 0.85,
                        ),

                bgcolor: selected
                  ? alpha(theme.palette.primary.main, 0.08)
                  : row.isDirect
                    ? alpha(
                        theme.palette.success.main,
                        isDark ? 0.12 : 0.045,
                      )
                    : alpha(
                        theme.palette.background.paper,
                        isDark ? 0.7 : 0.98,
                      ),

                boxShadow: isDark
                  ? "0 14px 30px rgba(0,0,0,0.24)"
                  : "0 14px 30px rgba(15,23,42,0.06)",

                overflow: "hidden",

                transition: "160ms ease",

                "&:hover": {
                  transform: "translateY(-2px)",

                  boxShadow: isDark
                    ? "0 18px 38px rgba(0,0,0,0.32)"
                    : "0 18px 38px rgba(15,23,42,0.10)",
                },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                  >
                    <Checkbox
                      checked={selected}
                      disabled={
                        disabled ||
                        isSaving ||
                        !onToggleSelection
                      }
                      onChange={() =>
                        onToggleSelection?.(
                          row.permissionId,
                        )
                      }
                    />

                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,

                        display: "grid",
                        placeItems: "center",

                        bgcolor: row.isDirect
                          ? alpha(
                              theme.palette.success.main,
                              0.15,
                            )
                          : alpha(
                              theme.palette.primary.main,
                              0.12,
                            ),

                        color: row.isDirect
                          ? theme.palette.success.main
                          : theme.palette.primary.main,
                      }}
                    >
                      {row.isDirect ? (
                        <IconShieldCheck size={24} />
                      ) : row.isRoleSource ? (
                        <IconUsers size={24} />
                      ) : (
                        <IconKey size={24} />
                      )}
                    </Box>

                    <Stack spacing={0.5} flex={1}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                      >
                        {getShortTitle(row)}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {row.permissionCode}
                      </Typography>
                    </Stack>

                    <Switch
                      checked={row.isDirect}
                      disabled={disabled || isSaving}
                      onChange={(e) =>
                        onToggle(
                          row,
                          e.target.checked,
                        )
                      }
                    />
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {getDescriptionText(row)}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Chip
                      size="small"
                      label={row.module}
                    />

                    <Chip
                      size="small"
                      variant="outlined"
                      label={row.scope}
                    />

                    <Chip
                      size="small"
                      color={
                        levelLabel === "Sensitive"
                          ? "error"
                          : levelLabel === "Critical"
                            ? "warning"
                            : "default"
                      }
                      label={levelLabel}
                    />

                    {row.isRoleSource && (
                      <Chip
                        size="small"
                        color="info"
                        icon={<IconUsers size={14} />}
                        label={tr(
                          "permission:userOverrides.source.role",
                          "Role",
                        )}
                      />
                    )}

                    {row.isDirect && (
                      <Chip
                        size="small"
                        color="success"
                        icon={
                          <IconUserCheck size={14} />
                        }
                        label={tr(
                          "permission:userOverrides.source.direct",
                          "Direct",
                        )}
                      />
                    )}

                    {!row.isDirect &&
                      !row.isRoleSource && (
                        <Chip
                          size="small"
                          color="default"
                          icon={
                            <IconShieldOff size={14} />
                          }
                          label={tr(
                            "permission:userOverrides.source.none",
                            "Inherited",
                          )}
                        />
                      )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}