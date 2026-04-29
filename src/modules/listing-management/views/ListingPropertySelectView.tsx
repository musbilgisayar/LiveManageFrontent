// src/modules/listing-management/views/ListingPropertySelectView.tsx
"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Fade,
  Grow,
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
  Zoom,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuilding,
  IconBuildingEstate,
  IconBuildingStore,
  IconChecklist,
  IconCircleCheck,
  IconFilter,
  IconGridDots,
  IconHome,
  IconLayoutList,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconStack2,
} from "@tabler/icons-react";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
type PropertyType = "all" | "apartment" | "shop" | "office";
type PropertyStatus = "all" | "ready" | "missingInfo" | "listed";
type ViewMode = "list" | "grid";

type PropertyUnit = {
  id: string;
  name: string;
  type: Exclude<PropertyType, "all">;
  city: string;
  district: string;
  address: string;
  grossArea: number;
  netArea: number;
  roomCount: string;
  status: Exclude<PropertyStatus, "all">;
};

type Tone = "default" | "success" | "warning" | "info";

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------
const MOCK_UNITS: PropertyUnit[] = [
  {
    id: "12",
    name: "Green Park Sitesi / Blok A / Daire 12",
    type: "apartment",
    city: "Zürich",
    district: "Altstetten",
    address: "Green Park Sitesi, A Blok, Daire 12, Altstetten",
    grossArea: 165,
    netArea: 150,
    roomCount: "4+1",
    status: "ready",
  },
  {
    id: "5",
    name: "Mavi Bahçe / Daire 5",
    type: "apartment",
    city: "İstanbul",
    district: "Ataşehir",
    address: "Mavi Bahçe Konakları, Daire 5, Ataşehir",
    grossArea: 120,
    netArea: 105,
    roomCount: "2+1",
    status: "missingInfo",
  },
  {
    id: "8",
    name: "Mavi Bahçe / Daire 8",
    type: "apartment",
    city: "İstanbul",
    district: "Ataşehir",
    address: "Mavi Bahçe Konakları, Daire 8, Ataşehir",
    grossArea: 145,
    netArea: 132,
    roomCount: "3+1",
    status: "ready",
  },
  {
    id: "2",
    name: "ABC Plaza / Dükkan 2",
    type: "shop",
    city: "Ankara",
    district: "Çankaya",
    address: "ABC Plaza, Zemin Kat, Dükkan 2, Çankaya",
    grossArea: 85,
    netArea: 78,
    roomCount: "Açık alan",
    status: "listed",
  },
  {
    id: "7",
    name: "Merkez Ofis / Kat 3 / No:7",
    type: "office",
    city: "İzmir",
    district: "Konak",
    address: "Merkez Ofis Binası, Kat 3, No:7, Konak",
    grossArea: 210,
    netArea: 190,
    roomCount: "5+1",
    status: "ready",
  },
  {
    id: "9",
    name: "Sahil Rezidans / Daire 15",
    type: "apartment",
    city: "Antalya",
    district: "Muratpaşa",
    address: "Sahil Rezidans, Daire 15, Muratpaşa",
    grossArea: 95,
    netArea: 82,
    roomCount: "1+1",
    status: "missingInfo",
  },
];

const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "apartment", label: "Daire" },
  { value: "shop", label: "Dükkan" },
  { value: "office", label: "Ofis" },
];

const STATUS_OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "ready", label: "İlan verilebilir" },
  { value: "missingInfo", label: "Eksik bilgi var" },
  { value: "listed", label: "İlanda" },
];

 
const CREATE_PROPERTY_ROUTE =
  "/property-management/properties/create?returnUrl=/listings-management/create/select-property";

