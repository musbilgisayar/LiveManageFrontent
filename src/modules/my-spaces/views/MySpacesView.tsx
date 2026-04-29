// src/modules/my-spaces/views/MySpacesView.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconAlertTriangle,
  IconBuildingCommunity,
  IconBuildingSkyscraper,
  IconChecklist,
  IconCoin,
  IconHome,
  IconInbox,
  IconKey,
  IconLayoutGrid,
} from "@tabler/icons-react";

type ManagedProperty = {
  id: string;
  name: string;
  type: string;
  address: string;
  unitCount: number;
  overdueCount: number;
  openRequestCount: number;
  role: string;
};

type OwnedUnit = {
  id: string;
  propertyName: string;
  unitNumber: string;
  tenantName: string;
  rentStatus: string;
};

type TenantResidence = {
  id: string;
  propertyName: string;
  unitNumber: string;
  ownerName: string;
  paymentStatus: string;
};

type CompanyAccess = {
  id: string;
  companyName: string;
  companyType: string;
  activeListings: number;
  referenceRequests: number;
  role: string;
};

type Tone = "default" | "success" | "warning" | "error";

type SpaceStat = {
  label: string;
  value: string;
  tone?: Tone;
  emphasis?: boolean;
};

type SpaceCardBadge = {
  label: string;
  tone?: Tone;
};

type SpaceCardData = {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge: SpaceCardBadge;
  stats: SpaceStat[];
  actionLabel: string;
  featured?: boolean;
};

const isLoading = false;

const managedProperties: ManagedProperty[] = [
  {
    id: "1",
    name: "Green Park Sitesi",
    type: "Site Yönetimi",
    address: "Zürich / Altstetten",
    unitCount: 48,
    overdueCount: 6,
    openRequestCount: 4,
    role: "Site Yöneticisi",
  },
  {
    id: "2",
    name: "Mavi Bahçe Konakları",
    type: "Apartman Yönetimi",
    address: "İstanbul / Ataşehir",
    unitCount: 24,
    overdueCount: 0,
    openRequestCount: 2,
    role: "Yönetici",
  },
  {
    id: "3",
    name: "Koru Evleri 3. Etap A-B-C Blok Ortak Yaşam Alanı",
    type: "Site Yönetimi",
    address: "Ankara / Çankaya",
    unitCount: 126,
    overdueCount: 11,
    openRequestCount: 9,
    role: "Site Yöneticisi",
  },
];

const ownedUnits: OwnedUnit[] = [
  {
    id: "1",
    propertyName: "Sun Residence",
    unitNumber: "Daire 8",
    tenantName: "Ahmet Yılmaz",
    rentStatus: "Düzenli",
  },
  {
    id: "2",
    propertyName: "North Point Residence",
    unitNumber: "Daire 21",
    tenantName: "Zeynep Demir",
    rentStatus: "1 gecikme",
  },
  {
    id: "3",
    propertyName: "Panorama Yaşam Kompleksi B Blok",
    unitNumber: "Daire 3",
    tenantName: "Kiracı bekleniyor",
    rentStatus: "Boş",
  },
];

const tenantResidences: TenantResidence[] = [
  {
    id: "1",
    propertyName: "Lake View Apartments",
    unitNumber: "Daire 14",
    ownerName: "Mehmet Kaya",
    paymentStatus: "Aidat ödendi",
  },
  {
    id: "2",
    propertyName: "City Loft",
    unitNumber: "Daire 5",
    ownerName: "Selin Arslan",
    paymentStatus: "Ödeme bekleniyor",
  },
  {
    id: "3",
    propertyName: "Vadi Evleri",
    unitNumber: "Daire 32",
    ownerName: "Hasan Çelik",
    paymentStatus: "Kısmi ödeme",
  },
];

const companyAccesses: CompanyAccess[] = [];

