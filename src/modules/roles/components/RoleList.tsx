"use client";

import {
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import {
  IconEdit,
  IconShieldLock,
  IconTrash,
  IconUserShield,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import type { RoleDto } from "../types";

type Props = {
  roles: RoleDto[];
  isLoading?: boolean;

  labels: {
    name: string;
    description: string;
    actions: string;
  };

  onEdit?: (role: RoleDto) => void;
  onDelete?: (role: RoleDto) => void;
};

function resolveRoleColor(role: RoleDto) {
  const roleName = role.name?.toLowerCase() ?? "";

  if (roleName.includes("super")) {
    return "error";
  }

  if (roleName.includes("admin")) {
    return "warning";
  }

  return "primary";
}

function resolveRoleName(
  role: RoleDto,
  t: (key: string) => string,
): string {
  if (role.name?.startsWith("roles:")) {
    return t(role.name);
  }

  const key = `roles:name.${role.name?.toLowerCase()}`;

  const translated = t(key);

  if (!translated || translated === key || translated === `[${key}]`) {
    return role.name ?? "-";
  }

  return translated;
}

function resolveRoleDescription(
  role: RoleDto,
  t: (key: string) => string,
  fallback: string,
): string {
  if (role.description?.startsWith("roles:")) {
    return t(role.description);
  }

  return role.description || fallback;
}

export default function RoleList({
  roles,
  isLoading,
  onEdit,
  onDelete,
}: Props) {
  const theme = useTheme();

  const { t } = useI18nNs(["roles"]);

  const tr = (key: string, fallback: string) => {
    const value = t(key);

    return !value || value === key || value === `[${key}]`
      ? fallback
      : value;
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          py: 10,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!roles?.length) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: `1px dashed ${alpha(theme.palette.divider, 0.85)}`,
        }}
      >
        <CardContent
          sx={{
            py: 8,
            textAlign: "center",
          }}
        >
          <Stack spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 4,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
              }}
            >
              <IconShieldLock size={34} />
            </Box>

            <Typography variant="h6" fontWeight={800}>
              {tr("roles:empty.title", "Henüz rol bulunmuyor")}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {tr(
                "roles:empty.description",
                "Yeni rol oluşturarak başlayabilirsiniz.",
              )}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {roles.map((role) => {
        const color = resolveRoleColor(role);

        const isSpecialRole =
          role.name?.toLowerCase().includes("admin") ||
          role.name?.toLowerCase().includes("super");

        return (
          <Card
            key={role.id}
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              border: `1px solid ${alpha(theme.palette[color].main, 0.18)}`,
              background: alpha(theme.palette[color].main, 0.035),
              transition: "160ms ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 16px 36px rgba(15,23,42,0.08)",
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
              >
                <Stack spacing={1.2} flex={1}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 3,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: alpha(theme.palette[color].main, 0.12),
                        color: theme.palette[color].main,
                      }}
                    >
                      <IconUserShield size={22} />
                    </Box>

                    <Typography variant="h6" fontWeight={900}>
                      {resolveRoleName(role, t)}
                    </Typography>

                    {isSpecialRole ? (
                      <Chip
                        size="small"
                        color={color === "error" ? "error" : "warning"}
                        label={tr("roles:special", "Özel rol")}
                      />
                    ) : null}

                    <Chip
                      size="small"
                      variant="outlined"
                      color={role.isActive ? "success" : "default"}
                      label={
                        role.isActive
                          ? tr("roles:active", "Aktif")
                          : tr("roles:inactive", "Pasif")
                      }
                    />
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {resolveRoleDescription(
                      role,
                      t,
                      tr("roles:noDescription", "Açıklama bulunmuyor."),
                    )}
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`ID: ${role.id}`}
                    />
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Tooltip title={tr("roles:action.edit", "Düzenle")}>
                    <IconButton color="primary" onClick={() => onEdit?.(role)}>
                      <IconEdit size={20} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={tr("roles:action.delete", "Sil")}>
                    <IconButton color="error" onClick={() => onDelete?.(role)}>
                      <IconTrash size={20} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}