// ----------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------
export default function ListingPropertySelectView() {
  const theme = useTheme<Theme>();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [type, setType] = useState<PropertyType>("all");
  const [status, setStatus] = useState<PropertyStatus>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCreateProperty = useCallback(() => {
    router.push(CREATE_PROPERTY_ROUTE);
  }, [router]);

  const handleFilterChange = useCallback(
    <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
      setIsLoading(true);
      setter(value);
      window.clearTimeout((handleFilterChange as unknown as { timer?: number }).timer);
      (handleFilterChange as unknown as { timer?: number }).timer = window.setTimeout(
        () => setIsLoading(false),
        400,
      );
    },
    [],
  );

  const filteredUnits = useMemo(() => {
    const q = search.trim().toLowerCase();

    return MOCK_UNITS.filter((unit) => {
      const matchesSearch =
        !q ||
        unit.name.toLowerCase().includes(q) ||
        unit.city.toLowerCase().includes(q) ||
        unit.district.toLowerCase().includes(q) ||
        unit.address.toLowerCase().includes(q);

      const matchesType = type === "all" || unit.type === type;
      const matchesStatus = status === "all" || unit.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, type, status]);

  const readyCount = MOCK_UNITS.filter((u) => u.status === "ready").length;
  const listedCount = MOCK_UNITS.filter((u) => u.status === "listed").length;
  const missingInfoCount = MOCK_UNITS.filter((u) => u.status === "missingInfo").length;
  const isFiltered = Boolean(search.trim()) || type !== "all" || status !== "all";

  const handleClearFilters = () => {
    setIsLoading(true);
    setSearch("");
    setType("all");
    setStatus("all");
    setTimeout(() => setIsLoading(false), 400);
  };

  const handleCreateListing = useCallback(
    (unitId: string) => {
      setSelectedId(unitId);
      setTimeout(() => {
        router.push(`/listings-management/create/property/${unitId}`);
      }, 200);
    },
    [router],
  );

  return (
    <Box sx={{ maxWidth: 1440, mx: "auto" }}>
      <Stack spacing={3}>
        <Slide direction="down" in timeout={500}>
          <Box>
            <HeroSection
              totalCount={MOCK_UNITS.length}
              readyCount={readyCount}
              listedCount={listedCount}
              missingInfoCount={missingInfoCount}
              onCreateProperty={handleCreateProperty}
            />
          </Box>
        </Slide>

        <Fade in timeout={700}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 5,
              borderColor: alpha(theme.palette.divider, 0.6),
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(20px)",
              boxShadow: `0 4px 30px ${alpha(theme.palette.common.black, 0.04)}`,
              overflow: "visible",
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                >
                  <Box>
                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="h6" fontWeight={900} letterSpacing="-0.02em">
                        Gayrimenkul Seçimi
                      </Typography>
                      <Zoom in timeout={800}>
                        <Chip
                          label={`${filteredUnits.length} sonuç`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: "primary.main",
                            backdropFilter: "blur(8px)",
                          }}
                        />
                      </Zoom>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                      İlan oluşturulacak bağımsız bölümü seçin. Listede yoksa yeni gayrimenkul
                      tanımlayarak devam edin.
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                    <Button
                      variant="outlined"
                      startIcon={<IconPlus size={18} />}
                      onClick={handleCreateProperty}
                      sx={{
                        borderRadius: 3,
                        fontWeight: 800,
                        textTransform: "none",
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        "&:hover": {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.06),
                        },
                      }}
                    >
                      Yeni Gayrimenkul Tanımla
                    </Button>

                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(_, value) => value && setViewMode(value)}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        borderRadius: 3,
                        p: 0.5,
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
                      <ToggleButton value="list">
                        <IconLayoutList size={18} style={{ marginRight: 6 }} />
                        Liste
                      </ToggleButton>
                      <ToggleButton value="grid">
                        <IconGridDots size={18} style={{ marginRight: 6 }} />
                        Grid
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                    background: alpha(theme.palette.background.default, 0.4),
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", xl: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", xl: "center" }}
                  >
                    <TextField
                      value={search}
                      onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                      placeholder="Gayrimenkul, şehir, ilçe veya adres ara..."
                      fullWidth
                      size="medium"
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
                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.15)}`,
                          },
                          "&.Mui-focused": {
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                          },
                        },
                      }}
                    />

                    <TextField
                      select
                      label="Tür"
                      value={type}
                      onChange={(e) => handleFilterChange(setType, e.target.value as PropertyType)}
                      sx={{ minWidth: { xs: "100%", md: 160 } }}
                      InputProps={{
                        sx: {
                          borderRadius: 3,
                          bgcolor: "background.paper",
                        },
                      }}
                    >
                      {PROPERTY_TYPE_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="Durum"
                      value={status}
                      onChange={(e) =>
                        handleFilterChange(setStatus, e.target.value as PropertyStatus)
                      }
                      sx={{ minWidth: { xs: "100%", md: 190 } }}
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

                    <Tooltip title="Filtreleri temizle" arrow>
                      <Button
                        variant="outlined"
                        startIcon={<IconFilter size={18} />}
                        onClick={handleClearFilters}
                        sx={{
                          borderRadius: 3,
                          minWidth: 130,
                          height: { xs: 48, xl: 56 },
                          borderColor: alpha(theme.palette.divider, 0.8),
                          fontWeight: 700,
                          "&:hover": {
                            borderColor: theme.palette.primary.main,
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                      >
                        Temizle
                      </Button>
                    </Tooltip>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 4,
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.18)}`,
                    background: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1.5}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                  >
                    <Box>
                      <Typography fontWeight={900}>Aradığınız gayrimenkul listede yok mu?</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Önce yeni gayrimenkul kaydı oluşturun. Teknik bilgiler tamamlandıktan sonra
                        ilan sürecine geri dönebilirsiniz.
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      startIcon={<IconPlus size={18} />}
                      onClick={handleCreateProperty}
                      sx={{
                        borderRadius: 3,
                        fontWeight: 800,
                        textTransform: "none",
                        boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.28)}`,
                        flexShrink: 0,
                      }}
                    >
                      Yeni Gayrimenkul Tanımla
                    </Button>
                  </Stack>
                </Box>

                {isFiltered && (
                  <CollapseWithFade in={isFiltered}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                    >
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {type !== "all" && (
                          <FilterChip
                            label={`Tür: ${getPropertyTypeLabel(type)}`}
                            onDelete={() => setType("all")}
                          />
                        )}
                        {status !== "all" && (
                          <FilterChip
                            label={`Durum: ${getStatusLabel(status)}`}
                            onDelete={() => setStatus("all")}
                          />
                        )}
                        {search.trim() && (
                          <FilterChip
                            label={`Arama: ${search.trim()}`}
                            onDelete={() => setSearch("")}
                          />
                        )}
                      </Stack>

                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Filtrelenmiş sonuçlar gösteriliyor
                      </Typography>
                    </Stack>
                  </CollapseWithFade>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {isLoading ? (
          <LoadingSkeletons viewMode={viewMode} />
        ) : filteredUnits.length > 0 ? (
          <Stack
            spacing={1.5}
            direction={viewMode === "grid" ? { xs: "column", md: "row" } : "column"}
            flexWrap={viewMode === "grid" ? "wrap" : "nowrap"}
            useFlexGap={viewMode === "grid"}
          >
            {filteredUnits.map((unit, index) => (
              <Grow in timeout={300 + index * 100} key={unit.id}>
                <Box sx={viewMode === "grid" ? { flex: { xs: "1 1 100%", md: "1 1 calc(50% - 6px)" } } : {}}>
                  <PropertyListItem
                    unit={unit}
                    isSelected={selectedId === unit.id}
                    onCreateListing={() => handleCreateListing(unit.id)}
                  />
                </Box>
              </Grow>
            ))}
          </Stack>
        ) : (
          <Grow in timeout={400}>
            <Box>
              <PremiumEmptyState
                onClear={handleClearFilters}
                onCreateProperty={handleCreateProperty}
              />
            </Box>
          </Grow>
        )}
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------
// Sub Components
// ----------------------------------------------------------------
function CollapseWithFade({ in: inProp, children }: { in: boolean; children: React.ReactNode }) {
  return (
    <Fade in={inProp} timeout={400}>
      <Box>{children}</Box>
    </Fade>
  );
}

function HeroSection({
  totalCount,
  readyCount,
  listedCount,
  missingInfoCount,
  onCreateProperty,
}: {
  totalCount: number;
  readyCount: number;
  listedCount: number;
  missingInfoCount: number;
  onCreateProperty: () => void;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 5,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.08)} 0%, 
          ${alpha(theme.palette.primary.light, 0.06)} 30%, 
          ${alpha(theme.palette.info.main, 0.05)} 60%, 
          ${alpha(theme.palette.success.main, 0.04)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        "&::before": {
          content: '""',
          position: "absolute",
          top: -80,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(
            theme.palette.primary.main,
            0.15,
          )} 0%, transparent 70%)`,
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -60,
          left: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(
            theme.palette.success.main,
            0.12,
          )} 0%, transparent 70%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1.3fr 0.7fr" },
          gap: 2.5,
          alignItems: "stretch",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            p: 2.5,
            borderRadius: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.85),
            backdropFilter: "blur(16px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.04)}`,
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
                label="1. Adım"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 800, borderColor: alpha(theme.palette.divider, 0.8) }}
              />
            </Stack>

            <Box>
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
                İlan Verilecek
                <br />
                Gayrimenkulü Seçin
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Sisteme kayıtlı bağımsız bölümler arasından seçim yapın. Listede yoksa yeni kayıt
                tanımlayarak ilan sürecini başlatın.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              alignItems={{ xs: "flex-start", sm: "center" }}
              flexWrap="wrap"
              useFlexGap
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <IconCircleCheck size={16} style={{ color: theme.palette.success.main }} />
                <Typography variant="caption" color="success.dark" fontWeight={700}>
                  {readyCount} gayrimenkul ilan vermeye hazır
                </Typography>
              </Stack>

              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={onCreateProperty}
                sx={{
                  borderRadius: 3,
                  fontWeight: 800,
                  textTransform: "none",
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                Yeni Gayrimenkul Tanımla
              </Button>
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
          <HeroStatCard
            icon={<IconBuildingEstate size={20} stroke={2} />}
            label="Toplam"
            value={String(totalCount)}
            tone="default"
          />
          <HeroStatCard
            icon={<IconSparkles size={20} stroke={2} />}
            label="Hazır"
            value={String(readyCount)}
            tone="success"
          />
          <HeroStatCard
            icon={<IconChecklist size={20} stroke={2} />}
            label="İlanda"
            value={String(listedCount)}
            tone="info"
          />
          <HeroStatCard
            icon={<IconAlertTriangle size={20} stroke={2} />}
            label="Eksik"
            value={String(missingInfoCount)}
            tone="warning"
          />
        </Box>
      </Box>
    </Box>
  );
}