function getToneStyles(theme: Theme, tone: Tone = "default") {
  switch (tone) {
    case "success":
      return {
        softBg: alpha(theme.palette.success.main, 0.1),
        strongBg: alpha(theme.palette.success.main, 0.16),
        color: theme.palette.success.dark,
        border: alpha(theme.palette.success.main, 0.22),
      };
    case "warning":
      return {
        softBg: alpha(theme.palette.warning.main, 0.12),
        strongBg: alpha(theme.palette.warning.main, 0.18),
        color: theme.palette.warning.dark,
        border: alpha(theme.palette.warning.main, 0.24),
      };
    case "error":
      return {
        softBg: alpha(theme.palette.error.main, 0.1),
        strongBg: alpha(theme.palette.error.main, 0.16),
        color: theme.palette.error.dark,
        border: alpha(theme.palette.error.main, 0.22),
      };
    default:
      return {
        softBg: alpha(theme.palette.text.primary, 0.04),
        strongBg: alpha(theme.palette.text.primary, 0.06),
        color: theme.palette.text.secondary,
        border: alpha(theme.palette.text.primary, 0.1),
      };
  }
}

function getRentTone(status: string): Tone {
  const value = status.toLowerCase();

  if (value === "düzenli") return "success";
  if (value.includes("gecikme")) return "warning";
  return "default";
}

function getPaymentTone(status: string): Tone {
  const value = status.toLowerCase();

  if (value.includes("ödendi")) return "success";
  if (value.includes("bekleniyor") || value.includes("kısmi")) return "warning";
  return "default";
}

function getManagedPriority(item: ManagedProperty) {
  return item.overdueCount * 3 + item.openRequestCount * 2;
}

