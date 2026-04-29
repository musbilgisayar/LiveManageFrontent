// src/modules/property-management/views/PropertyUnitDetailView.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconArrowLeft,
  IconBath,
  IconCoin,
  IconDoor,
  IconHome,
  IconMapPin,
  IconRuler2,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

type Tone = "default" | "success" | "warning" | "error";

type UnitDetail = {
  id: string;
  block: string;
  unitNumber: string;
  status: "occupied" | "vacant";
  ownerName: string;
  tenantName?: string;
  rentStatus: string;
  duesStatus: string;
  type: "apartment" | "shop";
  grossArea: number;
  netArea: number;
  roomCount: string;
  bathroomCount: number;
  floor: number;
  buildingAge: number;
  heatingType: string;
  furnished: boolean;
  usageStatus: string;
  titleDeedStatus: string;
};

const unit: UnitDetail = {
  id: "12",
  block: "A",
  unitNumber: "12",
  status: "occupied",
  ownerName: "Mehmet Kaya",
  tenantName: "Ahmet Yılmaz",
  rentStatus: "Düzenli",
  duesStatus: "Ödendi",
  type: "apartment",
  grossArea: 165,
  netArea: 150,
  roomCount: "1+1",
  bathroomCount: 1,
  floor: 6,
  buildingAge: 10,
  heatingType: "VRV",
  furnished: true,
  usageStatus: "Boş",
  titleDeedStatus: "Kat Mülkiyeti",
};