function HeroStatCard({
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
  const styles = getToneStyles(theme, tone);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3.5,
        border: `1px solid ${styles.border}`,
        bgcolor: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: "blur(12px)",
        transition: "transform 200ms ease, box-shadow 200ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 8px 24px ${alpha(styles.color, 0.12)}`,
        },
      }}
    >
      <Stack spacing={1}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 3,
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
          <Typography variant="h5" fontWeight={900} sx={{ color: styles.color, lineHeight: 1.1 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function PropertyListItem({
  unit,
  isSelected,
  onCreateListing,
}: {
  unit: PropertyUnit;
  isSelected: boolean;
  onCreateListing: () => void;
}) {
  const theme = useTheme<Theme>();
  const statusMeta = getStatusMeta(theme, unit.status);
  const isDisabled = unit.status === "missingInfo";
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      variant="outlined"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        borderRadius: 5,
        cursor: isDisabled ? "default" : "pointer",
        borderColor: isSelected
          ? theme.palette.primary.main
          : isHovered
            ? alpha(theme.palette.primary.main, 0.3)
            : alpha(theme.palette.divider, 0.6),
        borderWidth: isSelected ? 2 : 1,
        transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 12px 40px ${alpha(theme.palette.common.black, 0.08)}`
          : `0 2px 8px ${alpha(theme.palette.common.black, 0.02)}`,
        overflow: "hidden",
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: isHovered
            ? `linear-gradient(135deg, 
                ${alpha(theme.palette.primary.main, 0.03)} 0%, 
                transparent 50%, 
                ${alpha(theme.palette.primary.main, 0.03)} 100%)`
            : "none",
          transition: "opacity 250ms ease",
          pointerEvents: "none",
        },
      }}
      onClick={() => !isDisabled && onCreateListing()}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 }, position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.3fr 0.7fr" },
            gap: 2.5,
            alignItems: "center",
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: "primary.main",
                  flexShrink: 0,
                  transition: "transform 200ms ease, box-shadow 200ms ease",
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                  boxShadow: isHovered
                    ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.2)}`
                    : "none",
                }}
              >
                {getPropertyIcon(unit.type)}
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  fontWeight={900}
                  fontSize="1.05rem"
                  letterSpacing="-0.01em"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    color: isSelected ? "primary.main" : "text.primary",
                  }}
                >
                  {unit.name}
                </Typography>

                <Stack
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                  sx={{ mt: 0.75, color: "text.secondary" }}
                >
                  <IconMapPin size={16} stroke={2} />
                  <Typography variant="body2" fontWeight={500}>
                    {unit.city} / {unit.district}
                  </Typography>
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.25,
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {unit.address}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <MetaChip label={getPropertyTypeLabel(unit.type)} />
              <MetaChip label={`${unit.grossArea} m² brüt`} />
              <MetaChip label={`${unit.netArea} m² net`} />
              <MetaChip label={unit.roomCount} />
              <StatusChip status={unit.status} />
            </Stack>
          </Stack>

          <Box
            sx={{
              p: 2,
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              bgcolor: alpha(theme.palette.background.default, 0.5),
              backdropFilter: "blur(8px)",
            }}
          >
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  İlan durumu
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: statusMeta.color,
                      boxShadow: `0 0 8px ${alpha(statusMeta.color, 0.5)}`,
                    }}
                  />
                  <Typography fontWeight={900} sx={{ color: statusMeta.color }}>
                    {statusMeta.title}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {statusMeta.description}
                </Typography>
              </Box>

              <Button
                variant={isDisabled ? "outlined" : "contained"}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) onCreateListing();
                }}
                disabled={isDisabled}
                endIcon={<IconArrowRight size={18} stroke={2.5} />}
                sx={{
                  borderRadius: 3,
                  fontWeight: 800,
                  alignSelf: "flex-start",
                  textTransform: "none",
                  boxShadow: isDisabled
                    ? "none"
                    : `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                  "&:not(:disabled):hover": {
                    boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                {unit.status === "listed" ? "İlanı Düzenle" : "İlan Oluştur"}
              </Button>

              {isDisabled && (
                <Typography variant="caption" color="warning.dark" fontWeight={600}>
                  Eksik bilgileri tamamlayın
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function LoadingSkeletons({ viewMode }: { viewMode: ViewMode }) {
  const isGrid = viewMode === "grid";

  return (
    <Stack
      spacing={1.5}
      direction={isGrid ? { xs: "column", md: "row" } : "column"}
      flexWrap={isGrid ? "wrap" : "nowrap"}
      useFlexGap={isGrid}
    >
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={isGrid ? { flex: { xs: "1 1 100%", md: "1 1 calc(50% - 6px)" } } : {}}
        >
          <Card
            variant="outlined"
            sx={{ borderRadius: 5, borderColor: alpha("#000", 0.06), overflow: "hidden" }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={2}>
                <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: 3.5 }} />
                <Stack spacing={1.5} flex={1}>
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="text" width="40%" height={20} />
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="rounded" width={70} height={28} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: 2 }} />
                  </Stack>
                </Stack>
                <Skeleton variant="rounded" width={160} height={100} sx={{ borderRadius: 4 }} />
              </Stack>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Stack>
  );
}

function PremiumEmptyState({
  onClear,
  onCreateProperty,
}: {
  onClear: () => void;
  onCreateProperty: () => void;
}) {
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
              backdropFilter: "blur(12px)",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              animation: "pulse 2s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": {
                  boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.2)}`,
                },
                "50%": {
                  boxShadow: `0 0 0 16px ${alpha(theme.palette.primary.main, 0)}`,
                },
              },
            }}
          >
            <IconStack2 size={36} stroke={1.5} style={{ color: theme.palette.primary.main }} />
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={900} letterSpacing="-0.02em">
              Eşleşen gayrimenkul bulunamadı
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 520, mx: "auto" }}>
              Arama kriterlerinize uygun bir kayıt bulunamadı. Filtreleri temizleyebilir veya
              gayrimenkul henüz sistemde yoksa yeni kayıt oluşturarak devam edebilirsiniz.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center">
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
            <Button
              variant="outlined"
              startIcon={<IconPlus size={18} />}
              onClick={onCreateProperty}
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                textTransform: "none",
                borderColor: alpha(theme.palette.divider, 0.8),
              }}
            >
              Yeni Gayrimenkul Tanımla
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------
// Helper Components
// ----------------------------------------------------------------
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
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.1),
        },
        "& .MuiChip-deleteIcon": {
          color: alpha(theme.palette.text.primary, 0.5),
          "&:hover": {
            color: theme.palette.error.main,
          },
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
        backdropFilter: "blur(4px)",
        fontWeight: 600,
        fontSize: "0.75rem",
      }}
    />
  );
}

