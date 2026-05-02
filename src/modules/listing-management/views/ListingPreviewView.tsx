// src/modules/property-management/views/ListingPreviewView.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
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
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconArrowLeft,
  IconBath,
  IconBed,
  IconBuildingEstate,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconCopy,
  IconEdit,
  IconEye,
  IconFlame,
  IconHomeStar,
  IconMapPin,
  IconPhoneCall,
  IconPhoto,
  IconRuler2,
  IconShieldCheck,
  IconShare3,
  IconSparkles,
  IconTag,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

type Props = {
  listingId: string;
};

type ListedByType = "emlakOfisinden" | "sahibinden" | "kiracidan";
type ListingCondition = "sifir" | "ikinciEl";
type ListingStatus = "Yayında" | "Taslak" | "Pasif";

type ListingAddressPreview = {
  country?: string;
  city: string;
  district: string;
  neighborhood: string;
  siteName?: string;
  block?: string;
  unitNo?: string;
  fullAddress?: string;
  fullAddressHidden: boolean;
  mapLabel: string;
};

type ListingPreviewData = {
  listingNo: string;
  title: string;
  type: "Kiralık" | "Satılık";
  statusLabel: ListingStatus;
  previewStatus: "Yayın Önizlemesi";
  condition: ListingCondition;
  price: string;
  listedBy: ListedByType;
  ownerDisplayName: string;
  contactRoleLabel: string;
  address: ListingAddressPreview;
  availableAt: string;
  occupancyStatus: string;
  dues: string;
  deposit: string;
  deedStatus: string;
  usageStatus: string;
  buildingAge: string;
  grossArea: string;
  netArea: string;
  floorInfo: string;
  heating: string;
  furnished: string;
  roomCount: string;
  bathroomCount: string;
  description: string;
  updatedAt: string;
  publishedAt: string;
  publishedScope: string;
  photos: string[];
  specs: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }[];
  quickFacts: {
    label: string;
    value: string;
    icon: React.ReactNode;
  }[];
};

const mockListing: ListingPreviewData = {
  listingNo: "LM-2026-0002",
  title: "Merkezi konumda bakımlı 1+1 daire",
  type: "Kiralık",
  statusLabel: "Yayında",
  previewStatus: "Yayın Önizlemesi",
  condition: "ikinciEl",
  price: "12.500 TL / ay",
  listedBy: "emlakOfisinden",
  ownerDisplayName: "Live Emlak Premium",
  contactRoleLabel: "Emlak Ofisi",
  address: {
    country: "İsviçre",
    city: "Zürich",
    district: "Altstetten",
    neighborhood: "Altstetten Merkez",
    siteName: "Live Residence",
    block: "A Blok",
    unitNo: "12",
    fullAddress: "Altstetten Merkez Mah., Live Residence, A Blok, No 12, Zürich",
    fullAddressHidden: true,
    mapLabel: "Altstetten / Zürich",
  },
  availableAt: "15 Mayıs 2026",
  occupancyStatus: "Kiracılı • Tahliye sürecinde",
  dues: "1.250 TL / ay",
  deposit: "2 kira bedeli",
  deedStatus: "Kat Mülkiyeti",
  usageStatus: "Kiracılı",
  buildingAge: "10",
  grossArea: "165 m²",
  netArea: "150 m²",
  floorInfo: "6. Kat / 12 Kat",
  heating: "VRV",
  furnished: "Eşyalı",
  roomCount: "1+1",
  bathroomCount: "1",
  description:
    "Site içerisinde, ulaşımı kolay, bakımlı ve kullanıma hazır bağımsız bölüm. Günlük yaşam ihtiyaçlarına yakın, düzenli yapısı ve teknik verileri hazır. Fonksiyonel planı, sade iç mekân dili ve erişilebilir konumu sayesinde hedef kullanıcı için hızlı karar verilebilir bir yaşam alanı sunar.",
  updatedAt: "Bugün",
  publishedAt: "30 Nisan 2026",
  publishedScope: "Portal ve mobil görünüm önizlemesi",
  photos: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1560440021-33f9b867899d?auto=format&fit=crop&w=1600&q=85",
  ],
  specs: [
    { icon: <IconRuler2 size={18} />, label: "Brüt Alan", value: "165 m²" },
    { icon: <IconRuler2 size={18} />, label: "Net Alan", value: "150 m²" },
    { icon: <IconHomeStar size={18} />, label: "Oda Sayısı", value: "1+1" },
    { icon: <IconBath size={18} />, label: "Banyo", value: "1" },
    { icon: <IconBuildingEstate size={18} />, label: "Kat Bilgisi", value: "6. Kat / 12 Kat" },
    { icon: <IconFlame size={18} />, label: "Isıtma", value: "VRV" },
    { icon: <IconBed size={18} />, label: "Eşya Durumu", value: "Eşyalı" },
    { icon: <IconCalendar size={18} />, label: "Bina Yaşı", value: "10" },
  ],
  quickFacts: [
    { icon: <IconCalendar size={18} />, label: "Yayın tarihi", value: "30 Nisan 2026" },
    { icon: <IconCalendar size={18} />, label: "Son güncelleme", value: "Bugün" },
    { icon: <IconPhoto size={18} />, label: "Fotoğraf", value: "4 görsel" },
    { icon: <IconEye size={18} />, label: "Önizleme modu", value: "Aktif" },
    { icon: <IconClock size={18} />, label: "Boşalma tarihi", value: "15 Mayıs 2026" },
  ],
};

