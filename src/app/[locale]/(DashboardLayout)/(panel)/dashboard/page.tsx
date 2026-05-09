// src/app/[locale]/(DashboardLayout)/(panel)/dashboard/page.tsx
"use client";

import Link from "next/link";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
  IconFileDescription,
  IconShieldCheck,
  IconSpeakerphone,
  IconUserCircle,
} from "@tabler/icons-react";

import PageContainer from "@/app/components/container/PageContainer";
import { useAuth } from "@/app/context/AuthContext";
import { useI18nNs } from "@/app/context/i18nContext";

type DashboardModuleCard = {
  title: string;
  description: string;
  href: string;
  permission: string;
  icon: React.ElementType;
  badge: string;
};

const dashboardModules: DashboardModuleCard[] = [
  {
    title: "İzleme Merkezi",
    description: "Sistem güvenliği, audit kayıtları ve operasyonel izleme alanı.",
    href: "/superadmin/monitoring",
    permission: "monitoring.summary.view.tenant",
    icon: IconActivity,
    badge: "Monitoring",
  },
  {
    title: "Kullanıcı Yönetimi",
    description: "Kullanıcıları, profilleri ve yönetimsel işlemleri görüntüle.",
    href: "/superadmin/users",
    permission: "users.view.tenant",
    icon: IconUserCircle,
    badge: "Users",
  },
  {
    title: "Yetki Yönetimi",
    description: "Roller, permission atamaları ve erişim yönetimi.",
    href: "/superadmin/roles",
    permission: "roles.view.tenant",
    icon: IconShieldCheck,
    badge: "Permission",
  },
  {
    title: "Yönetim Başvuruları",
    description: "Site/apartman yönetim başvurularını incele ve takip et.",
    href: "/management-applications/review",
    permission: "admin.property.applications.view_pending.tenant",
    icon: IconFileDescription,
    badge: "Applications",
  },
  {
    title: "Başvurularım",
    description: "Kendi yönetim başvurularını görüntüle ve durumlarını takip et.",
    href: "/management-applications/my",
    permission: "property.applications.view_own.self",
    icon: IconChecklist,
    badge: "My Area",
  },
  {
    title: "Mülk Operasyonları",
    description: "Yönetilen mülkleri, birimleri ve operasyonel süreçleri yönet.",
    href: "/operation-management/properties",
    permission: "property.operations.view.tenant",
    icon: IconBuildingCommunity,
    badge: "Operations",
  },
  {
    title: "İlan Yönetimi",
    description: "İlan oluşturma ve mevcut ilanları yönetme alanı.",
    href: "/listings-management/my-listings",
    permission: "listings.view_own.self",
    icon: IconSpeakerphone,
    badge: "Listings",
  },
  {
    title: "İlan Oluştur",
    description: "Mülk seçerek yeni ilan oluşturma sürecini başlat.",
    href: "/listings-management/create/select-property",
    permission: "listings.create.tenant",
    icon: IconClipboardList,
    badge: "Create",
  },
];

export default function DashboardPage() {
  const theme = useTheme();
  const { t } = useI18nNs(["dashboard"]);
  const { loading, hasPermission } = useAuth();

  if (loading) return null;

  const visibleModules = dashboardModules.filter((module) =>
    hasPermission(module.permission)
  );

  return (
    <PageContainer
      title={t("dashboard:title")}
      description={t("dashboard:description")}
    >
      <Box mt={3}>
        <Stack spacing={3}>
          <Card
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.12
              )}, ${alpha(theme.palette.background.paper, 0.95)})`,
            }}
          >
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h4" fontWeight={800}>
                  LiveManage Dashboard
                </Typography>

                <Typography color="text.secondary">
                  Yetkilerinize göre erişebileceğiniz modüller aşağıda
                  listelenir.
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {visibleModules.length === 0 ? (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={700}>
                  Bu kullanıcı için gösterilecek dashboard modülü bulunamadı.
                </Typography>
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
                        borderRadius: 3,
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.7
                        )}`,
                        transition: "0.2s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: theme.shadows[6],
                        },
                      }}
                    >
                      <CardContent>
                        <Stack spacing={2}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Box
                              sx={{
                                width: 46,
                                height: 46,
                                borderRadius: 2,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: "primary.main",
                              }}
                            >
                              <Icon size={24} />
                            </Box>

                            <Chip size="small" label={module.badge} />
                          </Stack>

                          <Stack spacing={0.75}>
                            <Typography variant="h6" fontWeight={800}>
                              {module.title}
                            </Typography>

                            <Typography color="text.secondary">
                              {module.description}
                            </Typography>
                          </Stack>

                          <Button
                            component={Link}
                            href={module.href}
                            variant="contained"
                            fullWidth
                          >
                            Modüle Git
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