function StatusChip({ status }: { status: PropertyUnit["status"] }) {
  const theme = useTheme<Theme>();
  const meta = getStatusMeta(theme, status);

  return (
    <Chip
      label={meta.title}
      size="small"
      sx={{
        fontWeight: 800,
        fontSize: "0.75rem",
        color: meta.color,
        bgcolor: meta.bg,
        border: `1px solid ${meta.border}`,
        backdropFilter: "blur(4px)",
      }}
    />
  );
}

// ----------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------
function getToneStyles(theme: Theme, tone: Tone) {
  const map: Record<Tone, { bg: string; color: string; border: string }> = {
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

function getStatusMeta(theme: Theme, status: PropertyUnit["status"]) {
  const map = {
    ready: {
      title: "İlan verilebilir",
      description: "Teknik bilgiler yeterli. Hemen ilan oluşturabilirsiniz.",
      color: theme.palette.success.dark,
      bg: alpha(theme.palette.success.main, 0.1),
      border: alpha(theme.palette.success.main, 0.2),
    },
    listed: {
      title: "İlanda",
      description: "Bu birim için aktif bir ilan kaydı bulunuyor.",
      color: theme.palette.info.dark,
      bg: alpha(theme.palette.info.main, 0.1),
      border: alpha(theme.palette.info.main, 0.2),
    },
    missingInfo: {
      title: "Eksik bilgi var",
      description: "İlan oluşturmak için önce teknik bilgiler tamamlanmalı.",
      color: theme.palette.warning.dark,
      bg: alpha(theme.palette.warning.main, 0.12),
      border: alpha(theme.palette.warning.main, 0.22),
    },
  };
  return map[status];
}

function getPropertyIcon(type: PropertyUnit["type"]) {
  const iconProps = { size: 26, stroke: 2 };
  if (type === "shop") return <IconBuildingStore {...iconProps} />;
  if (type === "office") return <IconBuilding {...iconProps} />;
  return <IconHome {...iconProps} />;
}

function getPropertyTypeLabel(type: PropertyType): string {
  const map: Record<PropertyType, string> = {
    all: "Tümü",
    apartment: "Daire",
    shop: "Dükkan",
    office: "Ofis",
  };
  return map[type];
}

function getStatusLabel(status: PropertyStatus): string {
  const map: Record<PropertyStatus, string> = {
    all: "Tümü",
    ready: "İlan verilebilir",
    missingInfo: "Eksik bilgi var",
    listed: "İlanda",
  };
  return map[status];
}