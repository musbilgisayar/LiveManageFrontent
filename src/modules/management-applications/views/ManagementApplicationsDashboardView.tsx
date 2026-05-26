"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import {
  IconBuildingCommunity,
  IconChecklist,
  IconFilePlus,
  IconFolderOpen,
  IconRefresh,
  IconShieldCheck,
  IconUsersGroup,
  IconWorld,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";
import { useAuth } from "@/app/context/AuthContext";
import useManagementApplicationsDashboard from "../hooks/useManagementApplicationsDashboard";

const PERMISSIONS = {
  self: "property.applications.view_own.self",
  create: "property.applications.create.self",
  admin: "admin.property.applications.view_pending.tenant",
  global: "admin.property.applications.view_pending.global",
};

export default function ManagementApplicationsDashboardView() {
  const theme = useTheme();
  const params = useParams();
  const locale = String(params?.locale || "tr");

  const { t } = useI18nNs("management-applications");

  const tx = (key: string) => t(`management-applications:${key}`);

  const { summary, isLoading, errorMessage, refresh } =
    useManagementApplicationsDashboard();

  const {
    effectivePermissions: permissions,
    loading: permissionsLoading,
  } = useAuth();

  const permissionSet = useMemo(
    () => new Set(permissions),
    [permissions],
  );

  const canSeeSelf =
    permissionSet.has(PERMISSIONS.self) ||
    permissionSet.has(PERMISSIONS.create);

  const canSeeAdmin = permissionSet.has(PERMISSIONS.admin);

  const canSeeGlobal = permissionSet.has(PERMISSIONS.global);

  const visibleActions = [
    canSeeSelf
      ? {
          title: tx("dashboard.actions.my.title"),
          description: tx("dashboard.actions.my.description"),
          href: `/${locale}/management-applications/my`,
          icon: IconFolderOpen,
          color: theme.palette.primary.main,
          chip: tx("dashboard.scope.self"),
        }
      : null,

    canSeeAdmin
      ? {
          title: tx("dashboard.actions.admin.title"),
          description: tx("dashboard.actions.admin.description"),
          href: `/${locale}/management-applications/admin`,
          icon: IconUsersGroup,
          color: theme.palette.warning.main,
          chip: tx("dashboard.scope.tenant"),
        }
      : null,

    canSeeGlobal
      ? {
          title: tx("dashboard.actions.all.title"),
          description: tx("dashboard.actions.all.description"),
          href: `/${locale}/management-applications/all`,
          icon: IconWorld,
          color: theme.palette.success.main,
          chip: tx("dashboard.scope.global"),
        }
      : null,
  ].filter(Boolean) as {
    title: string;
    description: string;
    href: string;
    icon: typeof IconFolderOpen;
    color: string;
    chip: string;
  }[];

  const stats = [
    {
      label: tx("dashboard.kpi.total"),
      value: summary.total,
      icon: IconFolderOpen,
      color: theme.palette.primary.main,
    },
    {
      label: tx("dashboard.kpi.inReview"),
      value: summary.inReview,
      icon: IconChecklist,
      color: theme.palette.warning.main,
    },
    {
      label: tx("dashboard.kpi.approved"),
      value: summary.approved,
      icon: IconShieldCheck,
      color: theme.palette.success.main,
    },
    {
      label: tx("dashboard.kpi.documentRequested"),
      value: summary.documentRequested,
      icon: IconFilePlus,
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
              {tx("dashboard.error.retry")}
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
          border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.14,
          )}, ${alpha(theme.palette.background.paper, 0.96)})`,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2}>
            <Chip
              icon={<IconBuildingCommunity size={18} />}
              label={tx("dashboard.hero.badge")}
              color="primary"
              sx={{ alignSelf: "flex-start", fontWeight: 700 }}
            />

            <Typography variant="h3" fontWeight={800}>
              {tx("dashboard.hero.title")}
            </Typography>

            <Typography variant="body1" color="text.secondary" maxWidth={820}>
              {tx("dashboard.hero.description")}
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
                      <Typography variant="h4" fontWeight={800}>
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
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" fontWeight={800}>
                {tx("dashboard.modules.title")}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {tx("dashboard.modules.description")}
              </Typography>
            </Box>

            {permissionsLoading ? (
              <Grid container spacing={3}>
                {[1, 2, 3].map((item) => (
                  <Grid
                    key={item}
                    size={{ xs: 12, md: 4 }}
                    sx={{ display: "flex" }}
                  >
                    <Skeleton
                      variant="rounded"
                      height={190}
                      sx={{ flex: 1, borderRadius: 4 }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : visibleActions.length === 0 ? (
              <Alert severity="warning">
                {tx("dashboard.modules.noPermission")}
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {visibleActions.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Grid
                      key={item.href}
                      size={{ xs: 12, md: 4 }}
                      sx={{ display: "flex" }}
                    >
                      <Card
                        sx={{
                          flex: 1,
                          borderRadius: 4,
                          border: `1px solid ${alpha(item.color, 0.18)}`,
                          background: `linear-gradient(180deg, ${alpha(
                            item.color,
                            0.09,
                          )}, ${alpha(theme.palette.background.paper, 0.96)})`,
                          transition: "0.2s ease",
                          "&:hover": {
                            transform: "translateY(-3px)",
                            boxShadow: theme.shadows[8],
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Stack spacing={2.5}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              spacing={2}
                            >
                              <Box
                                sx={{
                                  width: 54,
                                  height: 54,
                                  borderRadius: 3,
                                  display: "grid",
                                  placeItems: "center",
                                  color: item.color,
                                  backgroundColor: alpha(item.color, 0.14),
                                }}
                              >
                                <Icon size={28} />
                              </Box>

                              <Chip
                                label={item.chip}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  color: item.color,
                                  backgroundColor: alpha(item.color, 0.12),
                                }}
                              />
                            </Stack>

                            <Stack spacing={1}>
                              <Typography variant="h6" fontWeight={800}>
                                {item.title}
                              </Typography>

                              <Typography variant="body2" color="text.secondary">
                                {item.description}
                              </Typography>
                            </Stack>

                            <Button
                              component={Link}
                              href={item.href}
                              variant="contained"
                              sx={{
                                borderRadius: 3,
                                alignSelf: "flex-start",
                                backgroundColor: item.color,
                                "&:hover": {
                                  backgroundColor: item.color,
                                },
                              }}
                            >
                              {tx("dashboard.actions.open")}
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