export default function ListingPreviewView({ listingId }: Props) {
  const theme = useTheme<Theme>();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const detailHref = `/listings-management/my-listings/${listingId}`;
  const editHref = `/listings-management/my-listings/${listingId}/edit`;
  const previewHref = `/listings-management/my-listings/${listingId}/preview`;

  const activePhoto = mockListing.photos[activePhotoIndex];

  const heroGradient = useMemo(
    () =>
      `linear-gradient(180deg, ${alpha(theme.palette.common.black, 0.08)} 0%, ${alpha(
        theme.palette.common.black,
        0.56,
      )} 100%)`,
    [theme],
  );

  const listedByMeta = getListedByMeta(theme, mockListing.listedBy);
  const statusMeta = getStatusMeta(theme, mockListing.statusLabel);
  const conditionLabel = getConditionLabel(mockListing.condition);
  const titleLocation = getTitleLocation(mockListing.address);
  const detailLocation = getDetailLocation(mockListing.address);

  const handleShare = async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${previewHref}`
        : previewHref;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: mockListing.title,
          text: `${mockListing.title} - ${mockListing.price}`,
          url: shareUrl,
        });
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleCopyListingNo = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(mockListing.listingNo);
      }
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev === 0 ? mockListing.photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev === mockListing.photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <Stack spacing={3}>
        <PreviewTopBar
          detailHref={detailHref}
          editHref={editHref}
          listingId={listingId}
          previewLabel={mockListing.previewStatus}
          publishedScope={mockListing.publishedScope}
          onShare={handleShare}
        />

        <Stack spacing={1.5}>
          <Breadcrumbs separator={<IconChevronRight size={14} />}>
            <Typography
              component={Link}
              href="/listings-management/my-listings"
              color="text.secondary"
              sx={{ textDecoration: "none" }}
            >
              İlanlarım
            </Typography>
            <Typography
              component={Link}
              href={detailHref}
              color="text.secondary"
              sx={{ textDecoration: "none" }}
            >
              Detay
            </Typography>
            <Typography fontWeight={700} color="text.primary">
              Önizleme
            </Typography>
          </Breadcrumbs>

          <Alert
            severity="info"
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.info.main, 0.18)}`,
              bgcolor: alpha(theme.palette.info.main, 0.05),
            }}
          >
            Bu alan yayın sonrası son kullanıcının göreceği ilan sayfasına yakın bir önizlemedir.
          </Alert>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "1.38fr 0.78fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Stack spacing={2}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 5,
                overflow: "hidden",
                borderColor: alpha(theme.palette.primary.main, 0.14),
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  minHeight: { xs: 320, md: 500 },
                  backgroundImage: `${heroGradient}, url(${activePhoto})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ position: "absolute", top: 16, left: 16, right: 16 }}
                >
                  <Chip label={mockListing.type} color="primary" sx={{ fontWeight: 900 }} />
                  <Chip label={listedByMeta.label} sx={softChipSx(theme)} />
                  <Chip
                    label={mockListing.statusLabel}
                    sx={{
                      ...softChipSx(theme),
                      color: statusMeta.color,
                      border: `1px solid ${statusMeta.border}`,
                    }}
                  />
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ position: "absolute", right: 16, bottom: 16 }}
                >
                  <IconButton onClick={handlePrevPhoto} sx={galleryControlSx(theme)}>
                    <IconChevronLeft size={18} />
                  </IconButton>
                  <Chip label={`${activePhotoIndex + 1} / ${mockListing.photos.length}`} sx={softChipSx(theme)} />
                  <IconButton onClick={handleNextPhoto} sx={galleryControlSx(theme)}>
                    <IconChevronRight size={18} />
                  </IconButton>
                </Stack>

                <Box sx={{ position: "absolute", left: 20, right: 20, bottom: 68 }}>
                  <Typography
                    variant="h3"
                    fontWeight={900}
                    color="common.white"
                    letterSpacing="-0.04em"
                    lineHeight={1.05}
                  >
                    {mockListing.title}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.25 }}>
                    <IconMapPin size={18} color="white" />
                    <Typography color="common.white" fontWeight={700}>
                      {titleLocation}
                    </Typography>
                  </Stack>

                  <Typography color="rgba(255,255,255,0.84)" sx={{ mt: 0.5 }}>
                    {mockListing.address.mapLabel}
                  </Typography>
                </Box>
              </Box>

              <CardContent sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        sm: "repeat(4, minmax(0, 1fr))",
                      },
                      gap: 1,
                    }}
                  >
                    {mockListing.photos.map((photo, index) => (
                      <Box
                        key={`${photo}-${index}`}
                        onClick={() => setActivePhotoIndex(index)}
                        sx={{
                          height: 90,
                          borderRadius: 3,
                          cursor: "pointer",
                          backgroundImage: `url(${photo})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          border: `2px solid ${
                            activePhotoIndex === index
                              ? theme.palette.primary.main
                              : alpha(theme.palette.divider, 0.7)
                          }`,
                          position: "relative",
                          overflow: "hidden",
                          transition: "transform 160ms ease, border-color 160ms ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        {index === 0 && (
                          <Chip
                            label="Kapak"
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              fontWeight: 800,
                              bgcolor: alpha(theme.palette.background.paper, 0.92),
                            }}
                          />
                        )}
                      </Box>
                    ))}
                  </Box>

                  <Divider />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                      gap: 1.25,
                    }}
                  >
                    <QuickStatTile label="Fiyat" value={mockListing.price} featured />
                    <QuickStatTile label="Brüt / Net" value={`${mockListing.grossArea} • ${mockListing.netArea}`} />
                    <QuickStatTile label="Oda / Banyo" value={`${mockListing.roomCount} • ${mockListing.bathroomCount}`} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <SectionCard
              title="Açıklama"
              subtitle="İlan metninin son kullanıcıya görünen sürümü."
              icon={<IconSparkles size={20} />}
            >
              <Typography color="text.secondary" lineHeight={1.8}>
                {mockListing.description}
              </Typography>
            </SectionCard>

            <SectionCard
              title="Konum Bilgileri"
              subtitle="İlana ait görünen adres katmanı ve yaklaşık konum."
              icon={<IconMapPin size={20} />}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.25,
                }}
              >
                <DecisionTile label="Ülke" value={mockListing.address.country ?? "-"} />
                <DecisionTile label="Şehir" value={mockListing.address.city} />
                <DecisionTile label="İlçe" value={mockListing.address.district} />
                <DecisionTile label="Mahalle / Semt" value={mockListing.address.neighborhood} />
                <DecisionTile label="Site / Proje" value={mockListing.address.siteName ?? "-"} />
                <DecisionTile label="Blok" value={mockListing.address.block ?? "-"} />
                <DecisionTile label="Bağımsız Bölüm" value={mockListing.address.unitNo ?? "-"} />
                <DecisionTile label="Harita etiketi" value={mockListing.address.mapLabel} />
              </Box>

              <Divider />

              <Alert
                severity={mockListing.address.fullAddressHidden ? "warning" : "success"}
                sx={{ borderRadius: 3 }}
              >
                {mockListing.address.fullAddressHidden
                  ? "Tam açık adres güvenlik ve mahremiyet nedeniyle son kullanıcıya gizlenir. İlanda yaklaşık konum gösterilir."
                  : "Tam açık adres kullanıcıya gösterilecek şekilde ayarlanmıştır."}
              </Alert>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 3.5,
                  border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.72),
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Görünen adres özeti
                </Typography>
                <Typography fontWeight={900}>{detailLocation}</Typography>
              </Box>
            </SectionCard>

            <SectionCard
              title="Özellikler"
              subtitle="Kullanıcının teknik detayları hızlıca tarayabileceği alan."
              icon={<IconHomeStar size={20} />}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.25,
                }}
              >
                {mockListing.specs.map((item) => (
                  <FeatureTile
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </Box>
            </SectionCard>

            <SectionCard
              title="Taşınma ve Kullanım Bilgileri"
              subtitle="Karar sürecini etkileyen operasyonel detaylar."
              icon={<IconClock size={20} />}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.25,
                }}
              >
                <DecisionTile label="Boşalma tarihi" value={mockListing.availableAt} />
                <DecisionTile label="Kullanım durumu" value={mockListing.occupancyStatus} />
                <DecisionTile label="Mevcut kullanım" value={mockListing.usageStatus} />
                <DecisionTile label="Aidat" value={mockListing.dues} />
                <DecisionTile label="Depozito" value={mockListing.deposit} />
                <DecisionTile label="Tapu durumu" value={mockListing.deedStatus} />
              </Box>
            </SectionCard>

            <SectionCard
              title="İlan Veren"
              subtitle="İlanın kim tarafından yayınlandığı ve kullanıcıya nasıl göründüğü."
              icon={listedByMeta.icon}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.25,
                }}
              >
                <DecisionTile label="Kimden" value={listedByMeta.label} />
                <DecisionTile label="İletişim tipi" value={mockListing.contactRoleLabel} />
                <DecisionTile label="Görünen ad" value={mockListing.ownerDisplayName} />
                <DecisionTile label="İlan no" value={mockListing.listingNo} />
              </Box>
            </SectionCard>

            <SectionCard
              title="Konum Önizlemesi"
              subtitle="Harita entegrasyonu bağlandığında son kullanıcı burada yaklaşık konumu görür."
              icon={<IconMapPin size={20} />}
            >
              <Box
                sx={{
                  height: 240,
                  borderRadius: 4,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Stack alignItems="center" spacing={1}>
                  <IconMapPin size={34} />
                  <Typography fontWeight={900}>Harita alanı</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {mockListing.address.mapLabel}
                  </Typography>
                </Stack>
              </Box>
            </SectionCard>
          </Stack>

          <Stack spacing={2} sx={{ position: { xl: "sticky" }, top: { xl: 24 } }}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 5,
                borderColor: alpha(theme.palette.primary.main, 0.14),
                bgcolor: alpha(theme.palette.primary.main, 0.025),
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary" fontWeight={800}>
                      FİYAT
                    </Typography>
                    <Typography variant="h3" fontWeight={900} color="primary.main" lineHeight={1.05}>
                      {mockListing.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Aidat: {mockListing.dues}
                    </Typography>
                  </Stack>

                  <Divider />

                  <Stack spacing={1}>
                    <DecisionInlineRow label="Kimden" value={listedByMeta.label} />
                    <DecisionInlineRow label="İlan durumu" value={mockListing.statusLabel} />
                    <DecisionInlineRow label="Durum" value={conditionLabel} />
                    <DecisionInlineRow label="Boşalma" value={mockListing.availableAt} />
                    <DecisionInlineRow label="Konum" value={mockListing.address.mapLabel} />
                    <DecisionInlineRow label="Depozito" value={mockListing.deposit} />
                  </Stack>

                  <Divider />

                  <Stack spacing={1}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<IconPhoneCall size={18} />}
                      disabled
                      sx={{ borderRadius: 3, py: 1.4, fontWeight: 900 }}
                    >
                      Önizleme Modunda İletişim Pasif
                    </Button>

                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<IconShare3 size={18} />}
                      onClick={handleShare}
                      sx={{ borderRadius: 3, py: 1.2, fontWeight: 800 }}
                    >
                      Paylaş
                    </Button>

                    <Button
                      component={Link}
                      href={editHref}
                      variant="outlined"
                      fullWidth
                      startIcon={<IconEdit size={18} />}
                      sx={{ borderRadius: 3, py: 1.2, fontWeight: 800 }}
                    >
                      Düzenle
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <SectionCard
              title="Hızlı Bilgi"
              subtitle="Kullanıcının ilk taramada görebileceği kısa özet."
              icon={<IconClock size={20} />}
            >
              <Stack spacing={1.25}>
                {mockListing.quickFacts.map((item) => (
                  <SpecRow key={item.label} icon={item.icon} label={item.label} value={item.value} />
                ))}
              </Stack>
            </SectionCard>

            <SectionCard
              title="Kalite Kontrol"
              subtitle="Yayına almadan önce doğrulanması gereken alanlar."
              icon={<IconShieldCheck size={20} />}
            >
              <Stack spacing={1.25}>
                <PreviewHintRow
                  icon={<IconPhoto size={18} />}
                  title="Kapak görseli güçlü"
                  description="Hero alanı görsel kalite açısından ilanı iyi taşıyor."
                />
                <PreviewHintRow
                  icon={listedByMeta.icon}
                  title="Kimden bilgisi görünür"
                  description="İlanın emlak ofisinden mi, sahibinden mi, kiracıdan mı geldiği açık."
                />
                <PreviewHintRow
                  icon={<IconMapPin size={18} />}
                  title="Adres katmanı kontrollü"
                  description="Konum bilgisi yeterince açıklayıcı, tam açık adres ise güvenlik için gizlenebilir."
                />
              </Stack>
            </SectionCard>
          </Stack>
        </Box>
      </Stack>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2200}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Card
          sx={{
            borderRadius: 3,
            bgcolor: alpha(theme.palette.grey[900], 0.95),
            color: "#fff",
          }}
        >
          <CardContent sx={{ py: 1.25, px: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconCopy size={16} />
              <Typography fontWeight={700}>Bağlantı veya ilan numarası kopyalandı</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Snackbar>
    </>
  );
}