export default function PropertyUnitDetailView({
  propertyId,
  unitId,
}: {
  propertyId: string;
  unitId: string;
}) {
  const theme = useTheme<Theme>();
  const router = useRouter();

  const occupancyTone: Tone = unit.status === "occupied" ? "success" : "warning";
  const rentTone = getFinanceTone(unit.rentStatus);
  const duesTone = getFinanceTone(unit.duesStatus);

  return (
    <Box>
      <Stack spacing={3}>
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 5,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.06,
            )} 0%, ${alpha(theme.palette.success.main, 0.04)} 100%)`,
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
                bgcolor: alpha(theme.palette.background.paper, 0.82),
                border: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
              }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  <Button
                    variant="text"
                    startIcon={<IconArrowLeft size={18} />}
                    onClick={() => router.push(`/property-management/${propertyId}/units`)}
                    sx={{ px: 0, minWidth: "auto" }}
                  >
                    Daire listesine dön
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() =>
                      router.push(`/property-management/${propertyId}/units/${unitId}/create-listing`)
                    }
                    sx={{ borderRadius: 2.5 }}
                  >
                    İlan Oluştur
                  </Button>
                </Stack>

                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <StatusChip label={unit.type === "apartment" ? "Daire" : "Dükkan"} />
                    <StatusChip
                      label={unit.status === "occupied" ? "Dolu" : "Boş"}
                      tone={occupancyTone}
                    />
                  </Stack>

                  <Typography variant="h4" fontWeight={900} lineHeight={1.1}>
                    Blok {unit.block} / Daire {unit.unitNumber}
                  </Typography>

                  <Typography color="text.secondary">
                    Bağımsız bölüm detayları, sahiplik bilgileri ve ilan hazırlığı için teknik
                    veriler burada yer alır.
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1.25,
              }}
            >
              <HighlightStatCard
                icon={<IconHome size={18} />}
                label="Durum"
                value={unit.status === "occupied" ? "Dolu" : "Boş"}
                tone={occupancyTone}
              />
              <HighlightStatCard
                icon={<IconCoin size={18} />}
                label="Aidat"
                value={unit.duesStatus}
                tone={duesTone}
              />
              <CompactStatCard
                icon={<IconRuler2 size={18} />}
                label="Net Alan"
                value={`${unit.netArea} m²`}
              />
              <CompactStatCard
                icon={<IconBath size={18} />}
                label="Oda / Banyo"
                value={`${unit.roomCount} • ${unit.bathroomCount}`}
              />
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <InfoSectionCard
            title="Kimlik ve Sahiplik"
            subtitle="Bağımsız bölümün kullanıcı ve sahiplik bilgileri."
            icon={<IconDoor size={20} />}
          >
            <InfoList
              items={[
                { label: "Birim tipi", value: unit.type === "apartment" ? "Daire" : "Dükkan" },
                { label: "Durum", value: unit.status === "occupied" ? "Dolu" : "Boş", tone: occupancyTone },
                { label: "Malik", value: unit.ownerName },
                { label: "Kiracı", value: unit.tenantName ?? "-" },
                { label: "Kullanım durumu", value: unit.usageStatus },
              ]}
            />
          </InfoSectionCard>

          <InfoSectionCard
            title="Finans Durumu"
            subtitle="Kira ve aidat tarafındaki güncel ödeme görünümü."
            icon={<IconCoin size={20} />}
          >
            <InfoList
              items={[
                { label: "Kira durumu", value: unit.rentStatus, tone: rentTone },
                { label: "Aidat durumu", value: unit.duesStatus, tone: duesTone },
                { label: "Doluluk", value: unit.status === "occupied" ? "Aktif kullanımda" : "Boş", tone: occupancyTone },
              ]}
            />
          </InfoSectionCard>

          <InfoSectionCard
            title="Mülk Özellikleri"
            subtitle="İlan ve operasyon süreçlerinde kullanılacak temel bilgiler."
            icon={<IconMapPin size={20} />}
            fullWidth
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr 1fr",
                  xl: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.25,
              }}
            >
              <FeatureTile label="Brüt Alan" value={`${unit.grossArea} m²`} />
              <FeatureTile label="Net Alan" value={`${unit.netArea} m²`} />
              <FeatureTile label="Oda Sayısı" value={unit.roomCount} />
              <FeatureTile label="Banyo Sayısı" value={`${unit.bathroomCount}`} />
              <FeatureTile label="Kat" value={`${unit.floor}`} />
              <FeatureTile label="Bina Yaşı" value={`${unit.buildingAge}`} />
              <FeatureTile label="Isıtma Tipi" value={unit.heatingType} />
              <FeatureTile label="Eşya Durumu" value={unit.furnished ? "Eşyalı" : "Eşyasız"} />
              <FeatureTile label="Tapu Durumu" value={unit.titleDeedStatus} />
            </Box>
          </InfoSectionCard>

          <InfoSectionCard
            title="Hızlı Özet"
            subtitle="İlk bakışta kritik alanları görmeniz için kısa görünüm."
            icon={<IconUsers size={20} />}
          >
            <Stack spacing={1.25}>
              <SummaryRow
                label="Malik / Kiracı"
                value={`${unit.ownerName} / ${unit.tenantName ?? "-"}`}
              />
              <SummaryRow label="Finans" value={`${unit.rentStatus} • ${unit.duesStatus}`} />
              <SummaryRow
                label="İlana Uygunluk"
                value={`${unit.netArea} m² • ${unit.roomCount} • ${unit.furnished ? "Eşyalı" : "Eşyasız"}`}
              />
            </Stack>
          </InfoSectionCard>

          <InfoSectionCard
            title="Teknik Notlar"
            subtitle="İleride bakım, ilan ve operasyon alanlarında kullanılabilir."
            icon={<IconSettings size={20} />}
          >
            <Stack spacing={1.25}>
              <NoteBox>
                Bu yapı ilan oluşturma ekranı ile uyumlu olacak şekilde genişletildi. Mülk tipi,
                alan bilgileri, oda sayısı, ısıtma ve tapu durumu gibi veriler hazır.
              </NoteBox>
              <NoteBox>
                İleride fotoğraf, balkon, cephe, site içi olanaklar ve enerji sınıfı gibi alanlar
                da aynı yapıya eklenebilir.
              </NoteBox>
            </Stack>
          </InfoSectionCard>
        </Box>
      </Stack>
    </Box>
  );
}

function getToneStyles(theme: Theme, tone: Tone = "default") {
  if (tone === "success") {
    return {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.dark,
      border: alpha(theme.palette.success.main, 0.2),
    };
  }

  if (tone === "warning") {
    return {
      bg: alpha(theme.palette.warning.main, 0.12),
      color: theme.palette.warning.dark,
      border: alpha(theme.palette.warning.main, 0.22),
    };
  }

  if (tone === "error") {
    return {
      bg: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.dark,
      border: alpha(theme.palette.error.main, 0.2),
    };
  }

  return {
    bg: alpha(theme.palette.primary.main, 0.06),
    color: theme.palette.primary.main,
    border: alpha(theme.palette.primary.main, 0.12),
  };
}

function getFinanceTone(status: string): Tone {
  const value = status.toLowerCase();

  if (value.includes("ödendi") || value.includes("düzenli")) return "success";
  if (value.includes("bekleniyor") || value.includes("gecik")) return "warning";
  return "default";
}

function StatusChip({
  label,
  tone = "default",
}: {
  label: string;
  tone?: Tone;
}) {
  const theme = useTheme<Theme>();
  const styles = getToneStyles(theme, tone);

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 800,
        bgcolor: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
      }}
    />
  );
}

function HighlightStatCard({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: Tone;
}) {
  const theme = useTheme<Theme>();
  const styles = getToneStyles(theme, tone);

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3.5,
        border: `1px solid ${styles.border}`,
        bgcolor: styles.bg,
      }}
    >
      <Stack spacing={0.75}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2.25,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.palette.background.paper, 0.72),
            color: styles.color,
          }}
        >
          {icon}
        </Box>

        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>

        <Typography fontWeight={900} sx={{ color: styles.color, lineHeight: 1.1 }}>
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}

function CompactStatCard({
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
        p: 1.5,
        borderRadius: 3.5,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.72),
      }}
    >
      <Stack spacing={0.75}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2.25,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: "primary.main",
          }}
        >
          {icon}
        </Box>

        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>

        <Typography fontWeight={900} lineHeight={1.1}>
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}

function InfoSectionCard({
  title,
  subtitle,
  icon,
  children,
  fullWidth = false,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const theme = useTheme<Theme>();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4.5,
        borderColor: alpha(theme.palette.text.primary, 0.08),
        gridColumn: fullWidth ? { xs: "span 1", lg: "span 2" } : undefined,
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
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

function InfoList({
  items,
}: {
  items: Array<{ label: string; value: string; tone?: Tone }>;
}) {
  return (
    <Stack spacing={0}>
      {items.map((item) => (
        <InfoRow key={`${item.label}-${item.value}`} label={item.label} value={item.value} tone={item.tone} />
      ))}
    </Stack>
  );
}

function InfoRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: Tone;
}) {
  const theme = useTheme<Theme>();
  const styles = getToneStyles(theme, tone);

  return (
    <Stack
      direction="row"
      spacing={1.5}
      justifyContent="space-between"
      alignItems="center"
      sx={{
        py: 1.25,
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
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={800}
        sx={{
          color: tone ? styles.color : "text.primary",
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function FeatureTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3.5,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        bgcolor: alpha(theme.palette.text.primary, 0.018),
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography fontWeight={800} sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
  );
}

function SummaryRow({
  label,
  value,
}: {
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
        bgcolor: alpha(theme.palette.text.primary, 0.018),
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography fontWeight={800} sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
  );
}

function NoteBox({ children }: { children: React.ReactNode }) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3.5,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        bgcolor: alpha(theme.palette.primary.main, 0.025),
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {children}
      </Typography>
    </Box>
  );
}