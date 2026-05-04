// src/modules/property-management/views/PropertyManagementDashboardView.tsx
"use client";

import { useRouter } from "next/navigation";
import React from "react";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowUpRight,
  IconBuildingCommunity,
  IconChevronRight,
  IconChecklist,
  IconCoin,
  IconHomeStats,
  IconSpeakerphone,
  IconTool,
} from "@tabler/icons-react";

type Tone = "default" | "success" | "warning" | "error";

type PropertyDashboardMock = {
  id: string;
  name: string;
  type: string;
  description: string;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  collectionRate: number;
  overdueCount: number;
  openRequestCount: number;
  highPriorityRequestCount: number;
};

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  meta: string;
  tone?: Tone;
};

type ShortcutItem = {
  id: string;
  label: string;
  description: string;
  href: string;
};

const properties: PropertyDashboardMock[] = [
  {
    id: "1",
    name: "Green Park Sitesi",
    type: "Site Yönetimi",
    description: "Site yönetimi, daire durumu, aidat takibi ve açık talepler için yönetim paneli.",
    totalUnits: 48,
    occupiedUnits: 42,
    vacantUnits: 6,
    collectionRate: 82,
    overdueCount: 6,
    openRequestCount: 4,
    highPriorityRequestCount: 2,
  },
  {
    id: "2",
    name: "Mavi Bahçe Konakları",
    type: "Apartman Yönetimi",
    description: "Apartman yönetimi, bağımsız bölüm takibi ve finansal durum özeti.",
    totalUnits: 24,
    occupiedUnits: 23,
    vacantUnits: 1,
    collectionRate: 96,
    overdueCount: 0,
    openRequestCount: 2,
    highPriorityRequestCount: 0,
  },
  {
    id: "3",
    name: "Koru Evleri 3. Etap",
    type: "Site Yönetimi",
    description: "Çok bloklu site operasyonları, talepler ve aidat takip merkezi.",
    totalUnits: 126,
    occupiedUnits: 118,
    vacantUnits: 8,
    collectionRate: 74,
    overdueCount: 11,
    openRequestCount: 9,
    highPriorityRequestCount: 3,
  },
];

const activities: ActivityItem[] = [
  {
    id: "1",
    title: "Aidat gecikmesi olan daireler var",
    description: "Finans takibi için öncelikli aksiyon gerekiyor.",
    meta: "Bugün",
    tone: "error",
  },
  {
    id: "2",
    title: "Yüksek öncelikli bakım talepleri mevcut",
    description: "Teknik ekip yönlendirmesi bekleyen kayıtlar bulunuyor.",
    meta: "Son 24 saat",
    tone: "warning",
  },
  {
    id: "3",
    title: "Yeni duyuru yayına hazır",
    description: "Aylık toplantı bilgilendirmesi gözden geçirilmeyi bekliyor.",
    meta: "Taslak",
    tone: "default",
  },
];

