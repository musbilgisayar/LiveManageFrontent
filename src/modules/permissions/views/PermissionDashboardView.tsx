// src/modules/permissions/views/PermissionDashboardView.tsx

"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  alpha,
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import {
  IconKey,
  IconLayoutDashboard,
  IconRefresh,
  IconShieldCheck,
} from "@tabler/icons-react";

 
import { useI18n } from "@/app/context/i18nContext";

import { usePermissionDashboard } from "../hooks/usePermissionDashboard";
import PermissionMetricCard from "../components/shared/PermissionMetricCard";
import PermissionModuleSummaryCard from "../components/dashboard/PermissionModuleSummaryCard";
import PermissionRecentChangesCard from "../components/dashboard/PermissionRecentChangesCard";

export default function PermissionDashboardView() {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();

  const { t } = useI18n();

  const locale =
    typeof params?.locale === "string" && params.locale.trim()
      ? params.locale
      : "tr";

  const { metrics, modules, recentChanges, isLoading, error } =
    usePermissionDashboard();

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
          overflow: "hidden",
          position: "relative",
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.12
          )} 0%, ${alpha(theme.palette.background.paper, 0.98)} 48%)`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            right: -60,
            top: -70,
            width: 220,
            height: 220,
            borderRadius: "50%",
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          }}
        />

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
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
              <IconShieldCheck size={25} />
            </Box>

            <Stack>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {tr("permissions:dashboard.title", "Permission Yönetimi")}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {tr(
                  "permissions:dashboard.subtitle",
                  "Rol, kullanıcı ve sistem izinlerini güvenli şekilde yönetin."
                )}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="outlined"
              startIcon={<IconKey size={18} />}
              onClick={() => router.push(`/${locale}/permissions/catalog`)}
            >
              {tr("permissions:dashboard.actions.openCatalog", "Permission Kataloğu")}
            </Button>

            <Button
              variant="contained"
              startIcon={<IconLayoutDashboard size={18} />}
              onClick={() => router.push(`/${locale}/permissions/role-matrix`)}
            >
              {tr(
                "permissions:dashboard.actions.openRoleMatrix",
                "Rol Permission Matrix’i Aç"
              )}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error ? (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      ) : null}

      {isLoading ? (
        <Alert
          icon={<IconRefresh size={18} />}
          severity="info"
          sx={{ mb: 3, borderRadius: 3 }}
        >
          {tr("permissions:dashboard.loading", "Permission verileri yükleniyor.")}
        </Alert>
      ) : null}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {metrics.map((metric) => (
          <Grid key={metric.id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <PermissionMetricCard metric={metric} locale={locale} t={t} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4 }}>
            <Stack spacing={2.5}>
              <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  {tr("permissions:dashboard.sections.modules", "Modül Özeti")}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {tr(
                    "permissions:dashboard.sections.modules.description",
                    "Permission dağılımını modül, kapsam ve hassasiyet seviyesine göre takip edin."
                  )}
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                {modules.map((module) => (
                  <Grid key={module.module} size={{ xs: 12, md: 6 }}>
                    <PermissionModuleSummaryCard
                      module={module}
                      locale={locale}
                      t={t}
                    />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <PermissionRecentChangesCard
            changes={recentChanges}
            locale={locale}
            t={t}
          />
        </Grid>
      </Grid>
    </Box>
  );
}