function SummaryHero({
  overdueTotal,
  openRequestTotal,
}: {
  overdueTotal: number;
  openRequestTotal: number;
}) {
  const theme = useTheme<Theme>();
  const hasAttention = overdueTotal > 0 || openRequestTotal > 0;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 5,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        background: hasAttention
          ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.06)} 0%, ${alpha(
            theme.palette.warning.main,
            0.08,
          )} 40%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
            theme.palette.primary.main,
            0.02,
          )} 100%)`,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.3fr 1fr" },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.72),
            border: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
            backdropFilter: "blur(8px)",
          }}
        >
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: hasAttention
                    ? alpha(theme.palette.warning.main, 0.14)
                    : alpha(theme.palette.primary.main, 0.1),
                  color: hasAttention ? "warning.dark" : "primary.main",
                }}
              >
                {hasAttention ? <IconAlertTriangle size={20} /> : <IconLayoutGrid size={20} />}
              </Box>

              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.6 }}>
                  Genel Durum
                </Typography>
                <Typography variant="h5" fontWeight={900} lineHeight={1.1}>
                  {hasAttention ? "İşlem Gerektiren Alanlar Var" : "Tüm Alanlar Kontrol Altında"}
                </Typography>
              </Box>
            </Stack>

            <Typography color="text.secondary">
              {hasAttention
                ? "Geciken ödeme ve açık talepler öncelikli aksiyon gerektiriyor."
                : "Şu anda kritik bir uyarı görünmüyor. Alanlarınız düzenli ilerliyor."}
            </Typography>
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.25,
          }}
        >
          <PrioritySummaryCard
            icon={<IconCoin size={18} />}
            label="Geciken ödeme"
            value={`${overdueTotal}`}
            tone="error"
          />
          <PrioritySummaryCard
            icon={<IconChecklist size={18} />}
            label="Açık talep"
            value={`${openRequestTotal}`}
            tone="warning"
          />
          <CompactSummaryCard
            icon={<IconBuildingCommunity size={18} />}
            label="Yönetilen site"
            value={`${managedProperties.length}`}
          />
          <CompactSummaryCard
            icon={<IconHome size={18} />}
            label="Sahip olunan daire"
            value={`${ownedUnits.length}`}
          />
          <CompactSummaryCard
            icon={<IconKey size={18} />}
            label="Kiracı olunan konut"
            value={`${tenantResidences.length}`}
          />
          <CompactSummaryCard
            icon={<IconBuildingSkyscraper size={18} />}
            label="Firma erişimi"
            value={`${companyAccesses.length}`}
          />
        </Box>
      </Box>
    </Box>
  );
}

function PrioritySummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: Tone;
}) {
  const theme = useTheme<Theme>();
  const toneStyles = getToneStyles(theme, tone);

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3.5,
        border: `1px solid ${toneStyles.border}`,
        bgcolor: toneStyles.softBg,
      }}
    >
      <Stack spacing={0.75}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: toneStyles.strongBg,
              color: toneStyles.color,
            }}
          >
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary" noWrap>
            {label}
          </Typography>
        </Stack>

        <Typography variant="h4" fontWeight={900} sx={{ color: toneStyles.color, lineHeight: 1 }}>
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}

function CompactSummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.72),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: "primary.main",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={800} lineHeight={1.1}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {label}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function SummarySkeleton() {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 5,
        border: (theme: Theme) => `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.3fr 1fr" },
          gap: 2,
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 4,
            border: (theme: Theme) => `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
          }}
        >
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Skeleton variant="rounded" width={42} height={42} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="20%" height={18} />
                <Skeleton variant="text" width="55%" height={36} />
              </Box>
            </Stack>
            <Skeleton variant="text" width="80%" height={24} />
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.25,
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                p: 1.25,
                borderRadius: 3,
                border: (theme: Theme) => `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
              }}
            >
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="35%" height={34} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  count,
  loading = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  loading?: boolean;
}) {
  const theme = useTheme<Theme>();

  return (
    <Stack spacing={1.5} sx={{ mb: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
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
              {description}
            </Typography>
          </Box>
        </Stack>

        {loading ? (
          <Skeleton variant="rounded" width={90} height={28} />
        ) : (
          <Chip
            label={`${count} kayıt`}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        )}
      </Stack>

      <Divider />
    </Stack>
  );
}

function StatusBadge({ badge }: { badge: SpaceCardBadge }) {
  const theme = useTheme<Theme>();
  const toneStyles = getToneStyles(theme, badge.tone);

  return (
    <Chip
      label={badge.label}
      size="small"
      sx={{
        fontWeight: 800,
        bgcolor: toneStyles.softBg,
        color: toneStyles.color,
        border: `1px solid ${toneStyles.border}`,
      }}
    />
  );
}

function StatRow({ stat }: { stat: SpaceStat }) {
  const theme = useTheme<Theme>();
  const toneStyles = getToneStyles(theme, stat.tone);

  return (
    <Stack
      direction="row"
      spacing={1}
      justifyContent="space-between"
      alignItems="center"
      sx={{
        py: 1,
        borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
        "&:last-of-type": {
          borderBottom: "none",
          pb: 0,
        },
        "&:first-of-type": {
          pt: 0,
        },
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {stat.label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={stat.emphasis ? 900 : 800}
        sx={{
          color: stat.tone ? toneStyles.color : "text.primary",
          textAlign: "right",
        }}
      >
        {stat.value}
      </Typography>
    </Stack>
  );
}

function SpaceCard({
  id,
  icon,
  title,
  subtitle,
  badge,
  stats,
  actionLabel,
  featured = false,
}: SpaceCardData) {
  const theme = useTheme<Theme>();
  const router = useRouter();
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 4.5,
        overflow: "hidden",
        borderColor: featured
          ? alpha(theme.palette.warning.main, 0.3)
          : alpha(theme.palette.text.primary, 0.08),
        background: featured
          ? `linear-gradient(180deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, transparent 42%)`
          : theme.palette.background.paper,
        boxShadow: featured ? theme.shadows[4] : "none",
        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: theme.shadows[8],
          borderColor: featured
            ? alpha(theme.palette.warning.main, 0.42)
            : alpha(theme.palette.primary.main, 0.24),
        },
      }}
    >
      <CardActionArea
        onClick={() => router.push(`/property-management/${id}/dashboard`)}
        sx={{
          height: "100%",
          alignItems: "stretch",
        }}
      >
        <CardContent sx={{ p: 2.25, height: "100%" }}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: featured
                      ? alpha(theme.palette.warning.main, 0.14)
                      : alpha(theme.palette.primary.main, 0.1),
                    color: featured ? "warning.dark" : "primary.main",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    fontWeight={900}
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.25,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {subtitle}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                <StatusBadge badge={badge} />
                {featured && (
                  <Chip
                    label="Öncelikli"
                    size="small"
                    sx={{
                      fontWeight: 800,
                      bgcolor: alpha(theme.palette.warning.main, 0.14),
                      color: "warning.dark",
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.24)}`,
                    }}
                  />
                )}
              </Stack>
            </Stack>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.text.primary, 0.02),
                border: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
              }}
            >
              {stats.map((stat) => (
                <StatRow key={`${stat.label}-${stat.value}`} stat={stat} />
              ))}
            </Box>

            <Box sx={{ mt: "auto", pt: 0.25 }}>
              <Typography
                variant="body2"
                fontWeight={900}
                color="primary.main"
                sx={{ display: "inline-flex", alignItems: "center" }}
              >
                {actionLabel}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function SpaceCardSkeleton() {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4.5,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={2}>
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <Skeleton variant="rounded" width={48} height={48} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="58%" height={28} />
                <Skeleton variant="text" width="86%" height={22} />
                <Skeleton variant="text" width="62%" height={22} />
              </Box>
            </Stack>
            <Skeleton variant="rounded" width={110} height={28} />
          </Stack>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              border: (theme: Theme) => `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
            }}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  py: 1,
                  borderBottom:
                    index < 2
                      ? (theme: Theme) => `1px solid ${alpha(theme.palette.text.primary, 0.06)}`
                      : "none",
                }}
              >
                <Skeleton variant="text" width="38%" height={20} />
                <Skeleton variant="text" width="22%" height={22} />
              </Box>
            ))}
          </Box>

          <Skeleton variant="text" width="40%" height={24} />
        </Stack>
      </CardContent>
    </Card>
  );
}

function EmptyStateCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const theme = useTheme<Theme>();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4.5,
        borderStyle: "dashed",
        borderColor: alpha(theme.palette.text.primary, 0.14),
        bgcolor: alpha(theme.palette.text.primary, 0.018),
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.text.primary, 0.05),
              color: "text.secondary",
            }}
          >
            <IconInbox size={22} />
          </Box>

          <Box>
            <Typography fontWeight={900}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ResponsiveGrid({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr",
          xl: "repeat(3, minmax(0, 1fr))",
        },
        gap: 2,
        alignItems: "start",
      }}
    >
      {children}
    </Box>
  );
}

function SpacesSection({
  icon,
  title,
  description,
  items,
  loading,
  emptyTitle,
  emptyDescription,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  items: SpaceCardData[];
  loading: boolean;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <Box>
      <SectionHeader
        icon={icon}
        title={title}
        description={description}
        count={items.length}
        loading={loading}
      />

      <ResponsiveGrid>
        {loading
          ? Array.from({ length: 3 }).map((_, index) => <SpaceCardSkeleton key={index} />)
          : items.length > 0
            ? items.map((item) => <SpaceCard key={item.id} {...item} />)
            : <EmptyStateCard title={emptyTitle} description={emptyDescription} />}
      </ResponsiveGrid>
    </Box>
  );
}

