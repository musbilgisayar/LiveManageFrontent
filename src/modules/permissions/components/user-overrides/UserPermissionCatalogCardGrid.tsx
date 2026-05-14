"use client";

import {
  alpha,
  Box,
  Card,
  CardContent,
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
  onToggle: (row: UserPermissionCatalogRow, nextChecked: boolean) => void;
}

function getShortTitle(row: UserPermissionCatalogRow): string {
  const display =
    getSafePermissionText(row.displayName) ||
    getSafePermissionText(row.description);

  if (display && !display.includes(":")) return display;

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
  onToggle,
}: Props) {
  const theme = useTheme();
  const { t } = useI18nNs(["permission", "permissions"]);
  const isDark = theme.palette.mode === "dark";

  const tr = (key: string, fallback: string): string => {
    const value = t(key);
    return !value || value === key || value === `[${key}]` ? fallback : value;
  };

  const getDescriptionText = (row: UserPermissionCatalogRow): string => {
    const desc =
      getSafePermissionText(row.description) ||
      getSafePermissionText(row.displayName);

    if (!desc) return "Açıklama yok";

    if (desc.includes(":")) {
      const translated = t(desc);
      return !translated || translated === desc || translated === `[${desc}]`
        ? desc
        : translated;
    }

    return desc;
  };

  return (
    <Grid container spacing={2}>
      {rows.map((row) => {
        const isSaving = savingPermissionId === row.permissionId;
        const levelLabel = getLevelLabel(row);
        const isCritical = levelLabel === "Critical" || levelLabel === "Sensitive";

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
                borderColor: row.isDirect
                  ? alpha(theme.palette.success.main, 0.38)
                  : isCritical
                    ? alpha(theme.palette.warning.main, 0.35)
                    : alpha(theme.palette.divider, isDark ? 0.45 : 0.85),
                bgcolor: row.isDirect
                  ? alpha(theme.palette.success.main, isDark ? 0.12 : 0.045)
                  : alpha(theme.palette.background.paper, isDark ? 0.7 : 0.98),
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
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        color: row.isDirect ? "success.main" : "primary.main",
                        bgcolor: row.isDirect
                          ? alpha(theme.palette.success.main, 0.12)
                          : alpha(theme.palette.primary.main, 0.1),
                        flexShrink: 0,
                      }}
                    >
                      {row.isDirect ? (
                        <IconShieldCheck size={20} />
                      ) : (
                        <IconKey size={20} />
                      )}
                    </Box>

                    <Box minWidth={0} flex={1}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={900}
                          sx={{
                            lineHeight: 1.25,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {getShortTitle(row)}
                        </Typography>

                        <Switch
                          size="small"
                          checked={row.isDirect}
                          disabled={disabled || isSaving}
                          onChange={(e) => onToggle(row, e.target.checked)}
                          sx={{ flexShrink: 0, ml: 1 }}
                        />
                      </Stack>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          mt: 0.5,
                          fontFamily: "monospace",
                          opacity: 0.86,
                          wordBreak: "break-word",
                        }}
                      >
                        {row.permissionCode}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.45,
                      minHeight: 42,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {getDescriptionText(row)}
                  </Typography>

                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    <Chip
                      size="small"
                      label={row.module}
                      variant="outlined"
                      sx={{
                        fontWeight: 800,
                        maxWidth: "100%",
                        "& .MuiChip-label": {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      }}
                    />

                    <Chip
                      size="small"
                      label={row.scope}
                      sx={{ fontWeight: 800 }}
                    />

                    <Chip
                      size="small"
                      label={levelLabel}
                      color={isCritical ? "warning" : "default"}
                      variant={isCritical ? "filled" : "outlined"}
                      sx={{ fontWeight: 800 }}
                    />
                  </Stack>

                  <Box
                    sx={{
                      pt: 1.25,
                      borderTop: "1px solid",
                      borderColor: alpha(theme.palette.divider, isDark ? 0.35 : 0.75),
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                        {row.isRoleSource && (
                          <Chip
                            size="small"
                            icon={<IconUsers size={14} />}
                            color="info"
                            variant="outlined"
                            label={tr("permission:userOverrides.source.role", "Rol Kaynaklı")}
                            sx={{ fontWeight: 800 }}
                          />
                        )}

                        {row.isDirect && (
                          <Chip
                            size="small"
                            icon={<IconUserCheck size={14} />}
                            color="success"
                            label={tr("permission:userOverrides.source.direct", "Direct")}
                            sx={{ fontWeight: 800 }}
                          />
                        )}

                        {!row.isEffective && !row.isDirect && !row.isRoleSource && (
                          <Chip
                            size="small"
                            icon={<IconShieldOff size={14} />}
                            variant="outlined"
                            label={tr("permission:userOverrides.source.missing", "Eksik")}
                            sx={{ fontWeight: 800 }}
                          />
                        )}
                      </Stack>

                      {isSaving && (
                        <Typography variant="caption" color="text.secondary" fontWeight={800}>
                          Kaydediliyor...
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}