export default function PropertyManagementDashboardView({
  propertyId,
}: {
  propertyId: string;
}) {
  const theme = useTheme<Theme>();
  const router = useRouter();

  const property = properties.find((item) => item.id === propertyId) ?? properties[0];
  const hasAttention = property.overdueCount > 0 || property.openRequestCount > 0;

  const shortcuts: ShortcutItem[] = [
    {
      id: "1",
      label: "Aidat oluştur",
      description: "Yeni dönem tahakkuku başlat.",
      href: `/property-management/${propertyId}/finance`,
    },
    {
      id: "2",
      label: "Duyuru yayınla",
      description: "Tüm site sakinlerine bildirim gönder.",
      href: `/property-management/${propertyId}/announcements`,
    },
    {
      id: "3",
      label: "Talep yönetimi",
      description: "Bakım ve destek kayıtlarını incele.",
      href: `/property-management/${propertyId}/maintenance`,
    },
    {
      id: "4",
      label: "Daire listesi",
      description: "Bağımsız bölümleri ve doluluk durumunu gör.",
      href: `/property-management/${propertyId}/units`,
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          p: { xs: 2, md: 2.5 },
          borderRadius: 5,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.06,
          )} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Button
              size="small"
              variant="outlined"
              startIcon={<IconArrowLeft size={17} />}
              onClick={() => router.back()}
              sx={{
                borderRadius: 999,
                fontWeight: 800,
                bgcolor: alpha(theme.palette.background.paper, 0.65),
              }}
            >
              Geri
            </Button>

            <BreadcrumbText label="Gayrimenkul Yönetimi" />
            <IconChevronRight size={15} color={theme.palette.text.secondary} />

            <BreadcrumbText label="Site / Apartmanlar" />
            <IconChevronRight size={15} color={theme.palette.text.secondary} />

            <BreadcrumbText label={property.name} active />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.25fr 0.95fr" },
              gap: 2,
              alignItems: "stretch",
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.background.paper, 0.78),
                border: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
              }}
            >
              <Stack spacing={1.25}>
                <Chip
                  label={property.type}
                  size="small"
                  sx={{
                    width: "fit-content",
                    fontWeight: 800,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                  }}
                />

                <Typography variant="h4" fontWeight={900} lineHeight={1.1}>
                  {property.name}
                </Typography>

                <Typography color="text.secondary">{property.description}</Typography>
              </Stack>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.background.paper, 0.78),
                border: `1px solid ${alpha(
                  hasAttention ? theme.palette.warning.main : theme.palette.success.main,
                  0.16,
                )}`,
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2.5,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha(
                        hasAttention ? theme.palette.warning.main : theme.palette.success.main,
                        0.12,
                      ),
                      color: hasAttention ? "warning.dark" : "success.dark",
                    }}
                  >
                    {hasAttention ? (
                      <IconAlertTriangle size={20} />
                    ) : (
                      <IconBuildingCommunity size={20} />
                    )}
                  </Box>

                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.6 }}>
                      Genel Durum
                    </Typography>
                    <Typography fontWeight={900}>
                      {hasAttention ? "İşlem Gerektiren Konular Var" : "Durum Kontrol Altında"}
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  {hasAttention
                    ? `${property.overdueCount} geciken ödeme ve ${property.openRequestCount} açık talep mevcut. Finans ve bakım tarafı öncelikli takip gerektiriyor.`
                    : "Şu anda kritik bir uyarı görünmüyor. Site operasyonları düzenli ilerliyor."}
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <DashboardMetricCard
          icon={<IconHomeStats size={22} />}
          label="Toplam daire"
          value={`${property.totalUnits}`}
          description={`${property.occupiedUnits} dolu, ${property.vacantUnits} boş`}
        />

        <DashboardMetricCard
          icon={<IconCoin size={22} />}
          label="Aidat tahsilatı"
          value={`%${property.collectionRate}`}
          description="Bu ay beklenen tahsilat"
          tone={
            property.collectionRate >= 90
              ? "success"
              : property.collectionRate >= 75
                ? "warning"
                : "error"
          }
        />

        <DashboardMetricCard
          icon={<IconCoin size={22} />}
          label="Geciken ödeme"
          value={`${property.overdueCount}`}
          description={property.overdueCount > 0 ? "Öncelikli takip gerekli" : "Geciken ödeme yok"}
          tone={property.overdueCount > 0 ? "error" : "success"}
          featured={property.overdueCount > 0}
        />

        <DashboardMetricCard
          icon={<IconTool size={22} />}
          label="Açık talep"
          value={`${property.openRequestCount}`}
          description={`${property.highPriorityRequestCount} tanesi yüksek öncelikli`}
          tone={property.openRequestCount > 0 ? "warning" : "success"}
          featured={property.openRequestCount > 0}
        />
      </Box>

      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1.45fr 1fr",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <SectionCard
          title="Son İşlemler"
          subtitle="Ödeme, bakım ve yönetim aktivitelerinin son durumu."
          icon={<IconChecklist size={20} />}
        >
          <Stack divider={<Divider flexItem />} sx={{ mt: 0.5 }}>
            {activities.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </Stack>
        </SectionCard>

        <SectionCard
          title="Yönetim Kısayolları"
          subtitle="Sık kullanılan yönetim aksiyonları."
          icon={<IconSpeakerphone size={20} />}
        >
          <Box
            sx={{
              mt: 0.5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr" },
              gap: 1.25,
            }}
          >
            {shortcuts.map((item) => (
              <ShortcutCard
                key={item.id}
                item={item}
                onClick={() => router.push(item.href)}
              />
            ))}
          </Box>
        </SectionCard>
      </Box>
    </Box>
  );
}

