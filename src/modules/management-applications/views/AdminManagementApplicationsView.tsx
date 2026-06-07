// src/modules/management-applications/views/AdminManagementApplicationsView.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import type { ChipProps } from "@mui/material";

import {
  IconArrowLeft,
  IconArrowRight,
  IconChecklist,
  IconClockHour4,
  IconRefresh,
  IconShieldCheck,
  IconUsersGroup,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import useManagementApplicationsDashboard from "../hooks/useManagementApplicationsDashboard";

function getDisplayValue(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

export default function AdminManagementApplicationsView() {
  const theme = useTheme();
  const params = useParams();
  const locale = String(params?.locale || "tr");

  const { t } = useI18nNs("management-applications");

  const tx = (key: string, fallback: string) => {
    const fullKey = `management-applications:${key}`;
    const value = t(fullKey);
    return value && value !== fullKey ? value : fallback;
  };

  const getApplicationStatusLabel = (status: unknown) => {
    switch (Number(status)) {
      case 0:
        return tx("status.pending", "Beklemede");
      case 1:
        return tx("status.underReview", "İncelemede");
      case 2:
        return tx("status.approved", "Onaylandı");
      case 3:
        return tx("status.rejected", "Reddedildi");
      case 4:
        return tx("status.needsMoreInfo", "Ek bilgi gerekiyor");
      case 5:
        return tx("status.cancelled", "İptal edildi");
      case 6:
        return tx("status.documentRequested", "Belge talep edildi");
      default:
        return getDisplayValue(status);
    }
  };

  const getApplicationStatusColor = (
    status: unknown,
  ): ChipProps["color"] => {
    switch (Number(status)) {
      case 0:
        return "default";
      case 1:
        return "warning";
      case 2:
        return "success";
      case 3:
        return "error";
      case 4:
        return "info";
      case 5:
        return "default";
      case 6:
        return "secondary";
      default:
        return "default";
    }
  };

  const {
    summary,
    recentApplications,
    isLoading,
    errorMessage,
    refresh,
  } = useManagementApplicationsDashboard();

  const stats = [
    {
      label: tx("dashboard.kpi.total", "Toplam Başvuru"),
      value: summary.total,
      icon: IconUsersGroup,
      color: theme.palette.primary.main,
    },
    {
      label: tx("dashboard.kpi.inReview", "İncelemede"),
      value: summary.inReview,
      icon: IconClockHour4,
      color: theme.palette.warning.main,
    },
    {
      label: tx("dashboard.kpi.approved", "Onaylanan"),
      value: summary.approved,
      icon: IconShieldCheck,
      color: theme.palette.success.main,
    },
    {
      label: tx("dashboard.kpi.documentRequested", "Ek Belge Bekleyen"),
      value: summary.documentRequested,
      icon: IconChecklist,
      color: theme.palette.info.main,
    },
  ];

  return (
    <Stack spacing={3}>
      {errorMessage ? (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<IconRefresh size={16} />}
              onClick={() => void refresh()}
            >
              {tx("dashboard.error.retry", "Tekrar dene")}
            </Button>
          }
        >
          {errorMessage}
        </Alert>
      ) : null}

      <Card
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          border: `1px solid ${alpha(theme.palette.warning.main, 0.18)}`,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.warning.main,
            0.12,
          )}, ${alpha(theme.palette.background.paper, 0.96)})`,
          boxShadow: `0 18px 50px ${alpha(theme.palette.warning.main, 0.11)}`,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={1.5}>
            <Button
              component={Link}
              href={`/${locale}/management-applications`}
              startIcon={<IconArrowLeft size={18} />}
              variant="text"
              sx={{
                alignSelf: "flex-start",
                px: 0,
                fontWeight: 800,
              }}
            >
              {tx("admin.hero.backToApplications", "Başvurulara Dön")}
            </Button>

            <Chip
              icon={<IconUsersGroup size={18} />}
              label={tx("admin.hero.badge", "Tenant Yönetimi")}
              color="warning"
              sx={{
                alignSelf: "flex-start",
                fontWeight: 800,
              }}
            />

            <Typography variant="h3" fontWeight={900}>
              {tx("admin.hero.title", "Tenant Başvuru Yönetimi")}
            </Typography>

            <Typography variant="body1" color="text.secondary" maxWidth={760}>
              {tx(
                "admin.hero.description",
                "Tenantınıza ait yönetim başvurularını inceleyin, değerlendirin ve süreçleri yönetin.",
              )}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Grid
              key={item.label}
              size={{ xs: 12, sm: 6, lg: 3 }}
              sx={{ display: "flex" }}
            >
              <Card
                sx={{
                  flex: 1,
                  borderRadius: 4,
                  border: `1px solid ${alpha(item.color, 0.16)}`,
                  background: alpha(item.color, 0.055),
                  boxShadow: `0 14px 34px ${alpha(item.color, 0.08)}`,
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 3,
                        display: "grid",
                        placeItems: "center",
                        color: item.color,
                        backgroundColor: alpha(item.color, 0.14),
                      }}
                    >
                      <Icon size={24} />
                    </Box>

                    <Box>
                      <Typography variant="h4" fontWeight={900}>
                        {isLoading ? <Skeleton width={42} /> : item.value}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Card
        sx={{
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.75)}`,
          boxShadow: `0 16px 42px ${alpha(theme.palette.common.black, 0.06)}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" fontWeight={900}>
                {tx("admin.applications.title", "Başvuru Listesi")}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {tx(
                  "admin.applications.description",
                  "Tenantınıza ait yönetim başvuruları ve güncel durumları.",
                )}
              </Typography>
            </Box>

            {isLoading ? (
              <Stack spacing={2}>
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} height={72} />
                ))}
              </Stack>
            ) : recentApplications.length === 0 ? (
              <Alert severity="info">
                {tx("admin.pending.empty", "Gösterilecek başvuru bulunmuyor.")}
              </Alert>
            ) : (
              <Stack divider={<Divider flexItem />}>
                {recentApplications.map((item) => {
                  const record = item as unknown as Record<string, unknown>;

                  const applicationId = getDisplayValue(
                    record.id ?? record.applicationId,
                  );

                  return (
                    <Stack
                      key={applicationId}
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      alignItems={{ xs: "flex-start", md: "center" }}
                      justifyContent="space-between"
                      sx={{ py: 2 }}
                    >
                      <Box>
                        <Typography fontWeight={800}>
                          {getDisplayValue(
                            record.propertyName ?? record.name ?? record.title,
                          )}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {getDisplayValue(
                            record.applicationNumber ??
                              record.referenceNo ??
                              applicationId,
                          )}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Chip
                          label={getApplicationStatusLabel(record.status)}
                          color={getApplicationStatusColor(record.status)}
                          variant="outlined"
                          sx={{
                            fontWeight: 850,
                            borderRadius: 999,
                            px: 0.5,
                          }}
                        />

                        <Button
                          component={Link}
                          href={`/${locale}/management-applications/review/${applicationId}`}
                          endIcon={<IconArrowRight size={18} />}
                          variant="contained"
                          disableElevation
                          sx={{
                            borderRadius: 2.5,
                            fontWeight: 850,
                          }}
                        >
                          {tx("admin.pending.review", "İncele")}
                        </Button>
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}