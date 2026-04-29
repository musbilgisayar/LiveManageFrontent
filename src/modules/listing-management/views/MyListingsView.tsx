// src/modules/listing-management/views/MyListingsView.tsx
"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Fade,
  Grow,
  IconButton,
  InputAdornment,
  MenuItem,
  Skeleton,
  Slide,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconAlertTriangle,
  IconBuildingEstate,
  IconCalendar,
  IconCircleCheck,
  IconClock,
  IconEdit,
  IconEye,
  IconFileDescription,
  IconGridDots,
  IconLayoutList,
  IconMapPin,
  IconPhoto,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconStack2,
  IconTrendingUp,
} from "@tabler/icons-react";

type ListingStatus = "all" | "draft" | "published" | "passive";
type ViewMode = "grid" | "list";

type ListingItem = {
  id: string;
  title: string;
  type: "rent" | "sale";
  status: Exclude<ListingStatus, "all">;
  price: string;
  propertyName: string;
  unitInfo: string;
  area: string;
  room: string;
  updatedAt: string;
  viewCount?: number;
  favoriteCount?: number;
  coverImage?: string;
};

const MOCK_LISTINGS: ListingItem[] = [
  {
    id: "1",
    title: "Merkezi konumda bakımlı 1+1 daire",
    type: "rent",
    status: "published",
    price: "12.500 TL / ay",
    propertyName: "Live Residence",
    unitInfo: "A Blok / No 12",
    area: "150 m²",
    room: "1+1",
    updatedAt: "Bugün",
    viewCount: 245,
    favoriteCount: 12,
    coverImage:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "2",
    title: "Cadde üstü geniş dükkan",
    type: "sale",
    status: "published",
    price: "4.850.000 TL",
    propertyName: "Merkez Plaza",
    unitInfo: "Zemin / No 3",
    area: "95 m²",
    room: "Açık alan",
    updatedAt: "Dün",
    viewCount: 189,
    favoriteCount: 8,
    coverImage:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "3",
    title: "Deniz manzaralı lüks rezidans",
    type: "sale",
    status: "draft",
    price: "7.200.000 TL",
    propertyName: "Sahil Rezidans",
    unitInfo: "B Blok / No 15",
    area: "180 m²",
    room: "3+1",
    updatedAt: "3 gün önce",
    viewCount: 0,
    favoriteCount: 0,
    coverImage:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "4",
    title: "Metroya yakın stüdyo daire",
    type: "rent",
    status: "passive",
    price: "6.000 TL / ay",
    propertyName: "Metro Konakları",
    unitInfo: "C Blok / No 4",
    area: "65 m²",
    room: "Stüdyo",
    updatedAt: "1 hafta önce",
    viewCount: 320,
    favoriteCount: 15,
  },
  {
    id: "5",
    title: "Merkezi konumda ofis katı",
    type: "rent",
    status: "published",
    price: "25.000 TL / ay",
    propertyName: "Plaza 2000",
    unitInfo: "Kat 5 / No 22",
    area: "200 m²",
    room: "5+1",
    updatedAt: "2 gün önce",
    viewCount: 98,
    favoriteCount: 5,
    coverImage:
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "6",
    title: "Bahçeli müstakil villa",
    type: "sale",
    status: "draft",
    price: "12.000.000 TL",
    propertyName: "Yeşil Vadi",
    unitInfo: "Villa No 8",
    area: "350 m²",
    room: "6+2",
    updatedAt: "5 gün önce",
    viewCount: 0,
    favoriteCount: 0,
    coverImage:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
  },
];

const STATUS_OPTIONS: { value: ListingStatus; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "published", label: "Yayında" },
  { value: "draft", label: "Taslak" },
  { value: "passive", label: "Pasif" },
];