function PreviewTopBar({
  detailHref,
  editHref,
  listingId,
  previewLabel,
  publishedScope,
  onShare,
}: {
  detailHref: string;
  editHref: string;
  listingId: string;
  previewLabel: string;
  publishedScope: string;
  onShare: () => void;
}) {
  const theme = useTheme<Theme>();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4.5,
        borderColor: alpha(theme.palette.info.main, 0.18),
        bgcolor: alpha(theme.palette.info.main, 0.05),
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "center" }}
        >
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Avatar
              variant="rounded"
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.info.main, 0.12),
                color: theme.palette.info.dark,
              }}
            >
              <IconEye size={18} />
            </Avatar>

            <Box>
              <Typography fontWeight={900}>{previewLabel}</Typography>
              <Typography variant="body2" color="text.secondary">
                Admin aksiyonları bu bantta tutulur. Sayfanın geri kalanı son kullanıcı deneyimine
                daha yakın görünür.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`İlan ID: ${listingId}`} variant="outlined" sx={{ fontWeight: 700 }} />
            <Chip label={publishedScope} variant="outlined" sx={{ fontWeight: 700 }} />
            <Button component={Link} href={detailHref} variant="text" sx={{ fontWeight: 800 }}>
              Detaya Dön
            </Button>
            <Button
              component={Link}
              href={editHref}
              variant="outlined"
              startIcon={<IconEdit size={17} />}
              sx={{ fontWeight: 800, borderRadius: 2.5 }}
            >
              Düzenle
            </Button>
            <Button
              variant="contained"
              startIcon={<IconShare3 size={17} />}
              onClick={onShare}
              sx={{ fontWeight: 800, borderRadius: 2.5 }}
            >
              Paylaş
            </Button>
          </Stack>
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
        borderRadius: 5,
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

