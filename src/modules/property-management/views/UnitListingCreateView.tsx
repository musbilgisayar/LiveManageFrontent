"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconBuildingEstate,
  IconCamera,
  IconClipboardList,
  IconDeviceFloppy,
  IconEye,
  IconInfoCircle,
  IconMapPin,
  IconPhoto,
  IconReceipt2,
  IconRuler2,
  IconTrash,
} from "@tabler/icons-react";

type ListingType = "rent" | "sale";

type UnitListingSource = {
  id: string;
  block: string;
  unitNumber: string;
  unitType: "apartment" | "shop" | "office";
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

type ListingPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

const units: UnitListingSource[] = [
  {
    id: "12",
    block: "A",
    unitNumber: "12",
    unitType: "apartment",
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
  },
];

export default function UnitListingCreateView({
  propertyId,
  unitId,
}: {
  propertyId: string;
  unitId: string;
}) {
  const theme = useTheme<Theme>();
  const unit = units.find((item) => item.id === unitId) ?? units[0];

  const [listingType, setListingType] = useState<ListingType>("rent");
  const [title, setTitle] = useState("Merkezi konumda bakımlı 1+1 daire");
  const [price, setPrice] = useState("290000");
  const [description, setDescription] = useState(
    "Site içerisinde, ulaşımı kolay, bakımlı ve kullanıma hazır bağımsız bölüm. Günlük yaşam ihtiyaçlarına yakın, düzenli yapısı ve teknik verileri hazır.",
  );
  const [photos, setPhotos] = useState<ListingPhoto[]>([]);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, [photos]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const newPhotos = files.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
    event.target.value = "";
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => {
      const target = prev.find((item) => item.id === photoId);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== photoId);
    });
  };

  const previewTitle = title.trim() || `${getUnitTypeLabel(unit.unitType)} İlanı`;
  const previewPrice = price.trim() ? formatPrice(price, listingType) : "Fiyat girilmedi";
  const coverPhoto = photos[0]?.previewUrl;

  const previewBadges = useMemo(
    () => [
      getListingTypeLabel(listingType),
      getUnitTypeLabel(unit.unitType),
      `${unit.netArea} m²`,
      unit.roomCount,
      unit.furnished ? "Eşyalı" : "Eşyasız",
    ],
    [listingType, unit],
  );

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
            )} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.2fr 0.9fr" },
              gap: 2,
              alignItems: "stretch",
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                border: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={`Property: ${propertyId}`}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: "primary.main",
                    }}
                  />
                  <Chip
                    label={`Unit: ${unitId}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 800 }}
                  />
                  <Chip
                    label={getUnitTypeLabel(unit.unitType)}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 800 }}
                  />
                </Stack>

                <Box>
                  <Typography variant="h4" fontWeight={900} lineHeight={1.1}>
                    İlan Oluştur
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                    İlan bilgilerini, fotoğrafları ve açıklamayı tamamlayın. Sağ tarafta ilanın
                    canlı önizlemesini görebilirsiniz.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1.25,
              }}
            >
              <MiniStatCard
                icon={<IconRuler2 size={18} />}
                label="Net Alan"
                value={`${unit.netArea} m²`}
              />
              <MiniStatCard
                icon={<IconMapPin size={18} />}
                label="Blok / No"
                value={`${unit.block} / ${unit.unitNumber}`}
              />
              <MiniStatCard
                icon={<IconBuildingEstate size={18} />}
                label="Oda"
                value={unit.roomCount}
              />
              <MiniStatCard
                icon={<IconReceipt2 size={18} />}
                label="Tapu"
                value={unit.titleDeedStatus}
              />
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "1.08fr 0.92fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Stack spacing={2}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 4.5,
                borderColor: alpha(theme.palette.text.primary, 0.08),
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2.5}>
                  <SectionTitle
                    icon={<IconClipboardList size={20} />}
                    title="İlan Bilgileri"
                    subtitle="Yayınlanacak ilan için temel içerikleri düzenleyin."
                  />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 1.5,
                    }}
                  >
                    <TextField
                      select
                      label="İlan tipi"
                      value={listingType}
                      onChange={(event) => setListingType(event.target.value as ListingType)}
                      fullWidth
                    >
                      <MenuItem value="rent">Kiralık</MenuItem>
                      <MenuItem value="sale">Satılık</MenuItem>
                    </TextField>

                    <TextField
                      label="Fiyat"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      fullWidth
                    />
                  </Box>

                  <TextField
                    label="İlan başlığı"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    fullWidth
                  />

                  <TextField
                    label="Açıklama"
                    multiline
                    minRows={6}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    fullWidth
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card
              variant="outlined"
              sx={{
                borderRadius: 4.5,
                borderColor: alpha(theme.palette.text.primary, 0.08),
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2.5}>
                  <SectionTitle
                    icon={<IconCamera size={20} />}
                    title="Fotoğraflar"
                    subtitle="Kapak fotoğrafı ve galeri görselleri ilan kalitesini doğrudan etkiler."
                  />

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 4,
                      border: `1px dashed ${alpha(theme.palette.primary.main, 0.24)}`,
                      bgcolor: alpha(theme.palette.primary.main, 0.03),
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={1.5}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                    >
                      <Box>
                        <Typography fontWeight={900}>Fotoğraf yükleyin</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          JPG veya PNG formatında birden fazla görsel seçebilirsiniz. İlk görsel
                          kapak fotoğrafı olarak kullanılacaktır.
                        </Typography>
                      </Box>

                      <Button
                        component="label"
                        variant="contained"
                        startIcon={<IconPhoto size={18} />}
                        sx={{ borderRadius: 2.5, flexShrink: 0 }}
                      >
                        Fotoğraf Seç
                        <input
                          hidden
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          multiple
                          onChange={handlePhotoChange}
                        />
                      </Button>
                    </Stack>
                  </Box>

                  {photos.length > 0 ? (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr 1fr",
                          md: "repeat(3, minmax(0, 1fr))",
                        },
                        gap: 1.25,
                      }}
                    >
                      {photos.map((photo, index) => (
                        <PhotoPreviewCard
                          key={photo.id}
                          photo={photo}
                          index={index}
                          onRemove={() => handleRemovePhoto(photo.id)}
                        />
                      ))}
                    </Box>
                  ) : (
                    <EmptyPhotoState />
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card
              variant="outlined"
              sx={{
                borderRadius: 4.5,
                borderColor: alpha(theme.palette.primary.main, 0.12),
                bgcolor: alpha(theme.palette.primary.main, 0.025),
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1.5}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                >
                  <Box>
                    <Typography fontWeight={900}>Taslak olarak kaydedin</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Fotoğraflar, başlık ve açıklama ile önizleme hazır. Daha sonra düzenlemeye
                      devam edebilirsiniz.
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<IconDeviceFloppy size={18} />}
                    sx={{ borderRadius: 2.5, flexShrink: 0 }}
                  >
                    İlanı Taslak Olarak Kaydet
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          <Stack spacing={2}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 4.5,
                borderColor: alpha(theme.palette.primary.main, 0.14),
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  <SectionTitle
                    icon={<IconEye size={20} />}
                    title="Canlı İlan Önizlemesi"
                    subtitle="Girilen bilgilere göre kart görünümü anlık güncellenir."
                  />

                  <Box
                    sx={{
                      borderRadius: 4,
                      overflow: "hidden",
                      border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                      bgcolor: theme.palette.background.paper,
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        aspectRatio: "16 / 10",
                        bgcolor: alpha(theme.palette.text.primary, 0.04),
                        backgroundImage: coverPhoto ? `url(${coverPhoto})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {!coverPhoto && (
                        <Stack spacing={1} alignItems="center" sx={{ color: "text.secondary" }}>
                          <IconPhoto size={28} />
                          <Typography variant="body2">Kapak fotoğrafı henüz eklenmedi</Typography>
                        </Stack>
                      )}

                      <Chip
                        label={getListingTypeLabel(listingType)}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          fontWeight: 800,
                          bgcolor: alpha(theme.palette.background.paper, 0.9),
                        }}
                      />
                    </Box>

                    <Box sx={{ p: 2 }}>
                      <Stack spacing={1.25}>
                        <Typography variant="h6" fontWeight={900} lineHeight={1.2}>
                          {previewTitle}
                        </Typography>

                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                          {previewBadges.map((badge) => (
                            <Chip key={badge} label={badge} size="small" variant="outlined" />
                          ))}
                        </Stack>

                        <Typography
                          variant="h5"
                          fontWeight={900}
                          color="primary.main"
                          lineHeight={1.1}
                        >
                          {previewPrice}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {description.trim() || "Açıklama girilmedi."}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Blok {unit.block} / No {unit.unitNumber} • Kat {unit.floor} •{" "}
                          {unit.heatingType}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card
              variant="outlined"
              sx={{
                borderRadius: 4.5,
                borderColor: alpha(theme.palette.primary.main, 0.14),
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  <SectionTitle
                    icon={<IconBuildingEstate size={20} />}
                    title="Otomatik Teknik Bilgiler"
                    subtitle="Bu veriler bağımsız bölüm ana kaydından gelir."
                  />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 1.25,
                    }}
                  >
                    <SpecTile label="Birim türü" value={getUnitTypeLabel(unit.unitType)} />
                    <SpecTile label="Blok / No" value={`${unit.block} / ${unit.unitNumber}`} />
                    <SpecTile label="Brüt m²" value={`${unit.grossArea}`} />
                    <SpecTile label="Net m²" value={`${unit.netArea}`} />
                    <SpecTile label="Oda sayısı" value={unit.roomCount} />
                    <SpecTile label="Banyo" value={`${unit.bathroomCount}`} />
                    <SpecTile label="Kat" value={`${unit.floor}`} />
                    <SpecTile label="Bina yaşı" value={`${unit.buildingAge}`} />
                    <SpecTile label="Isıtma" value={unit.heatingType} />
                    <SpecTile label="Eşya" value={unit.furnished ? "Eşyalı" : "Boş"} />
                    <SpecTile label="Kullanım" value={unit.usageStatus} />
                    <SpecTile label="Tapu" value={unit.titleDeedStatus} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card
              variant="outlined"
              sx={{
                borderRadius: 4.5,
                borderColor: alpha(theme.palette.info.main, 0.16),
                bgcolor: alpha(theme.palette.info.main, 0.04),
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2.25,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha(theme.palette.info.main, 0.12),
                      color: "info.main",
                      flexShrink: 0,
                    }}
                  >
                    <IconInfoCircle size={18} />
                  </Box>

                  <Box>
                    <Typography fontWeight={900}>Kaynak veri korunur</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Teknik bilgiler ana kayıttan gelir. İlan ekranında yalnızca pazarlama içeriği,
                      fotoğraflar ve metinler düzenlenir.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

