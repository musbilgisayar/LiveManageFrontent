"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconBuildingCommunity,
  IconCalendarEvent,
  IconChecklist,
  IconCoin,
  IconHomeStats,
  IconReceipt2,
  IconShieldCheck,
  IconTool,
  IconUsers,
} from "@tabler/icons-react";

type Tone = "default" | "success" | "warning" | "error";
type RiskLevel = "low" | "medium" | "high" | "critical";

type RiskyUnit = {
  id: string;
  unitCode: string;
  personName: string;
  relationType: string;
  reason: string;
  overdueAmount: number;
  overdueDays: number;
  riskLevel: RiskLevel;
};

type FinancialActivity = {
  id: string;
  title: string;
  description: string;
  amount: number;
  meta: string;
  tone: Tone;
};

type ManagementActivity = {
  id: string;
  title: string;
  description: string;
  meta: string;
  tone: Tone;
};

type ShortcutItem = {
  id: string;
  label: string;
  description: string;
  href: string;
};

const dashboard = {
  propertyId: "1",
  propertyName: "Green Park Sitesi",
  propertyType: "Site Operasyonları",
  description:
    "Daire ilişkileri, aidat tahsilatı, açık talepler ve riskli kayıtlar için operasyon merkezi.",

  totalUnits: 48,
  occupiedUnits: 42,
  vacantUnits: 6,

  ownerCount: 39,
  tenantCount: 31,
  activeOccupancyCount: 42,

  monthlyExpectedAmount: 38400,
  monthlyCollectedAmount: 31480,
  monthlyOverdueAmount: 6920,
  totalOutstandingBalance: 12850,
  collectionRate: 82,

  openRequestCount: 4,
  highPriorityRequestCount: 2,
  upcomingMeetingCount: 1,
  draftAnnouncementCount: 1,

  riskyUnits: [
    {
      id: "1",
      unitCode: "A Blok / Daire 12",
      personName: "Ahmet Yılmaz",
      relationType: "Kiracı",
      reason: "Aidat gecikmesi",
      overdueAmount: 1450,
      overdueDays: 18,
      riskLevel: "high" as RiskLevel,
    },
    {
      id: "2",
      unitCode: "B Blok / Daire 7",
      personName: "Mehmet Kaya",
      relationType: "Ev sahibi",
      reason: "Açık bakım talebi",
      overdueAmount: 0,
      overdueDays: 0,
      riskLevel: "medium" as RiskLevel,
    },
    {
      id: "3",
      unitCode: "C Blok / Daire 3",
      personName: "Zeynep Demir",
      relationType: "Kiracı",
      reason: "Tekrarlayan gecikme",
      overdueAmount: 2380,
      overdueDays: 32,
      riskLevel: "critical" as RiskLevel,
    },
  ],

  recentFinancialActivities: [
    {
      id: "1",
      title: "Aidat tahsilatı alındı",
      description: "A Blok / Daire 4 için ödeme işlendi.",
      amount: 800,
      meta: "Bugün",
      tone: "success" as Tone,
    },
    {
      id: "2",
      title: "Gecikmiş ödeme oluştu",
      description: "C Blok / Daire 3 için gecikme kaydı üretildi.",
      amount: 2380,
      meta: "Bugün",
      tone: "error" as Tone,
    },
    {
      id: "3",
      title: "Yeni dönem aidatı oluşturuldu",
      description: "Mayıs dönemi için toplu tahakkuk hazırlandı.",
      amount: 38400,
      meta: "Dün",
      tone: "default" as Tone,
    },
  ],

  recentManagementActivities: [
    {
      id: "1",
      title: "Yüksek öncelikli bakım talebi",
      description: "Asansör arızası için teknik ekip yönlendirmesi bekleniyor.",
      meta: "Son 2 saat",
      tone: "warning" as Tone,
    },
    {
      id: "2",
      title: "Toplantı planlandı",
      description: "Aylık site yönetim toplantısı takvime eklendi.",
      meta: "Yarın",
      tone: "default" as Tone,
    },
    {
      id: "3",
      title: "Duyuru taslağı hazır",
      description: "Aidat ödeme hatırlatması yayınlanmayı bekliyor.",
      meta: "Taslak",
      tone: "default" as Tone,
    },
  ],
};