function SpecRow({
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
      alignItems="center"
      justifyContent="space-between"
      sx={{
        p: 1.25,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.72),
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

function FeatureTile({
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
        border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.72),
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
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
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography fontWeight={900}>{value}</Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function PreviewHintRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  const theme = useTheme<Theme>();

  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 2.5,
          display: "grid",
          placeItems: "center",
          bgcolor: alpha(theme.palette.success.main, 0.1),
          color: "success.main",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography fontWeight={900}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}

function InlineMetaCard({
  title,
  value,
  subtext,
  icon,
  toneColor,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  toneColor?: string;
}) {
  const theme = useTheme<Theme>();
  const color = toneColor ?? theme.palette.primary.main;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3.5,
        border: `1px solid ${alpha(theme.palette.divider, 0.65)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.72),
      }}
    >
      <Stack direction="row" spacing={1.1} alignItems="flex-start">
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(color, 0.1),
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
          <Typography fontWeight={900}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">
            {subtext}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function DecisionTile({
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
        border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.72),
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={900}>{value}</Typography>
    </Box>
  );
}

function DecisionInlineRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1.5} alignItems="flex-start">
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={900} textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}

function QuickStatTile({
  label,
  value,
  featured = false,
}: {
  label: string;
  value: string;
  featured?: boolean;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3.5,
        border: `1px solid ${alpha(
          featured ? theme.palette.primary.main : theme.palette.divider,
          featured ? 0.18 : 0.7,
        )}`,
        bgcolor: alpha(
          featured ? theme.palette.primary.main : theme.palette.background.paper,
          featured ? 0.05 : 0.72,
        ),
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        fontWeight={900}
        sx={{ color: featured ? "primary.main" : "text.primary" }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function softChipSx(theme: Theme) {
  return {
    fontWeight: 900,
    bgcolor: alpha(theme.palette.background.paper, 0.88),
    backdropFilter: "blur(10px)",
    border: `1px solid ${alpha(theme.palette.divider, 0.45)}`,
  };
}

function galleryControlSx(theme: Theme) {
  return {
    width: 34,
    height: 34,
    bgcolor: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: "blur(8px)",
    color: theme.palette.text.primary,
    "&:hover": {
      bgcolor: theme.palette.background.paper,
    },
  };
}

function getConditionLabel(condition: ListingCondition) {
  return condition === "sifir" ? "Sıfır" : "İkinci El";
}

function getListedByMeta(theme: Theme, listedBy: ListedByType) {
  if (listedBy === "emlakOfisinden") {
    return {
      label: "Emlak Ofisinden",
      color: theme.palette.primary.main,
      icon: <IconBuildingEstate size={18} />,
    };
  }

  if (listedBy === "kiracidan") {
    return {
      label: "Kiracıdan",
      color: theme.palette.warning.main,
      icon: <IconUsers size={18} />,
    };
  }

  return {
    label: "Sahibinden",
    color: theme.palette.success.main,
    icon: <IconUser size={18} />,
  };
}

function getStatusMeta(theme: Theme, status: ListingStatus) {
  if (status === "Yayında") {
    return {
      color: theme.palette.success.dark,
      border: alpha(theme.palette.success.main, 0.2),
    };
  }

  if (status === "Taslak") {
    return {
      color: theme.palette.warning.dark,
      border: alpha(theme.palette.warning.main, 0.2),
    };
  }

  return {
    color: theme.palette.text.secondary,
    border: alpha(theme.palette.grey[500], 0.2),
  };
}

function getTitleLocation(address: ListingAddressPreview) {
  return [address.siteName, address.block ? `${address.block}` : undefined]
    .filter(Boolean)
    .join(" • ");
}

function getDetailLocation(address: ListingAddressPreview) {
  return [
    address.siteName,
    address.block,
    address.unitNo ? `No ${address.unitNo}` : undefined,
    address.neighborhood,
    address.district,
    address.city,
  ]
    .filter(Boolean)
    .join(" • ");
}