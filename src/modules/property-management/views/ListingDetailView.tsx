// src/modules/property-management/views/ListingDetailView.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  alpha,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
 
import {
  IconArrowLeft,
  IconCalendar,
  IconChevronRight,
  IconEdit,
  IconEye,
  IconMapPin,
  IconPhoto,
  IconRocket,
  IconFileDescription,
  IconCircleCheck,
  IconHeart,
  IconHome,
  IconPlayerPause,
  IconShare,
  IconSparkles,
  IconTag,
  IconTrendingUp,
} from "@tabler/icons-react";


type Props = {
  listingId: string;
};

type ListingStatus = "published" | "draft" | "passive";
type ListingType = "rent" | "sale";

type ListingDetail = {
  id: string;
  title: string;
  status: ListingStatus;
  type: ListingType;
  price: string;
  propertyName: string;
  unitInfo: string;
  addressSummary: string;
  description: string;
  coverImage?: string;
  gallery: string[];
  stats: {
    views: number;
    favorites: number;
    updatedAt: string;
    publishedAt: string;
  };
  specs: {
    netArea: string;
    grossArea: string;
    room: string;
    floor: string;
    heating: string;
    titleDeed: string;
    furnished: string;
    usageStatus: string;
  };
};

const listing: ListingDetail = {
  id: "1",
  title: "Merkezi konumda bakımlı 1+1 daire",
  status: "published",
  type: "rent",
  price: "12.500 TL / ay",
  propertyName: "Live Residence",
  unitInfo: "A Blok / No 12",
  addressSummary: "Live Residence, A Blok / No 12 • Altstetten / Zürich",
  description:
    "Site içerisinde, ulaşımı kolay, bakımlı ve kullanıma hazır bağımsız bölüm. Günlük yaşam ihtiyaçlarına yakın, düzenli yapısı ve teknik verileri hazır. Merkezi konumu, fonksiyonel planı ve temiz iç mekân kurgusu ile hem oturum hem yatırım amaçlı değerlendirme için güçlü bir seçenektir.",
  coverImage:
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
  ],
  stats: {
    views: 245,
    favorites: 12,
    updatedAt: "Bugün",
    publishedAt: "3 gün önce",
  },
  specs: {
    netArea: "150 m²",
    grossArea: "165 m²",
    room: "1+1",
    floor: "6",
    heating: "VRV",
    titleDeed: "Kat Mülkiyeti",
    furnished: "Eşyalı",
    usageStatus: "Boş",
  },
};