export default function PropertyOperationsDashboardView({
  propertyId,
}: {
  propertyId: string;
}) {
  const theme = useTheme<Theme>();
  const router = useRouter();

  const hasAttention =
    dashboard.monthlyOverdueAmount > 0 ||
    dashboard.openRequestCount > 0 ||
    dashboard.riskyUnits.length > 0;

  const shortcuts: ShortcutItem[] = [
    {
      id: "finance",
      label: "Aidat / Muhasebe",
      description: "Tahakkuk, tahsilat ve gecikmeleri yönet.",
      href: `/property-operations/${propertyId}/finance`,
    },
    {
      id: "units",
      label: "Daire İlişkileri",
      description: "Ev sahibi, kiracı ve oturum geçmişini gör.",
      href: `/property-operations/${propertyId}/units`,
    },
    {
      id: "maintenance",
      label: "Bakım Talepleri",
      description: "Açık arıza ve destek taleplerini incele.",
      href: `/property-operations/${propertyId}/maintenance`,
    },
    {
      id: "announcements",
      label: "Duyurular",
      description: "Site sakinlerine bilgilendirme yayınla.",
      href: `/property-operations/${propertyId}/announcements`,
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
            0.07,
          )} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.35fr 0.95fr" },
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 2.25,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.background.paper, 0.82),
              border: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
            }}
          >
            <Stack spacing={1.3}>
              <Chip
                label={dashboard.propertyType}
                size="small"
                sx={{
                  width: "fit-content",
                  fontWeight: 800,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: "primary.main",
                }}
              />

              <Typography variant="h4" fontWeight={950} lineHeight={1.08}>
                {dashboard.propertyName}
              </Typography>

              <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                {dashboard.description}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <StatusChip label={`${dashboard.totalUnits} daire`} />
                <StatusChip label={`${dashboard.ownerCount} ev sahibi`} />
                <StatusChip label={`${dashboard.tenantCount} aktif kiracı`} />
                <StatusChip label={`%${dashboard.collectionRate} tahsilat`} tone="success" />
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2.25,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.background.paper, 0.82),
              border: `1px solid ${alpha(
                hasAttention ? theme.palette.warning.main : theme.palette.success.main,
                0.16,
              )}`,
            }}
          >
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.75,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(
                      hasAttention ? theme.palette.warning.main : theme.palette.success.main,
                      0.12,
                    ),
                    color: hasAttention ? "warning.dark" : "success.dark",
                  }}
                >
                  {hasAttention ? <IconAlertTriangle size={21} /> : <IconShieldCheck size={21} />}
                </Box>

                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.7 }}>
                    Operasyon Durumu
                  </Typography>
                  <Typography fontWeight={900}>
                    {hasAttention ? "Takip Gerektiren Kayıtlar Var" : "Operasyon Kontrol Altında"}
                  </Typography>
                </Box>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {hasAttention
                  ? `${dashboard.riskyUnits.length} riskli daire, ${dashboard.monthlyOverdueAmount.toLocaleString(
                      "tr-TR",
                    )} CHF geciken tutar ve ${dashboard.openRequestCount} açık talep bulunuyor.`
                  : "Kritik finansal veya operasyonel uyarı görünmüyor."}
              </Typography>

              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Typography variant="caption" color="text.secondary">
                    Tahsilat oranı
                  </Typography>
                  <Typography variant="caption" fontWeight={900}>
                    %{dashboard.collectionRate}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={dashboard.collectionRate}
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                    },
                  }}
                />
              </Box>
            </Stack>
          </Box>
        </Box>
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
        }}
      >
        <MetricCard
          icon={<IconHomeStats size={22} />}
          label="Daire Durumu"
          value={`${dashboard.occupiedUnits}/${dashboard.totalUnits}`}
          description={`${dashboard.vacantUnits} boş daire mevcut`}
        />

        <MetricCard
          icon={<IconCoin size={22} />}
          label="Beklenen Tahsilat"
          value={formatMoney(dashboard.monthlyExpectedAmount)}
          description="Bu ay oluşturulan toplam tahakkuk"
        />

        <MetricCard
          icon={<IconReceipt2 size={22} />}
          label="Tahsil Edilen"
          value={formatMoney(dashboard.monthlyCollectedAmount)}
          description={`%${dashboard.collectionRate} tahsilat oranı`}
          tone="success"
        />

        <MetricCard
          icon={<IconAlertTriangle size={22} />}
          label="Geciken Tutar"
          value={formatMoney(dashboard.monthlyOverdueAmount)}
          description={`${dashboard.riskyUnits.length} kayıt öncelikli takipte`}
          tone="error"
          featured
        />
      </Box>

      <Box
        sx={{
          mt: 2,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        <MetricCard
          icon={<IconUsers size={22} />}
          label="Aktif Kiracı"
          value={`${dashboard.tenantCount}`}
          description={`${dashboard.activeOccupancyCount} aktif oturum ilişkisi`}
        />

        <MetricCard
          icon={<IconBuildingCommunity size={22} />}
          label="Ev Sahibi"
          value={`${dashboard.ownerCount}`}
          description="Daire ilişkilerine bağlı kayıt"
        />

        <MetricCard
          icon={<IconTool size={22} />}
          label="Açık Talep"
          value={`${dashboard.openRequestCount}`}
          description={`${dashboard.highPriorityRequestCount} yüksek öncelikli`}
          tone="warning"
          featured={dashboard.openRequestCount > 0}
        />

        <MetricCard
          icon={<IconCalendarEvent size={22} />}
          label="Yaklaşan Toplantı"
          value={`${dashboard.upcomingMeetingCount}`}
          description={`${dashboard.draftAnnouncementCount} duyuru taslakta`}
        />
      </Box>

      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            xl: "1.2fr 1fr",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <SectionCard
          title="Riskli Daireler"
          subtitle="Finansal gecikme, açık talep veya ilişki riski taşıyan kayıtlar."
          icon={<IconAlertTriangle size={20} />}
        >
          <Stack divider={<Divider flexItem />} sx={{ mt: 0.5 }}>
            {dashboard.riskyUnits.map((item) => (
              <RiskyUnitRow key={item.id} item={item} />
            ))}
          </Stack>
        </SectionCard>

        <SectionCard
          title="Yönetim Kısayolları"
          subtitle="Sık kullanılan operasyon aksiyonları."
          icon={<IconChecklist size={20} />}
        >
          <Box
            sx={{
              mt: 0.5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "1fr" },
              gap: 1.25,
            }}
          >
            {shortcuts.map((item) => (
              <ShortcutCard key={item.id} item={item} onClick={() => router.push(item.href)} />
            ))}
          </Box>
        </SectionCard>
      </Box>

      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr 1fr",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <SectionCard
          title="Son Finans Hareketleri"
          subtitle="Tahakkuk, ödeme ve gecikme hareketlerinin son durumu."
          icon={<IconCoin size={20} />}
        >
          <Stack divider={<Divider flexItem />} sx={{ mt: 0.5 }}>
            {dashboard.recentFinancialActivities.map((item) => (
              <FinancialActivityRow key={item.id} item={item} />
            ))}
          </Stack>
        </SectionCard>

        <SectionCard
          title="Yönetim Aktiviteleri"
          subtitle="Bakım, toplantı, duyuru ve operasyon kayıtları."
          icon={<IconTool size={20} />}
        >
          <Stack divider={<Divider flexItem />} sx={{ mt: 0.5 }}>
            {dashboard.recentManagementActivities.map((item) => (
              <ManagementActivityRow key={item.id} item={item} />
            ))}
          </Stack>
        </SectionCard>
      </Box>
    </Box>
  );
}