function BreadcrumbText({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <Typography
      variant="body2"
      fontWeight={active ? 900 : 750}
      color={active ? "primary.main" : "text.secondary"}
      sx={{
        cursor: active ? "default" : "pointer",
        "&:hover": {
          color: active ? "primary.main" : "text.primary",
        },
      }}
    >
      {label}
    </Typography>
  );
}

function getToneColor(theme: Theme, tone: Tone = "default") {
  if (tone === "success") return theme.palette.success.main;
  if (tone === "warning") return theme.palette.warning.main;
  if (tone === "error") return theme.palette.error.main;
  return theme.palette.primary.main;
}

function DashboardMetricCard({
  icon,
  label,
  value,
  description,
  tone = "default",
  featured = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  tone?: Tone;
  featured?: boolean;
}) {
  const theme = useTheme<Theme>();
  const color = getToneColor(theme, tone);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4.5,
        borderColor: featured ? alpha(color, 0.28) : alpha(color, 0.18),
        bgcolor: featured ? alpha(color, 0.06) : alpha(color, 0.03),
        backgroundImage: featured
          ? `linear-gradient(180deg, ${alpha(color, 0.08)} 0%, transparent 55%)`
          : "none",
        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[6],
          borderColor: alpha(color, 0.34),
        },
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.75,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(color, 0.12),
                color,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>

            {featured && (
              <Chip
                label="Öncelikli"
                size="small"
                sx={{
                  fontWeight: 800,
                  bgcolor: alpha(color, 0.1),
                  color,
                  border: `1px solid ${alpha(color, 0.18)}`,
                }}
              />
            )}
          </Stack>

          <Box>
            <Typography variant="h4" fontWeight={900} lineHeight={1}>
              {value}
            </Typography>
            <Typography fontWeight={800} sx={{ mt: 0.5 }}>
              {label}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {description}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const theme = useTheme<Theme>();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4.5,
        borderColor: alpha(theme.palette.text.primary, 0.08),
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={900} lineHeight={1.15}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            </Box>
          </Stack>

          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const theme = useTheme<Theme>();
  const color = getToneColor(theme, item.tone);

  return (
    <Box sx={{ py: 1.25 }}>
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            mt: 0.75,
            bgcolor: alpha(color, 0.9),
            flexShrink: 0,
          }}
        />

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={0.75}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Typography fontWeight={800}>{item.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {item.meta}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {item.description}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function ShortcutCard({
  item,
  onClick,
}: {
  item: ShortcutItem;
  onClick: () => void;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      sx={{
        p: 1.5,
        borderRadius: 3.5,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        bgcolor: alpha(theme.palette.text.primary, 0.018),
        transition: "transform 160ms ease, border-color 160ms ease, background-color 160ms ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: alpha(theme.palette.primary.main, 0.18),
          bgcolor: alpha(theme.palette.primary.main, 0.03),
        },
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography fontWeight={800}>{item.label}</Typography>
          <Box sx={{ display: "inline-flex", alignItems: "center", color: "primary.main" }}>
            <IconArrowUpRight size={16} />
          </Box>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {item.description}
        </Typography>
      </Stack>
    </Box>
  );
}