export default function ListingDetailView({ listingId }: Props) {
  const theme = useTheme<Theme>();
  const statusMeta = getStatusMeta(theme, listing.status);

  return (
    <Stack spacing={3}>
      <Stack spacing={1.5}>
        <Breadcrumbs separator={<IconChevronRight size={14} />}>
          <Typography
            component={Link}
            href="/listings-management"
            color="text.secondary"
            sx={{ textDecoration: "none" }}
          >
            İlan Yönetimi
          </Typography>
          <Typography
            component={Link}
            href="/listings-management/my-listings"
            color="text.secondary"
            sx={{ textDecoration: "none" }}
          >
            İlanlarım
          </Typography>
          <Typography fontWeight={700} color="text.primary">
            İlan Detayı
          </Typography>
        </Breadcrumbs>

        <Button
          component={Link}
          href="/listings-management/my-listings"
          startIcon={<IconArrowLeft size={18} />}
          variant="text"
          sx={{ width: "fit-content", px: 0, fontWeight: 700 }}
        >
          İlan listesine dön
        </Button>
      </Stack>

      <Card
        variant="outlined"
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          borderColor: alpha(theme.palette.primary.main, 0.14),
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.03,
          )} 0%, ${alpha(theme.palette.info.main, 0.03)} 100%)`,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "1.3fr 0.7fr" },
            gap: 0,
          }}
        >
          <Box
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRight: { xl: `1px solid ${alpha(theme.palette.divider, 0.6)}` },
            }}
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
                  gap: 1.25,
                }}
              >
                <ListingImage
                  imageUrl={listing.coverImage}
                  height={340}
                  borderRadius={20}
                  primary
                />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1.25,
                    alignContent: "start",
                  }}
                >
                  {listing.gallery.slice(1, 5).map((image, index) => (
                    <ListingImage
                      key={`${image}-${index}`}
                      imageUrl={image}
                      height={164}
                      borderRadius={16}
                    />
                  ))}
                </Box>
              </Box>

              <Stack
                direction={{ xs: "column", lg: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", lg: "center" }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.25 }}>
                    <Chip
                      label={statusMeta.label}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        color: statusMeta.color,
                        bgcolor: statusMeta.bg,
                        border: `1px solid ${statusMeta.border}`,
                      }}
                    />
                    <Chip
                      label={listing.type === "rent" ? "Kiralık" : "Satılık"}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 800 }}
                    />
                    <Chip label={`ID: ${listingId}`} size="small" variant="outlined" />
                  </Stack>

                  <Typography variant="h4" fontWeight={900} letterSpacing="-0.03em" lineHeight={1.08}>
                    {listing.title}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.25 }}>
                    <IconMapPin size={17} />
                    <Typography color="text.secondary">{listing.addressSummary}</Typography>
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    component={Link}
                    href={`/listings-management/my-listings/${listingId}/preview`}
                    variant="outlined"
                    startIcon={<IconEye size={17} />}
                    sx={{ borderRadius: 2.5, fontWeight: 800 }}
                  >
                    Önizle
                  </Button>

                  <Button
                    component={Link}
                    href={`/listings-management/my-listings/${listingId}/edit`}
                    variant="contained"
                    startIcon={<IconEdit size={17} />}
                    sx={{ borderRadius: 2.5, fontWeight: 800 }}
                  >
                    Düzenle
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Box>

          <Box sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack spacing={1.5}>
              <HeroMetricCard
                icon={<IconTag size={18} />}
                label="Fiyat"
                value={listing.price}
                tone="primary"
                featured
              />
              <HeroMetricCard
                icon={<IconEye size={18} />}
                label="Görüntülenme"
                value={String(listing.stats.views)}
              />
              <HeroMetricCard
                icon={<IconHeart size={18} />}
                label="Favori"
                value={String(listing.stats.favorites)}
                tone="warning"
              />
              <HeroMetricCard
                icon={<IconCalendar size={18} />}
                label="Son güncelleme"
                value={listing.stats.updatedAt}
              />
            </Stack>
          </Box>
        </Box>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1.4fr 0.75fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Stack spacing={2}>
          <SectionCard
            title="İlan Açıklaması"
            subtitle="Yayınlanan metin ve ilanın temel anlatımı."
            icon={<IconFileDescription size={20} />}
          >
            <Typography color="text.secondary" lineHeight={1.8}>
              {listing.description}
            </Typography>
          </SectionCard>

          <SectionCard
            title="Teknik Bilgiler"
            subtitle="Gayrimenkulün yayına yansıyan temel özellikleri."
            icon={<IconHome size={20} />}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 1.25,
              }}
            >
              <InfoTile label="Net Alan" value={listing.specs.netArea} />
              <InfoTile label="Brüt Alan" value={listing.specs.grossArea} />
              <InfoTile label="Oda" value={listing.specs.room} />
              <InfoTile label="Kat" value={listing.specs.floor} />
              <InfoTile label="Isıtma" value={listing.specs.heating} />
              <InfoTile label="Tapu" value={listing.specs.titleDeed} />
              <InfoTile label="Eşya" value={listing.specs.furnished} />
              <InfoTile label="Kullanım Durumu" value={listing.specs.usageStatus} />
            </Box>
          </SectionCard>

          <SectionCard
            title="Yayın Özeti"
            subtitle="İlanın öne çıkan durumu ve yayın bilgileri."
            icon={<IconSparkles size={20} />}
          >
            <Stack spacing={1.25}>
              <SummaryRow label="Yayın Durumu" value={statusMeta.label} valueColor={statusMeta.color} />
              <SummaryRow label="İlan Türü" value={listing.type === "rent" ? "Kiralık" : "Satılık"} />
              <SummaryRow label="Yayınlanma" value={listing.stats.publishedAt} />
              <SummaryRow label="Gayrimenkul" value={`${listing.propertyName} • ${listing.unitInfo}`} />
            </Stack>
          </SectionCard>
        </Stack>

        <Stack spacing={2} sx={{ position: { xl: "sticky" }, top: { xl: 24 } }}>
          <SectionCard
            title="Performans"
            subtitle="İlanın görünürlük ve etkileşim verileri."
            icon={<IconTrendingUp size={20} />}
          >
            <Stack spacing={1.25}>
              <MetricRow icon={<IconEye size={18} />} label="Görüntülenme" value={String(listing.stats.views)} />
              <MetricRow icon={<IconRocket size={18} />} label="Favori" value={String(listing.stats.favorites)} />
              <MetricRow icon={<IconCalendar size={18} />} label="Son güncelleme" value={listing.stats.updatedAt} />
              <MetricRow icon={<IconSparkles size={18} />} label="Yayınlanma" value={listing.stats.publishedAt} />
            </Stack>
          </SectionCard>

          <SectionCard
            title="Hızlı Aksiyonlar"
            subtitle="İlanı yönetmek için en sık kullanılan işlemler."
            icon={<IconEdit size={20} />}
          >
            <Stack spacing={1}>
              <Button
                component={Link}
                href={`/listings-management/my-listings/${listingId}/edit`}
                variant="contained"
                fullWidth
                startIcon={<IconEdit size={17} />}
                sx={{ borderRadius: 2.5, fontWeight: 800 }}
              >
                İlanı Düzenle
              </Button>

              <Button
                component={Link}
                href={`/listings-management/my-listings/${listingId}/preview`}
                variant="outlined"
                fullWidth
                startIcon={<IconEye size={17} />}
                sx={{ borderRadius: 2.5, fontWeight: 800 }}
              >
                Önizlemeyi Aç
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                startIcon={<IconShare size={17} />}
                sx={{ borderRadius: 2.5, fontWeight: 800 }}
              >
                Paylaşım Linki
              </Button>
            </Stack>
          </SectionCard>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 4.5,
              borderColor: alpha(statusMeta.color, 0.18),
              bgcolor: alpha(statusMeta.color, 0.04),
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Typography fontWeight={900}>Yayın Aksiyonları</Typography>

                <Typography variant="body2" color="text.secondary">
                  İlan şu anda <strong>{statusMeta.label.toLowerCase()}</strong> durumda. Durum değişikliği
                  ile görünürlüğü anında kontrol edebilirsiniz.
                </Typography>

                <Divider flexItem />

                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<IconCircleCheck size={17} />}
                    sx={{ borderRadius: 2.5, fontWeight: 800 }}
                  >
                    Yayında Tut
                  </Button>

                  <Button
                    variant="outlined"
                    color="warning"
                    fullWidth
                    startIcon={<IconPlayerPause size={17} />}
                    sx={{ borderRadius: 2.5, fontWeight: 800 }}
                  >
                    Pasife Çek
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
}

function ListingImage({
  imageUrl,
  height,
  borderRadius,
  primary = false,
}: {
  imageUrl?: string;
  height: number;
  borderRadius: number;
  primary?: boolean;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        height,
        borderRadius,
        overflow: "hidden",
        position: "relative",
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        bgcolor: alpha(theme.palette.primary.main, 0.05),
      }}
    >
      {imageUrl ? (
        <Box
          component="img"
          src={imageUrl}
          alt=""
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <Stack
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{ height: "100%", color: "primary.main" }}
        >
          <IconPhoto size={primary ? 44 : 28} />
          <Typography fontWeight={900} variant={primary ? "body1" : "caption"}>
            Görsel yok
          </Typography>
        </Stack>
      )}
    </Box>
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
        borderColor: alpha(theme.palette.divider, 0.7),
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.1} alignItems="center">
            <Avatar
              variant="rounded"
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            >
              {icon}
            </Avatar>

            <Box>
              <Typography fontWeight={900}>{title}</Typography>
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

function HeroMetricCard({
  icon,
  label,
  value,
  tone = "default",
  featured = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "default" | "primary" | "warning";
  featured?: boolean;
}) {
  const theme = useTheme<Theme>();

  const color =
    tone === "primary"
      ? theme.palette.primary.main
      : tone === "warning"
        ? theme.palette.warning.main
        : theme.palette.text.primary;

  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 3.5,
        border: `1px solid ${alpha(color, featured ? 0.22 : 0.12)}`,
        bgcolor: alpha(color, featured ? 0.07 : 0.035),
      }}
    >
      <Stack spacing={1}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(color, 0.12),
            color,
          }}
        >
          {icon}
        </Box>

        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {label}
        </Typography>

        <Typography
          fontWeight={900}
          sx={{
            color,
            lineHeight: 1.15,
            fontSize: featured ? "1.35rem" : "1.05rem",
          }}
        >
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.7),
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={900}>{value}</Typography>
    </Box>
  );
}

function MetricRow({
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
    <Stack
      direction="row"
      spacing={1.25}
      justifyContent="space-between"
      alignItems="center"
      sx={{
        p: 1.25,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.6),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ color: "primary.main", display: "inline-flex" }}>{icon}</Box>
        <Typography color="text.secondary">{label}</Typography>
      </Stack>

      <Typography fontWeight={900}>{value}</Typography>
    </Stack>
  );
}

function SummaryRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  const theme = useTheme<Theme>();

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      spacing={2}
      alignItems="center"
      sx={{
        py: 1,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        "&:last-child": { borderBottom: "none", pb: 0 },
        "&:first-child": { pt: 0 },
      }}
    >
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={900} sx={{ color: valueColor ?? "text.primary", textAlign: "right" }}>
        {value}
      </Typography>
    </Stack>
  );
}

function getStatusMeta(theme: Theme, status: ListingStatus) {
  if (status === "published") {
    return {
      label: "Yayında",
      color: theme.palette.success.dark,
      bg: alpha(theme.palette.success.main, 0.1),
      border: alpha(theme.palette.success.main, 0.2),
    };
  }

  if (status === "draft") {
    return {
      label: "Taslak",
      color: theme.palette.warning.dark,
      bg: alpha(theme.palette.warning.main, 0.12),
      border: alpha(theme.palette.warning.main, 0.22),
    };
  }

  return {
    label: "Pasif",
    color: theme.palette.text.secondary,
    bg: alpha(theme.palette.grey[500], 0.1),
    border: alpha(theme.palette.grey[500], 0.2),
  };
}