function MetricCard({
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
        borderColor: featured ? alpha(color, 0.28) : alpha(color, 0.16),
        bgcolor: featured ? alpha(color, 0.055) : alpha(theme.palette.background.paper, 0.72),
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
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.75,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(color, 0.12),
                color,
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
            <Typography variant="h4" fontWeight={950} lineHeight={1}>
              {value}
            </Typography>
            <Typography fontWeight={850} sx={{ mt: 0.55 }}>
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
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.75,
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
              <Typography variant="h6" fontWeight={950} lineHeight={1.12}>
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

function RiskyUnitRow({ item }: { item: RiskyUnit }) {
  const theme = useTheme<Theme>();
  const color = getRiskColor(theme, item.riskLevel);

  return (
    <Box sx={{ py: 1.35 }}>
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(color, 0.11),
            color,
            flexShrink: 0,
          }}
        >
          <IconAlertTriangle size={19} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={0.75}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Box>
              <Typography fontWeight={900}>{item.unitCode}</Typography>
              <Typography variant="body2" color="text.secondary">
                {item.personName} · {item.relationType}
              </Typography>
            </Box>

            <Chip
              label={riskLabel(item.riskLevel)}
              size="small"
              sx={{
                fontWeight: 850,
                bgcolor: alpha(color, 0.1),
                color,
                border: `1px solid ${alpha(color, 0.18)}`,
              }}
            />
          </Stack>

          <Typography variant="body2" sx={{ mt: 0.8 }}>
            {item.reason}
            {item.overdueAmount > 0
              ? ` · ${formatMoney(item.overdueAmount)} · ${item.overdueDays} gün gecikme`
              : ""}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function FinancialActivityRow({ item }: { item: FinancialActivity }) {
  const theme = useTheme<Theme>();
  const color = getToneColor(theme, item.tone);

  return (
    <Box sx={{ py: 1.3 }}>
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            mt: 0.85,
            bgcolor: color,
            flexShrink: 0,
          }}
        />

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Typography fontWeight={850}>{item.title}</Typography>
            <Typography fontWeight={900}>{formatMoney(item.amount)}</Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {item.description}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {item.meta}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function ManagementActivityRow({ item }: { item: ManagementActivity }) {
  const theme = useTheme<Theme>();
  const color = getToneColor(theme, item.tone);

  return (
    <Box sx={{ py: 1.3 }}>
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            mt: 0.85,
            bgcolor: color,
            flexShrink: 0,
          }}
        />

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Typography fontWeight={850}>{item.title}</Typography>
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

function ShortcutCard({ item, onClick }: { item: ShortcutItem; onClick: () => void }) {
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
        cursor: "pointer",
        transition: "transform 160ms ease, border-color 160ms ease, background-color 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: alpha(theme.palette.primary.main, 0.2),
          bgcolor: alpha(theme.palette.primary.main, 0.035),
        },
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography fontWeight={850}>{item.label}</Typography>
          <Box sx={{ display: "inline-flex", color: "primary.main" }}>
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

function StatusChip({ label, tone = "default" }: { label: string; tone?: Tone }) {
  const theme = useTheme<Theme>();
  const color = getToneColor(theme, tone);

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 750,
        bgcolor: alpha(color, 0.075),
        color,
        border: `1px solid ${alpha(color, 0.14)}`,
      }}
    />
  );
}

function getToneColor(theme: Theme, tone: Tone = "default") {
  if (tone === "success") return theme.palette.success.main;
  if (tone === "warning") return theme.palette.warning.main;
  if (tone === "error") return theme.palette.error.main;
  return theme.palette.primary.main;
}

function getRiskColor(theme: Theme, risk: RiskLevel) {
  if (risk === "critical") return theme.palette.error.dark;
  if (risk === "high") return theme.palette.error.main;
  if (risk === "medium") return theme.palette.warning.main;
  return theme.palette.success.main;
}

function riskLabel(risk: RiskLevel) {
  if (risk === "critical") return "Kritik";
  if (risk === "high") return "Yüksek";
  if (risk === "medium") return "Orta";
  return "Düşük";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  }).format(value);
}