export default function MyListingsView() {
  const theme = useTheme<Theme>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ListingStatus>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = useCallback(
    <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
      setIsLoading(true);
      setter(value);
      setTimeout(() => setIsLoading(false), 350);
    },
    [],
  );

  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase();

    return MOCK_LISTINGS.filter((item) => {
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.propertyName.toLowerCase().includes(q) ||
        item.unitInfo.toLowerCase().includes(q);

      const matchesStatus = status === "all" || item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const totalCount = MOCK_LISTINGS.length;
  const publishedCount = MOCK_LISTINGS.filter((l) => l.status === "published").length;
  const draftCount = MOCK_LISTINGS.filter((l) => l.status === "draft").length;
  const passiveCount = MOCK_LISTINGS.filter((l) => l.status === "passive").length;
  const totalViews = MOCK_LISTINGS.reduce((sum, l) => sum + (l.viewCount || 0), 0);

  const isFiltered = search.trim() !== "" || status !== "all";

  const handleClearFilters = () => {
    setIsLoading(true);
    setSearch("");
    setStatus("all");
    setTimeout(() => setIsLoading(false), 350);
  };

  return (
    <Stack spacing={3}>
      <Slide direction="down" in timeout={500}>
        <Box
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 5,
            position: "relative",
            overflow: "hidden",
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.08)} 0%, 
              ${alpha(theme.palette.primary.light, 0.05)} 35%, 
              ${alpha(theme.palette.info.main, 0.04)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            "&::before": {
              content: '""',
              position: "absolute",
              top: -70,
              right: -70,
              width: 250,
              height: 250,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(
                theme.palette.primary.main,
                0.12,
              )} 0%, transparent 70%)`,
              pointerEvents: "none",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -50,
              left: -50,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(
                theme.palette.success.main,
                0.1,
              )} 0%, transparent 70%)`,
              pointerEvents: "none",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2.5}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Chip
                    label="İlan Yönetimi"
                    size="small"
                    sx={{
                      fontWeight: 800,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      backdropFilter: "blur(8px)",
                    }}
                  />
                  <Chip
                    label={`${totalCount} ilan`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 800 }}
                  />
                </Stack>

                <Typography
                  variant="h4"
                  fontWeight={900}
                  letterSpacing="-0.03em"
                  lineHeight={1.1}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${alpha(
                      theme.palette.text.primary,
                      0.7,
                    )} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  İlanlarım
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  İlanlarınızı görüntüleyin, düzenleyin ve performanslarını takip edin.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<IconPlus size={20} stroke={2.5} />}
                sx={{
                  borderRadius: 3,
                  fontWeight: 800,
                  textTransform: "none",
                  px: 3,
                  py: 1.25,
                  flexShrink: 0,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                  "&:hover": {
                    boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                Yeni İlan Oluştur
              </Button>
            </Stack>
          </Box>
        </Box>
      </Slide>

      <Fade in timeout={600}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              xl: "repeat(5, minmax(0, 1fr))",
            },
            gap: 1.5,
            alignItems: "start",
          }}
        >
          <StatCard
            icon={<IconFileDescription size={20} stroke={2} />}
            label="Toplam"
            value={String(totalCount)}
            tone="default"
          />
          <StatCard
            icon={<IconCircleCheck size={20} stroke={2} />}
            label="Yayında"
            value={String(publishedCount)}
            tone="success"
          />
          <StatCard
            icon={<IconClock size={20} stroke={2} />}
            label="Taslak"
            value={String(draftCount)}
            tone="warning"
          />
          <StatCard
            icon={<IconAlertTriangle size={20} stroke={2} />}
            label="Pasif"
            value={String(passiveCount)}
            tone="info"
          />
          <StatCard
            icon={<IconTrendingUp size={20} stroke={2} />}
            label="Görüntülenme"
            value={totalViews.toLocaleString()}
            tone="default"
          />
        </Box>
      </Fade>

      <Fade in timeout={700}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 5,
            borderColor: alpha(theme.palette.divider, 0.6),
            background: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: "blur(16px)",
            boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.03)}`,
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", md: "center" }}
              >
                <TextField
                  value={search}
                  onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                  placeholder="İlan başlığı, mülk veya birim ara..."
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={20} stroke={2} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 3,
                      bgcolor: "background.paper",
                      "&:hover": {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.12)}`,
                      },
                      "&.Mui-focused": {
                        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.18)}`,
                      },
                    },
                  }}
                />

                <TextField
                  select
                  label="Durum"
                  value={status}
                  onChange={(e) =>
                    handleFilterChange(setStatus, e.target.value as ListingStatus)
                  }
                  sx={{ minWidth: { xs: "100%", md: 180 } }}
                  InputProps={{
                    sx: {
                      borderRadius: 3,
                      bgcolor: "background.paper",
                    },
                  }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, value) => value && setViewMode(value)}
                  size="medium"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    borderRadius: 3,
                    p: 0.5,
                    flexShrink: 0,
                    "& .MuiToggleButton-root": {
                      borderRadius: 2.5,
                      border: "none",
                      px: 2,
                      py: 1,
                      fontWeight: 700,
                      color: "text.secondary",
                      "&.Mui-selected": {
                        bgcolor: "background.paper",
                        color: "primary.main",
                        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                      },
                    },
                  }}
                >
                  <ToggleButton value="grid">
                    <IconGridDots size={18} style={{ marginRight: 6 }} />
                    Grid
                  </ToggleButton>
                  <ToggleButton value="list">
                    <IconLayoutList size={18} style={{ marginRight: 6 }} />
                    Liste
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              {isFiltered && (
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  {status !== "all" && (
                    <FilterChip
                      label={`Durum: ${getStatusLabel(status)}`}
                      onDelete={() => setStatus("all")}
                    />
                  )}
                  {search.trim() && (
                    <FilterChip
                      label={`Arama: "${search.trim()}"`}
                      onDelete={() => setSearch("")}
                    />
                  )}
                  <Button
                    size="small"
                    onClick={handleClearFilters}
                    sx={{
                      borderRadius: 2.5,
                      fontWeight: 700,
                      textTransform: "none",
                      color: "text.secondary",
                      fontSize: "0.75rem",
                    }}
                  >
                    Tümünü Temizle
                  </Button>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Fade>

      {isLoading ? (
        <LoadingSkeletons viewMode={viewMode} />
      ) : filteredListings.length > 0 ? (
        viewMode === "list" ? (
          <Stack spacing={2}>
            {filteredListings.map((listing, index) => (
              <Grow in timeout={300 + index * 100} key={listing.id}>
                <Box>
                  <ListingListItem listing={listing} />
                </Box>
              </Grow>
            ))}
          </Stack>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
              alignItems: "stretch",
            }}
          >
            {filteredListings.map((listing, index) => (
              <Grow in timeout={300 + index * 100} key={listing.id}>
                <Box>
                  <ListingGridCard listing={listing} />
                </Box>
              </Grow>
            ))}
          </Box>
        )
      ) : (
        <Grow in timeout={400}>
          <Box>
            <PremiumEmptyState onClear={handleClearFilters} />
          </Box>
        </Grow>
      )}
    </Stack>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "default" | "success" | "warning" | "info";
}) {
  const theme = useTheme<Theme>();
  const styles = getToneStyles(theme, tone);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 4,
        border: `1px solid ${styles.border}`,
        bgcolor: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: "blur(8px)",
        transition: "all 200ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 8px 24px ${alpha(styles.color, 0.1)}`,
        },
      }}
    >
      <Stack spacing={1}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            bgcolor: styles.bg,
            color: styles.color,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
          <Typography variant="h6" fontWeight={900} sx={{ color: styles.color }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function ListingGridCard({ listing }: { listing: ListingItem }) {
  const theme = useTheme<Theme>();
  const [isHovered, setIsHovered] = useState(false);
  const statusMeta = getStatusMeta(theme, listing.status);

  const placeholderGradient =
    listing.status === "published"
      ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.2)} 0%, ${alpha(
          theme.palette.primary.main,
          0.15,
        )} 100%)`
      : listing.status === "draft"
        ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.2)} 0%, ${alpha(
            theme.palette.warning.light,
            0.1,
          )} 100%)`
        : `linear-gradient(135deg, ${alpha(theme.palette.grey[400], 0.2)} 0%, ${alpha(
            theme.palette.grey[300],
            0.1,
          )} 100%)`;

  return (
    <Card
      variant="outlined"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: "100%",
        borderRadius: 5,
        overflow: "hidden",
        borderColor: isHovered
          ? alpha(theme.palette.primary.main, 0.3)
          : alpha(theme.palette.divider, 0.5),
        transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 16px 48px ${alpha(theme.palette.common.black, 0.1)}`
          : `0 2px 8px ${alpha(theme.palette.common.black, 0.02)}`,
        cursor: "pointer",
      }}
    >
      <ListingImage
        imageUrl={listing.coverImage}
        height={160}
        placeholderGradient={placeholderGradient}
        isHovered={isHovered}
        statusMeta={statusMeta}
        typeLabel={listing.type === "rent" ? "Kiralık" : "Satılık"}
        compact={false}
      />

      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={2}>
          <Box>
            <Typography
              fontWeight={900}
              fontSize="1rem"
              letterSpacing="-0.01em"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.3,
              }}
            >
              {listing.title}
            </Typography>

            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.75 }}>
              <IconMapPin size={14} stroke={2} style={{ color: theme.palette.text.disabled }} />
              <Typography variant="body2" color="text.secondary">
                {listing.propertyName} • {listing.unitInfo}
              </Typography>
            </Stack>
          </Box>

          <Typography variant="h6" fontWeight={900} color="primary.main" letterSpacing="-0.02em">
            {listing.price}
          </Typography>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <MetaChip label={listing.area} />
            <MetaChip label={listing.room} />
            {listing.viewCount ? <MetaChip label={`${listing.viewCount} görüntülenme`} /> : null}
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ pt: 1, borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}` }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconCalendar size={14} style={{ color: theme.palette.text.disabled }} />
              <Typography variant="caption" color="text.disabled" fontWeight={600}>
                {listing.updatedAt}
              </Typography>
            </Stack>

            {listing.favoriteCount ? (
              <Chip
                icon={<IconSparkles size={12} />}
                label={String(listing.favoriteCount)}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: theme.palette.warning.dark,
                }}
              />
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ListingListItem({ listing }: { listing: ListingItem }) {
  const theme = useTheme<Theme>();
  const [isHovered, setIsHovered] = useState(false);
  const statusMeta = getStatusMeta(theme, listing.status);

  const placeholderGradient =
    listing.status === "published"
      ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.18)} 0%, ${alpha(
          theme.palette.primary.main,
          0.14,
        )} 100%)`
      : listing.status === "draft"
        ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.18)} 0%, ${alpha(
            theme.palette.warning.light,
            0.1,
          )} 100%)`
        : `linear-gradient(135deg, ${alpha(theme.palette.grey[400], 0.18)} 0%, ${alpha(
            theme.palette.grey[300],
            0.1,
          )} 100%)`;

  return (
    <Card
      variant="outlined"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        borderRadius: 5,
        borderColor: isHovered
          ? alpha(theme.palette.primary.main, 0.3)
          : alpha(theme.palette.divider, 0.5),
        transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`
          : "none",
        cursor: "pointer",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ flexShrink: 0 }}>
              <ListingImage
                imageUrl={listing.coverImage}
                height={96}
                width={128}
                borderRadius={14}
                placeholderGradient={placeholderGradient}
                isHovered={isHovered}
                statusMeta={statusMeta}
                typeLabel={listing.type === "rent" ? "Kiralık" : "Satılık"}
                compact
              />
            </Box>

            <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                fontWeight={900}
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {listing.title}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {listing.propertyName} • {listing.unitInfo}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <MetaChip label={listing.area} />
                <MetaChip label={listing.room} />
                <StatusChip status={listing.status} />
                <Chip
                  label={listing.type === "rent" ? "Kiralık" : "Satılık"}
                  size="small"
                  sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                />
              </Stack>
            </Stack>
          </Stack>

          <Stack spacing={1.5} alignItems={{ xs: "flex-start", sm: "flex-end" }}>
            <Typography variant="h6" fontWeight={900} color="primary.main" noWrap>
              {listing.price}
            </Typography>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<IconEye size={14} />}
                sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: "none" }}
              >
                Görüntüle
              </Button>

              <Button
                variant="contained"
                size="small"
                startIcon={<IconEdit size={14} />}
                sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: "none" }}
              >
                Düzenle
              </Button>
            </Stack>

            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Typography variant="caption" color="text.disabled" fontWeight={600}>
                {listing.updatedAt}
              </Typography>
              {listing.viewCount ? (
                <Typography variant="caption" color="text.disabled" fontWeight={600}>
                  {listing.viewCount} görüntülenme
                </Typography>
              ) : null}
              {listing.favoriteCount ? (
                <Typography variant="caption" color="warning.dark" fontWeight={600}>
                  {listing.favoriteCount} favori
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ListingImage({
  imageUrl,
  height,
  width,
  borderRadius = 0,
  placeholderGradient,
  isHovered,
  statusMeta,
  typeLabel,
  compact,
}: {
  imageUrl?: string;
  height: number;
  width?: number;
  borderRadius?: number;
  placeholderGradient: string;
  isHovered: boolean;
  statusMeta: ReturnType<typeof getStatusMeta>;
  typeLabel: string;
  compact: boolean;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        position: "relative",
        height,
        width: width ?? "100%",
        borderRadius,
        overflow: "hidden",
        background: imageUrl ? "transparent" : placeholderGradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
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
            transition: "transform 300ms ease",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            display: "block",
          }}
        />
      ) : (
        <Stack spacing={0.75} alignItems="center" sx={{ color: alpha(theme.palette.primary.main, 0.55) }}>
          <IconPhoto size={compact ? 20 : 34} stroke={1.8} />
          {!compact && (
            <Typography variant="caption" fontWeight={700}>
              Görsel yok
            </Typography>
          )}
        </Stack>
      )}

      <Chip
        label={statusMeta.label}
        size="small"
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          fontWeight: 800,
          fontSize: "0.7rem",
          color: statusMeta.color,
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(8px)",
          border: `1px solid ${statusMeta.border}`,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      />

      <Chip
        label={typeLabel}
        size="small"
        sx={{
          position: "absolute",
          top: 10,
          left: 10,
          fontWeight: 800,
          fontSize: "0.7rem",
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(8px)",
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        }}
      />

      {!compact && (
        <Fade in={isHovered}>
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              right: 12,
              display: "flex",
              gap: 0.5,
            }}
          >
            <Tooltip title="Görüntüle" arrow>
              <IconButton
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: "blur(8px)",
                  "&:hover": { bgcolor: "background.paper" },
                }}
              >
                <IconEye size={16} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Düzenle" arrow>
              <IconButton
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: "blur(8px)",
                  "&:hover": { bgcolor: "background.paper" },
                }}
              >
                <IconEdit size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </Fade>
      )}
    </Box>
  );
}

function PremiumEmptyState({ onClear }: { onClear: () => void }) {
  const theme = useTheme<Theme>();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 5,
        borderStyle: "dashed",
        borderColor: alpha(theme.palette.divider, 0.8),
        bgcolor: alpha(theme.palette.background.default, 0.4),
        backdropFilter: "blur(12px)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(
            theme.palette.primary.main,
            0.06,
          )} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <CardContent sx={{ p: { xs: 4, md: 6 }, position: "relative", zIndex: 1 }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 4,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              animation: "pulse 2s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.2)}` },
                "50%": { boxShadow: `0 0 0 16px ${alpha(theme.palette.primary.main, 0)}` },
              },
            }}
          >
            <IconStack2 size={36} stroke={1.5} style={{ color: theme.palette.primary.main }} />
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={900} letterSpacing="-0.02em">
              Eşleşen ilan bulunamadı
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 480, mx: "auto" }}>
              Arama kriterlerinize uygun ilan bulunamadı. Filtreleri değiştirerek veya temizleyerek
              tekrar deneyin.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={onClear}
            sx={{
              borderRadius: 3,
              fontWeight: 800,
              textTransform: "none",
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            Filtreleri Temizle
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function LoadingSkeletons({ viewMode }: { viewMode: ViewMode }) {
  const isList = viewMode === "list";

  return isList ? (
    <Stack spacing={2}>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} variant="outlined" sx={{ borderRadius: 5, overflow: "hidden" }}>
          <CardContent sx={{ p: 2.25 }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Skeleton variant="rounded" width={128} height={96} sx={{ borderRadius: 3.5 }} />
              <Stack spacing={1.2} sx={{ flex: 1 }}>
                <Skeleton variant="text" width="45%" height={28} />
                <Skeleton variant="text" width="30%" height={20} />
                <Stack direction="row" spacing={1}>
                  <Skeleton variant="rounded" width={70} height={24} />
                  <Skeleton variant="rounded" width={80} height={24} />
                  <Skeleton variant="rounded" width={90} height={24} />
                </Stack>
              </Stack>
              <Stack spacing={1} alignItems="flex-end">
                <Skeleton variant="text" width={120} height={28} />
                <Stack direction="row" spacing={1}>
                  <Skeleton variant="rounded" width={88} height={32} />
                  <Skeleton variant="rounded" width={88} height={32} />
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  ) : (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
          xl: "repeat(3, minmax(0, 1fr))",
        },
        gap: 2,
      }}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} variant="outlined" sx={{ borderRadius: 5, overflow: "hidden" }}>
          <Skeleton variant="rectangular" height={160} />
          <CardContent sx={{ p: 2.25 }}>
            <Stack spacing={1.5}>
              <Skeleton variant="text" width="70%" height={28} />
              <Skeleton variant="text" width="50%" height={20} />
              <Skeleton variant="text" width="40%" height={32} />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="rounded" width={70} height={28} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: 2 }} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

