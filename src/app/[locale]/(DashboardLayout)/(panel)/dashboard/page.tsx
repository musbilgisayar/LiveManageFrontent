// src/app/[locale]/(DashboardLayout)/(panel)/dashboard/page.tsx
"use client";

import type { ElementType } from "react";
import Link from "next/link";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconActivity,
  IconBuildingCommunity,
  IconChecklist,
  IconClipboardList,
  IconCrown,
  IconFileDescription,
  IconKey,
  IconShieldCheck,
  IconSpeakerphone,
  IconSparkles,
  IconUserCircle,
} from "@tabler/icons-react";

import PageContainer from "@/app/components/container/PageContainer";
import { useAuth } from "@/app/context/AuthContext";
import { useI18nNs } from "@/app/context/i18nContext";

type DashboardModuleCard = {
  href: string;
  permission: string;
  icon: ElementType;
  i18nKey: string;
};

const dashboardModules: DashboardModuleCard[] = [
  {
    href: "/monitoring",
    permission: "monitoring.summary.view.tenant",
    icon: IconActivity,
    i18nKey: "monitoring",
  },
  {
    href: "/users",
    permission: "users.view.tenant",
    icon: IconUserCircle,
    i18nKey: "users",
  },
  {
    href: "/roles",
    permission: "roles.view.tenant",
    icon: IconShieldCheck,
    i18nKey: "authorization",
  },
  {
    href: "/management-applications/review",
    permission: "admin.property.applications.view_pending.tenant",
    icon: IconFileDescription,
    i18nKey: "managementApplications",
  },
  {
    href: "/management-applications/my",
    permission: "property.applications.view_own.self",
    icon: IconChecklist,
    i18nKey: "myApplications",
  },
  {
    href: "/operation-management/properties",
    permission: "property.operations.view.tenant",
    icon: IconBuildingCommunity,
    i18nKey: "propertyOperations",
  },
  {
    href: "/listings-management/my-listings",
    permission: "listings.view_own.self",
    icon: IconSpeakerphone,
    i18nKey: "listingManagement",
  },
  {
    href: "/listings-management/create/select-property",
    permission: "listings.create.tenant",
    icon: IconClipboardList,
    i18nKey: "createListing",
  },
];

type AuthUser = ReturnType<typeof useAuth>["user"];

function getUserDisplayName(user: AuthUser, fallback: string) {
  const fullName =
    user?.fullName ||
    user?.user?.fullName ||
    [user?.firstName || user?.user?.firstName, user?.lastName || user?.user?.lastName]
      .filter(Boolean)
      .join(" ");

  return (
    fullName ||
    user?.userName ||
    user?.user?.userName ||
    user?.email ||
    user?.user?.email ||
    fallback
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getRoles(user: AuthUser) {
  const roles = user?.roles ?? [];

  if (roles.length > 0) {
    return roles;
  }

  const possibleRole = (user as any)?.role || (user as any)?.primaryRole;
  return typeof possibleRole === "string" && possibleRole ? [possibleRole] : [];
}

export default function DashboardPage() {
  const theme = useTheme();
  const { t } = useI18nNs(["dashboard"]);
  const { user, loading, effectivePermissions, hasPermission } = useAuth();

  if (loading) return null;

  const visibleModules = dashboardModules.filter((module) =>
    hasPermission(module.permission)
  );
  const displayName = getUserDisplayName(
    user,
    t("dashboard:welcome.fallbackUserName")
  );
  const initials = getInitials(displayName) || "LM";
  const roles = getRoles(user);
  const primaryRole = roles[0] ?? t("dashboard:welcome.defaultRole");

  return (
    <PageContainer
      title={t("dashboard:title")}
      description={t("dashboard:description")}
    >
      <Box mt={3}>
        <Stack spacing={3}>
          <Card
            sx={{
              borderRadius: "8px",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              backgroundColor: theme.palette.background.paper,
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={3}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: "primary.main",
                      fontWeight: 800,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    {initials}
                  </Avatar>

                  <Stack spacing={0.75}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconSparkles size={20} color={theme.palette.primary.main} />
                      <Typography variant="overline" color="primary.main" fontWeight={800}>
                        {t("dashboard:welcome.eyebrow")}
                      </Typography>
                    </Stack>

                    <Typography variant="h4" fontWeight={800}>
                      {t("dashboard:welcome.title", { name: displayName })}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                      alignItems="center"
                    >
                      <Chip
                        size="small"
                        icon={<IconCrown size={16} />}
                        label={primaryRole}
                        color="primary"
                        variant="outlined"
                      />
                      {roles.slice(1, 4).map((role) => (
                        <Chip key={role} size="small" label={role} variant="outlined" />
                      ))}
                    </Stack>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1.5} sx={{ width: { xs: "100%", md: "auto" } }}>
                  <Box
                    sx={{
                      minWidth: 132,
                      p: 2,
                      borderRadius: "8px",
                      bgcolor: alpha(theme.palette.success.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.16)}`,
                    }}
                  >
                    <Typography variant="h5" fontWeight={800} color="success.main">
                      {visibleModules.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("dashboard:stats.activeModules")}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      minWidth: 132,
                      p: 2,
                      borderRadius: "8px",
                      bgcolor: alpha(theme.palette.info.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
                    }}
                  >
                    <Typography variant="h5" fontWeight={800} color="info.main">
                      {effectivePermissions.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("dashboard:stats.permissionRecords")}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {visibleModules.length === 0 ? (
            <Card
              sx={{
                borderRadius: "8px",
                border: `1px solid ${alpha(theme.palette.warning.main, 0.18)}`,
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "8px",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha(theme.palette.warning.main, 0.12),
                      color: "warning.main",
                    }}
                  >
                    <IconKey size={22} />
                  </Box>
                  <Box>
                    <Typography fontWeight={800}>
                      {t("dashboard:empty.title")}
                    </Typography>
                    <Typography color="text.secondary">
                      {t("dashboard:empty.description")}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {visibleModules.map((module) => {
                const Icon = module.icon;

                return (
                  <Grid key={module.permission} size={{ xs: 12, md: 6, xl: 4 }}>
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: "8px",
                        border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                        transition: "0.2s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: theme.shadows[6],
                        },
                      }}
                    >
                      <CardContent>
                        <Stack spacing={2}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Box
                              sx={{
                                width: 46,
                                height: 46,
                                borderRadius: "8px",
                                display: "grid",
                                placeItems: "center",
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: "primary.main",
                              }}
                            >
                              <Icon size={24} />
                            </Box>

                            <Chip
                              size="small"
                              label={t(`dashboard:modules.${module.i18nKey}.badge`)}
                            />
                          </Stack>

                          <Divider />

                          <Stack spacing={0.75}>
                            <Typography variant="h6" fontWeight={800}>
                              {t(`dashboard:modules.${module.i18nKey}.title`)}
                            </Typography>

                            <Typography color="text.secondary">
                              {t(`dashboard:modules.${module.i18nKey}.description`)}
                            </Typography>
                          </Stack>

                          <Button
                            component={Link}
                            href={module.href}
                            variant="outlined"
                            fullWidth
                          >
                            {t("dashboard:actions.openModule")}
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
      </Box>
    </PageContainer>
  );
}