export default function MySpacesView() {
  const prioritizedManaged = [...managedProperties].sort(
    (a, b) => getManagedPriority(b) - getManagedPriority(a),
  );

  const managedCards: SpaceCardData[] = prioritizedManaged.map((item, index) => ({
    id: item.id,
    icon: <IconBuildingCommunity size={24} />,
    title: item.name,
    subtitle: `${item.type} • ${item.address}`,
    badge: { label: item.role },
    stats: [
      { label: "Bağımsız bölüm", value: `${item.unitCount} daire` },
      {
        label: "Geciken ödeme",
        value: `${item.overdueCount}`,
        tone: item.overdueCount > 0 ? "error" : "default",
        emphasis: item.overdueCount > 0,
      },
      {
        label: "Açık talep",
        value: `${item.openRequestCount}`,
        tone: item.openRequestCount > 0 ? "warning" : "default",
        emphasis: item.openRequestCount > 0,
      },
    ],
    actionLabel: "Yönetim paneline git",
    featured: index === 0 && getManagedPriority(item) > 0,
  }));

  const ownedCards: SpaceCardData[] = ownedUnits.map((item) => ({
    id: item.id,
    icon: <IconHome size={24} />,
    title: `${item.propertyName} / ${item.unitNumber}`,
    subtitle: `Kiracı: ${item.tenantName}`,
    badge: { label: "Ev Sahibi" },
    stats: [
      {
        label: "Kira durumu",
        value: item.rentStatus,
        tone: getRentTone(item.rentStatus),
        emphasis: getRentTone(item.rentStatus) !== "default",
      },
      { label: "Birim", value: item.unitNumber },
    ],
    actionLabel: "Daire detaylarını gör",
  }));

  const tenantCards: SpaceCardData[] = tenantResidences.map((item) => ({
    id: item.id,
    icon: <IconKey size={24} />,
    title: `${item.propertyName} / ${item.unitNumber}`,
    subtitle: `Ev sahibi: ${item.ownerName}`,
    badge: { label: "Kiracı" },
    stats: [
      {
        label: "Ödeme durumu",
        value: item.paymentStatus,
        tone: getPaymentTone(item.paymentStatus),
        emphasis: getPaymentTone(item.paymentStatus) !== "default",
      },
      { label: "Birim", value: item.unitNumber },
    ],
    actionLabel: "Konut detaylarını gör",
  }));

  const companyCards: SpaceCardData[] = companyAccesses.map((item) => ({
    id: item.id,
    icon: <IconBuildingSkyscraper size={24} />,
    title: item.companyName,
    subtitle: item.companyType,
    badge: { label: item.role },
    stats: [
      { label: "Aktif ilan", value: `${item.activeListings}` },
      {
        label: "Referans talebi",
        value: `${item.referenceRequests}`,
        tone: item.referenceRequests > 0 ? "warning" : "default",
        emphasis: item.referenceRequests > 0,
      },
    ],
    actionLabel: "Firma paneline git",
  }));

  const overdueTotal = managedProperties.reduce((sum, item) => sum + item.overdueCount, 0);
  const openRequestTotal = managedProperties.reduce((sum, item) => sum + item.openRequestCount, 0);

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={900}>
          Alanlarım
        </Typography>
        <Typography color="text.secondary">
          Yönetici, malik, kiracı veya firma yetkilisi olarak erişebildiğiniz tüm alanlar.
        </Typography>
      </Stack>

      <Box sx={{ mb: 4 }}>
        {isLoading ? (
          <SummarySkeleton />
        ) : (
          <SummaryHero overdueTotal={overdueTotal} openRequestTotal={openRequestTotal} />
        )}
      </Box>

      <Stack spacing={4}>
        <SpacesSection
          icon={<IconBuildingCommunity size={20} />}
          title="Yönettiğim Siteler"
          description="Yönetici olduğunuz apartman ve siteler."
          items={managedCards}
          loading={isLoading}
          emptyTitle="Yönetilen site bulunamadı"
          emptyDescription="Henüz yönetici olarak bağlı olduğunuz bir site veya apartman görünmüyor."
        />

        <SpacesSection
          icon={<IconHome size={20} />}
          title="Sahibi Olduğum Daireler"
          description="Malik olduğunuz daireler."
          items={ownedCards}
          loading={isLoading}
          emptyTitle="Kayıtlı daire bulunamadı"
          emptyDescription="Henüz sahip olduğunuz bir bağımsız bölüm görünmüyor."
        />

        <SpacesSection
          icon={<IconKey size={20} />}
          title="Kiracı Olduğum Konutlar"
          description="Kiracı olarak bulunduğunuz konutlar."
          items={tenantCards}
          loading={isLoading}
          emptyTitle="Kiracı kaydı bulunamadı"
          emptyDescription="Henüz kiracı olarak bağlı olduğunuz bir konut görünmüyor."
        />

        <SpacesSection
          icon={<IconBuildingSkyscraper size={20} />}
          title="Yetkili Olduğum Firmalar"
          description="Yetkili olduğunuz firmalar."
          items={companyCards}
          loading={isLoading}
          emptyTitle="Firma erişimi bulunamadı"
          emptyDescription="Henüz size atanmış firma yetkisi görünmüyor."
        />
      </Stack>
    </Box>
  );
}