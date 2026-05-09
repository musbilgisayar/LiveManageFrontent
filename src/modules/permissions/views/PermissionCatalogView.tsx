// src/modules/permissions/views/PermissionCatalogView.tsx

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import {
  IconArrowLeft,
  IconFilter,
  IconKey,
  IconSearch,
  IconShieldLock,
  IconX,
} from "@tabler/icons-react";

import { useI18n } from "@/app/context/i18nContext";
import { usePermissionCatalog } from "../hooks/usePermissionCatalog";

export default function PermissionCatalogView() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useI18n();

  const {
  filters,
  updateFilter,
  resetFilters,
  permissions,
  modules,
  totalCount,
  filteredCount,
  isLoading,
  error,
} = usePermissionCatalog();

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.1
          )} 0%, ${alpha(theme.palette.background.paper, 0.98)} 55%)`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
              }}
            >
              <IconKey size={24} />
            </Box>

            <Stack>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {tr("permissions:catalog.title", "Permission Kataloğu")}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {tr(
                  "permissions:catalog.subtitle",
                  "Kod tarafında tanımlı permission kayıtlarını modül, kapsam ve risk seviyesine göre inceleyin."
                )}
              </Typography>
            </Stack>
          </Stack>

          <Button
            variant="outlined"
            startIcon={<IconArrowLeft size={18} />}
            onClick={() => router.push("/permissions")}
          >
            {tr("permissions:shared.backToDashboard", "Panele Dön")}
          </Button>
        </Stack>
      </Paper>

{error ? (
  <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
    {error}
  </Alert>
) : null}

{isLoading ? (
  <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
    {tr("permissions:catalog.loading", "Permission kataloğu yükleniyor.")}
  </Alert>
) : null}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 4 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconFilter size={20} />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {tr("permissions:catalog.filters.title", "Filtreler")}
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder={tr(
                  "permissions:catalog.filters.searchPlaceholder",
                  "Permission kodu, modül veya aksiyon ara"
                )}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={tr("permissions:catalog.filters.module", "Modül")}
                value={filters.module}
                onChange={(event) => updateFilter("module", event.target.value)}
              >
                <MenuItem value="all">
                  {tr("permissions:shared.all", "Tümü")}
                </MenuItem>

                {modules.map((module) => (
                  <MenuItem key={module.module} value={module.module}>
                    {tr(module.displayNameKey, module.fallbackDisplayName)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={tr("permissions:catalog.filters.scope", "Kapsam")}
                value={filters.scope}
                onChange={(event) =>
                  updateFilter("scope", event.target.value as typeof filters.scope)
                }
              >
                <MenuItem value="all">{tr("permissions:shared.all", "Tümü")}</MenuItem>
                <MenuItem value="self">self</MenuItem>
                <MenuItem value="tenant">tenant</MenuItem>
                <MenuItem value="global">global</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={tr("permissions:catalog.filters.level", "Seviye")}
                value={filters.level}
                onChange={(event) =>
                  updateFilter("level", event.target.value as typeof filters.level)
                }
              >
                <MenuItem value="all">{tr("permissions:shared.all", "Tümü")}</MenuItem>
                <MenuItem value="1">Level 1</MenuItem>
                <MenuItem value="2">Level 2</MenuItem>
                <MenuItem value="3">Level 3</MenuItem>
                <MenuItem value="4">Level 4</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={tr("permissions:catalog.filters.sensitive", "Hassasiyet")}
                value={filters.sensitive}
                onChange={(event) =>
                  updateFilter(
                    "sensitive",
                    event.target.value as typeof filters.sensitive
                  )
                }
              >
                <MenuItem value="all">{tr("permissions:shared.all", "Tümü")}</MenuItem>
                <MenuItem value="sensitive">
                  {tr("permissions:catalog.filters.onlySensitive", "Sadece Hassas")}
                </MenuItem>
                <MenuItem value="normal">
                  {tr("permissions:catalog.filters.onlyNormal", "Normal")}
                </MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Typography variant="body2" color="text.secondary">
              {filteredCount} / {totalCount}
            </Typography>

            <Button
              size="small"
              variant="text"
              startIcon={<IconX size={16} />}
              onClick={resetFilters}
            >
              {tr("permissions:shared.clearFilters", "Filtreleri Temizle")}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {permissions.map((permission) => (
          <Grid key={permission.id} size={{ xs: 12, md: 6, xl: 4 }}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                borderRadius: 3,
                borderColor: permission.isSensitive
                  ? alpha(theme.palette.warning.main, 0.35)
                  : undefined,
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 900,
                        fontFamily: "monospace",
                        wordBreak: "break-word",
                      }}
                    >
                      {permission.code}
                    </Typography>

                    {permission.isSensitive ? (
                      <Chip
                        size="small"
                        icon={<IconShieldLock size={14} />}
                        label={tr("permissions:shared.sensitive", "Hassas")}
                        color="warning"
                        variant="outlined"
                      />
                    ) : null}
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {permission.descriptionKey
                      ? tr(
                          permission.descriptionKey,
                          permission.fallbackDescription || "—"
                        )
                      : permission.fallbackDescription || "—"}
                  </Typography>

                  <Divider />

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip size="small" label={permission.module} />
                    <Chip size="small" label={permission.scope} variant="outlined" />
                    <Chip size="small" label={`Level ${permission.level}`} />
                    <Chip
                      size="small"
                      label={permission.riskLevel}
                      color={
                        permission.riskLevel === "critical"
                          ? "error"
                          : permission.riskLevel === "high"
                            ? "warning"
                            : "default"
                      }
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}