function formatPrice(value: string, listingType: ListingType) {
  const numeric = Number(value.replace(/[^\d]/g, ""));
  if (!numeric) return "Fiyat girilmedi";

  const formatted = new Intl.NumberFormat("tr-TR").format(numeric);
  return listingType === "rent" ? `${formatted} TL / ay` : `${formatted} TL`;
}

function getListingTypeLabel(type: ListingType) {
  return type === "rent" ? "Kiralık" : "Satılık";
}

function getUnitTypeLabel(type: UnitListingSource["unitType"]) {
  if (type === "shop") return "Dükkan";
  if (type === "office") return "Ofis";
  return "Daire";
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const theme = useTheme<Theme>();

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1.1} alignItems="center">
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

        <Typography fontWeight={900}>{title}</Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Stack>
  );
}

function MiniStatCard({
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
        bgcolor: alpha(theme.palette.background.paper, 0.78),
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

        <Typography fontWeight={900} lineHeight={1.15}>
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}

function PhotoPreviewCard({
  photo,
  index,
  onRemove,
}: {
  photo: ListingPhoto;
  index: number;
  onRemove: () => void;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        borderRadius: 3.5,
        overflow: "hidden",
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          position: "relative",
          aspectRatio: "4 / 3",
          backgroundImage: `url(${photo.previewUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Chip
          label={index === 0 ? "Kapak" : `Foto ${index + 1}`}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            fontWeight: 800,
            bgcolor: alpha(theme.palette.background.paper, 0.88),
          }}
        />
      </Box>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 1.25 }}
      >
        <Typography variant="caption" color="text.secondary" noWrap>
          {photo.file.name}
        </Typography>

        <Button
          size="small"
          color="inherit"
          startIcon={<IconTrash size={14} />}
          onClick={onRemove}
          sx={{ minWidth: "auto", px: 1 }}
        >
          Sil
        </Button>
      </Stack>
    </Box>
  );
}

function EmptyPhotoState() {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: `1px dashed ${alpha(theme.palette.text.primary, 0.14)}`,
        bgcolor: alpha(theme.palette.text.primary, 0.015),
      }}
    >
      <Stack spacing={1} alignItems="center" textAlign="center">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: "primary.main",
          }}
        >
          <IconPhoto size={20} />
        </Box>

        <Typography fontWeight={900}>Henüz fotoğraf eklenmedi</Typography>
        <Typography variant="body2" color="text.secondary">
          En az bir kapak görseli eklemek ilan kalitesini ciddi biçimde artırır.
        </Typography>
      </Stack>
    </Box>
  );
}

function SpecTile({
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
        p: 1.35,
        borderRadius: 3.25,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.72),
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