function FilterChip({ label, onDelete }: { label: string; onDelete: () => void }) {
  const theme = useTheme<Theme>();

  return (
    <Chip
      label={label}
      size="small"
      onDelete={onDelete}
      sx={{
        fontWeight: 700,
        bgcolor: alpha(theme.palette.primary.main, 0.06),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        backdropFilter: "blur(8px)",
        fontSize: "0.75rem",
        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.1) },
        "& .MuiChip-deleteIcon": {
          "&:hover": { color: theme.palette.error.main },
        },
      }}
    />
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: (theme) => alpha(theme.palette.divider, 0.6),
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.6),
        fontWeight: 600,
        fontSize: "0.7rem",
      }}
    />
  );
}

function StatusChip({ status }: { status: ListingItem["status"] }) {
  const theme = useTheme<Theme>();
  const meta = getStatusMeta(theme, status);

  return (
    <Chip
      label={meta.label}
      size="small"
      sx={{
        fontWeight: 800,
        fontSize: "0.7rem",
        color: meta.color,
        bgcolor: meta.bg,
        border: `1px solid ${meta.border}`,
      }}
    />
  );
}

function getToneStyles(theme: Theme, tone: "default" | "success" | "warning" | "info") {
  const map = {
    success: {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.dark,
      border: alpha(theme.palette.success.main, 0.2),
    },
    warning: {
      bg: alpha(theme.palette.warning.main, 0.12),
      color: theme.palette.warning.dark,
      border: alpha(theme.palette.warning.main, 0.22),
    },
    info: {
      bg: alpha(theme.palette.info.main, 0.1),
      color: theme.palette.info.dark,
      border: alpha(theme.palette.info.main, 0.2),
    },
    default: {
      bg: alpha(theme.palette.primary.main, 0.08),
      color: theme.palette.primary.main,
      border: alpha(theme.palette.primary.main, 0.14),
    },
  };

  return map[tone];
}

function getStatusMeta(theme: Theme, status: ListingItem["status"]) {
  const map = {
    published: {
      label: "Yayında",
      color: theme.palette.success.dark,
      bg: alpha(theme.palette.success.main, 0.1),
      border: alpha(theme.palette.success.main, 0.2),
    },
    draft: {
      label: "Taslak",
      color: theme.palette.warning.dark,
      bg: alpha(theme.palette.warning.main, 0.12),
      border: alpha(theme.palette.warning.main, 0.22),
    },
    passive: {
      label: "Pasif",
      color: theme.palette.text.disabled,
      bg: alpha(theme.palette.grey[400], 0.12),
      border: alpha(theme.palette.grey[400], 0.2),
    },
  };

  return map[status];
}

function getStatusLabel(status: ListingStatus): string {
  const map: Record<ListingStatus, string> = {
    all: "Tümü",
    published: "Yayında",
    draft: "Taslak",
    passive: "Pasif",
  };

  return map[status];
}