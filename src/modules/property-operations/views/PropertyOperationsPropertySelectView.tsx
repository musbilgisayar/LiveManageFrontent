// src/modules/property-operations/views/PropertyOperationsPropertySelectView.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuildingCommunity,
  IconChecklist,
  IconCoin,
  IconFilter,
  IconGridDots,
  IconHomeStats,
  IconLayoutList,
  IconSearch,
  IconShieldCheck,
  IconTool,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

type RiskLevel = "all" | "low" | "medium" | "high" | "critical";
type SortKey = "risk" | "collectionRate" | "openRequestCount" | "overdueAmount";
type ViewMode = "grid" | "list" | "carousel";

type ManagedProperty = {
  id: string;
  name: string;
  type: string;
  role: string;
  totalUnits: number;
  occupiedUnits: number;
  tenantCount: number;
  collectionRate: number;
  overdueAmount: number;
  openRequestCount: number;
  riskLevel: Exclude<RiskLevel, "all">;
};

const managedProperties: ManagedProperty[] = [
  {
    id: "1",
    name: "Green Park Sitesi",
    type: "Site Yönetimi",
    role: "Tam Yetkili Yönetici",
    totalUnits: 48,
    occupiedUnits: 42,
    tenantCount: 31,
    collectionRate: 82,
    overdueAmount: 6920,
    openRequestCount: 4,
    riskLevel: "high",
  },
  {
    id: "2",
    name: "Mavi Bahçe Konakları",
    type: "Apartman Yönetimi",
    role: "Muhasebe Yetkilisi",
    totalUnits: 24,
    occupiedUnits: 23,
    tenantCount: 18,
    collectionRate: 96,
    overdueAmount: 0,
    openRequestCount: 2,
    riskLevel: "low",
  },
  {
    id: "3",
    name: "Koru Evleri 3. Etap",
    type: "Çok Bloklu Site",
    role: "Operasyon Sorumlusu",
    totalUnits: 126,
    occupiedUnits: 118,
    tenantCount: 87,
    collectionRate: 74,
    overdueAmount: 18450,
    openRequestCount: 9,
    riskLevel: "critical",
  },
  {
    id: "4",
    name: "Panorama Yaşam Evleri",
    type: "Site Yönetimi",
    role: "Saha Koordinatörü",
    totalUnits: 64,
    occupiedUnits: 58,
    tenantCount: 44,
    collectionRate: 88,
    overdueAmount: 3150,
    openRequestCount: 6,
    riskLevel: "medium",
  },
  {
    id: "5",
    name: "Nova İş Merkezi",
    type: "Ticari Yönetim",
    role: "Operasyon Yetkilisi",
    totalUnits: 32,
    occupiedUnits: 29,
    tenantCount: 21,
    collectionRate: 91,
    overdueAmount: 2200,
    openRequestCount: 1,
    riskLevel: "low",
  },
];

export default function PropertyOperationsPropertySelectView() {
  const theme = useTheme<Theme>();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel>("all");
  const [sortKey, setSortKey] = useState<SortKey>("risk");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const totals = useMemo(() => {
    const totalProperties = managedProperties.length;
    const criticalCount = managedProperties.filter(
      (item) => item.riskLevel === "critical" || item.riskLevel === "high",
    ).length;
    const totalOpenRequests = managedProperties.reduce(
      (sum, item) => sum + item.openRequestCount,
      0,
    );
    const totalOverdue = managedProperties.reduce(
      (sum, item) => sum + item.overdueAmount,
      0,
    );
    const avgCollectionRate =
      totalProperties > 0
        ? Math.round(
            managedProperties.reduce((sum, item) => sum + item.collectionRate, 0) /
              totalProperties,
          )
        : 0;

    return {
      totalProperties,
      criticalCount,
      totalOpenRequests,
      totalOverdue,
      avgCollectionRate,
    };
  }, []);

  const filteredProperties = useMemo(() => {
    const q = search.trim().toLowerCase();

    const result = managedProperties.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q);

      const matchesRisk = riskFilter === "all" || item.riskLevel === riskFilter;

      return matchesSearch && matchesRisk;
    });

    result.sort((a, b) => {
      if (sortKey === "collectionRate") return b.collectionRate - a.collectionRate;
      if (sortKey === "openRequestCount") return b.openRequestCount - a.openRequestCount;
      if (sortKey === "overdueAmount") return b.overdueAmount - a.overdueAmount;
      return getRiskOrder(b.riskLevel) - getRiskOrder(a.riskLevel);
    });

    return result;
  }, [riskFilter, search, sortKey]);

  const isFiltered = search.trim() !== "" || riskFilter !== "all";

  const handleClearFilters = () => {
    setSearch("");
    setRiskFilter("all");
    setSortKey("risk");
  };

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          p: { xs: 2.25, md: 3 },
          borderRadius: 5,
          position: "relative",
          overflow: "hidden",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.07)} 0%, 
            ${alpha(theme.palette.info.main, 0.045)} 50%, 
            ${alpha(theme.palette.success.main, 0.035)} 100%)`,
          "&::before": {
            content: '""',
            position: "absolute",
            top: -70,
            right: -70,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(
              theme.palette.primary.main,
              0.13,
            )} 0%, transparent 70%)`,
            pointerEvents: "none",
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Stack spacing={2.25}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label="Operasyon Yönetimi"
                size="small"
                sx={{
                  fontWeight: 850,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                }}
              />
              <Chip
                label={`${totals.totalProperties} aktif portföy`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 800 }}
              />
            </Stack>

            <Box>
              <Typography variant="h4" fontWeight={950} lineHeight={1.08} letterSpacing="-0.03em">
                Sorumlu Olduğum Site ve Apartmanlar
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 0.9, maxWidth: 820 }}>
                Yönetim, muhasebe, bakım, tahsilat ve daire ilişkileri için işlem yapmak
                istediğiniz gayrimenkul operasyon alanını seçin.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              <HeroStatCard
                icon={<IconBuildingCommunity size={20} />}
                label="Portföy"
                value={`${totals.totalProperties}`}
                tone="default"
              />
              <HeroStatCard
                icon={<IconAlertTriangle size={20} />}
                label="Kritik / Yüksek Risk"
                value={`${totals.criticalCount}`}
                tone="error"
              />
              <HeroStatCard
                icon={<IconChecklist size={20} />}
                label="Açık İş"
                value={`${totals.totalOpenRequests}`}
                tone="warning"
              />
              <HeroStatCard
                icon={<IconTrendingUp size={20} />}
                label="Ortalama Tahsilat"
                value={`%${totals.avgCollectionRate}`}
                tone="success"
              />
            </Box>
          </Stack>
        </Box>
      </Box>

      <Card
        variant="outlined"
        sx={{
          borderRadius: 5,
          borderColor: alpha(theme.palette.divider, 0.6),
          background: alpha(theme.palette.background.paper, 0.78),
          backdropFilter: "blur(14px)",
          boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.03)}`,
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", xl: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", xl: "center" }}
            >
              <TextField
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Site adı, yönetim tipi veya rol ara"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 3,
                    bgcolor: "background.paper",
                  },
                }}
              />

              <TextField
                select
                label="Risk Seviyesi"
                value={riskFilter}
                onChange={(event) => setRiskFilter(event.target.value as RiskLevel)}
                sx={{ minWidth: { xs: "100%", md: 180 } }}
                InputProps={{
                  sx: {
                    borderRadius: 3,
                    bgcolor: "background.paper",
                  },
                }}
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="critical">Kritik</MenuItem>
                <MenuItem value="high">Yüksek</MenuItem>
                <MenuItem value="medium">Orta</MenuItem>
                <MenuItem value="low">Düşük</MenuItem>
              </TextField>

              <TextField
                select
                label="Sıralama"
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                sx={{ minWidth: { xs: "100%", md: 200 } }}
                InputProps={{
                  sx: {
                    borderRadius: 3,
                    bgcolor: "background.paper",
                  },
                }}
              >
                <MenuItem value="risk">Riske göre</MenuItem>
                <MenuItem value="collectionRate">Tahsilata göre</MenuItem>
                <MenuItem value="openRequestCount">Açık işe göre</MenuItem>
                <MenuItem value="overdueAmount">Borç tutarına göre</MenuItem>
              </TextField>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, value: ViewMode | null) => value && setViewMode(value)}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderRadius: 3,
                  p: 0.5,
                  "& .MuiToggleButton-root": {
                    border: "none",
                    borderRadius: 2.5,
                    px: 1.75,
                    py: 0.9,
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
                  <IconBuildingCommunity size={17} style={{ marginRight: 6 }} />
                  Kart
                </ToggleButton>
                <ToggleButton value="list">
                  <IconLayoutList size={17} style={{ marginRight: 6 }} />
                  Liste
                </ToggleButton>
                <ToggleButton value="carousel">
                  <IconGridDots size={17} style={{ marginRight: 6 }} />
                  Karusel
                </ToggleButton>
              </ToggleButtonGroup>

              <Button
                variant="outlined"
                startIcon={<IconFilter size={18} />}
                onClick={handleClearFilters}
                sx={{
                  borderRadius: 3,
                  minWidth: 130,
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                Temizle
              </Button>
            </Stack>

            {isFiltered && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {riskFilter !== "all" && (
                  <Chip
                    label={`Risk: ${riskLabel(riskFilter)}`}
                    onDelete={() => setRiskFilter("all")}
                    size="small"
                  />
                )}
                {search.trim() && (
                  <Chip
                    label={`Arama: ${search.trim()}`}
                    onDelete={() => setSearch("")}
                    size="small"
                  />
                )}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      {filteredProperties.length > 0 && viewMode === "grid" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "1fr 1fr",
              xl: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
            alignItems: "stretch",
          }}
        >
          {filteredProperties.map((item) => (
            <PropertyCard
              key={item.id}
              item={item}
              onOpen={() => router.push(`/operation-management/properties/${item.id}`)}
            />
          ))}
        </Box>
      )}

      {filteredProperties.length > 0 && viewMode === "list" && (
        <Stack spacing={2}>
          {filteredProperties.map((item) => (
            <PropertyListItem
              key={item.id}
              item={item}
              onOpen={() => router.push(`/operation-management/properties/${item.id}`)}
            />
          ))}
        </Stack>
      )}

      {filteredProperties.length > 0 && viewMode === "carousel" && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 1,
            scrollSnapType: "x mandatory",
            "&::-webkit-scrollbar": {
              height: 10,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: alpha(theme.palette.text.primary, 0.16),
              borderRadius: 999,
            },
          }}
        >
          {filteredProperties.map((item) => (
            <Box
              key={item.id}
              sx={{
                flex: "0 0 auto",
                width: {
                  xs: 320,
                  md: 380,
                  xl: 420,
                },
                scrollSnapAlign: "start",
              }}
            >
              <CarouselPropertyCard
                item={item}
                onOpen={() => router.push(`/operation-management/properties/${item.id}`)}
              />
            </Box>
          ))}
        </Box>
      )}

      {filteredProperties.length === 0 && (
        <Card
          variant="outlined"
          sx={{
            borderRadius: 5,
            borderStyle: "dashed",
            borderColor: alpha(theme.palette.divider, 0.8),
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={1} alignItems="center" textAlign="center">
              <Typography variant="h6" fontWeight={900}>
                Sonuç bulunamadı
              </Typography>
              <Typography color="text.secondary">
                Arama veya filtre kriterlerini değiştirerek tekrar deneyin.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

function PropertyCard({
  item,
  onOpen,
}: {
  item: ManagedProperty;
  onOpen: () => void;
}) {
  const theme = useTheme<Theme>();
  const riskColor = getRiskColor(theme, item.riskLevel);
  const occupancyRate =
    item.totalUnits > 0 ? Math.round((item.occupiedUnits / item.totalUnits) * 100) : 0;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4.5,
        borderColor: alpha(riskColor, 0.18),
        bgcolor: alpha(theme.palette.background.paper, 0.84),
        transition:
          "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: theme.shadows[7],
          borderColor: alpha(riskColor, 0.35),
        },
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2.4 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              <IconBuildingCommunity size={23} />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h6" fontWeight={950} lineHeight={1.08}>
                {item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                {item.type}
              </Typography>
            </Box>

            <Chip
              label={riskLabel(item.riskLevel)}
              size="small"
              sx={{
                fontWeight: 850,
                bgcolor: alpha(riskColor, 0.1),
                color: riskColor,
                border: `1px solid ${alpha(riskColor, 0.2)}`,
              }}
            />
          </Stack>

          <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
            <Chip
              label={item.role}
              size="small"
              sx={{
                width: "fit-content",
                fontWeight: 800,
                bgcolor: alpha(theme.palette.text.primary, 0.045),
                color: "text.secondary",
              }}
            />

            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Doluluk %{occupancyRate}
            </Typography>
          </Stack>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 3.5,
              border: `1px solid ${alpha(riskColor, 0.12)}`,
              bgcolor: alpha(riskColor, 0.03),
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                <Typography variant="caption" color="text.secondary">
                  Tahsilat oranı
                </Typography>
                <Typography variant="caption" fontWeight={900}>
                  %{item.collectionRate}
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={item.collectionRate}
                sx={{
                  height: 8,
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                  },
                }}
              />

              <Typography variant="body2" color="text.secondary">
                {getOperationalSummary(item)}
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
            }}
          >
            <MiniStat
              icon={<IconHomeStats size={17} />}
              label="Daire"
              value={`${item.occupiedUnits}/${item.totalUnits}`}
            />

            <MiniStat
              icon={<IconUsers size={17} />}
              label="Kiracı"
              value={`${item.tenantCount}`}
            />

            <MiniStat
              icon={<IconCoin size={17} />}
              label="Geciken"
              value={formatMoney(item.overdueAmount)}
              tone={item.overdueAmount > 0 ? "error" : "success"}
            />

            <MiniStat
              icon={<IconTool size={17} />}
              label="Açık Talep"
              value={`${item.openRequestCount}`}
              tone={item.openRequestCount > 0 ? "warning" : "success"}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            endIcon={<IconArrowRight size={18} />}
            onClick={onOpen}
            sx={{
              borderRadius: 3,
              py: 1.05,
              fontWeight: 850,
              textTransform: "none",
            }}
          >
            Operasyon Paneline Git
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PropertyListItem({
  item,
  onOpen,
}: {
  item: ManagedProperty;
  onOpen: () => void;
}) {
  const theme = useTheme<Theme>();
  const riskColor = getRiskColor(theme, item.riskLevel);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4.5,
        borderColor: alpha(riskColor, 0.18),
        transition: "transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", lg: "center" }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              <IconBuildingCommunity size={22} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                <Typography variant="h6" fontWeight={950}>
                  {item.name}
                </Typography>
                <Chip
                  label={riskLabel(item.riskLevel)}
                  size="small"
                  sx={{
                    fontWeight: 850,
                    bgcolor: alpha(riskColor, 0.1),
                    color: riskColor,
                    border: `1px solid ${alpha(riskColor, 0.2)}`,
                  }}
                />
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                {item.type} • {item.role}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.2 }}>
                <MiniInlineStat label="Daire" value={`${item.occupiedUnits}/${item.totalUnits}`} />
                <MiniInlineStat label="Kiracı" value={`${item.tenantCount}`} />
                <MiniInlineStat label="Tahsilat" value={`%${item.collectionRate}`} />
                <MiniInlineStat label="Geciken" value={formatMoney(item.overdueAmount)} />
                <MiniInlineStat label="Açık Talep" value={`${item.openRequestCount}`} />
              </Stack>
            </Box>
          </Stack>

          <Stack spacing={1.2} sx={{ minWidth: { xs: "100%", lg: 240 } }}>
            <Typography variant="body2" color="text.secondary">
              {getOperationalSummary(item)}
            </Typography>

            <Button
              variant="contained"
              endIcon={<IconArrowRight size={18} />}
              onClick={onOpen}
              sx={{
                borderRadius: 3,
                fontWeight: 850,
                textTransform: "none",
              }}
            >
              Operasyon Paneline Git
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CarouselPropertyCard({
  item,
  onOpen,
}: {
  item: ManagedProperty;
  onOpen: () => void;
}) {
  const theme = useTheme<Theme>();
  const riskColor = getRiskColor(theme, item.riskLevel);
  const occupancyRate =
    item.totalUnits > 0 ? Math.round((item.occupiedUnits / item.totalUnits) * 100) : 0;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 5,
        borderColor: alpha(riskColor, 0.18),
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box>
              <Typography variant="h6" fontWeight={950} lineHeight={1.08}>
                {item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                {item.type}
              </Typography>
            </Box>

            <Chip
              label={riskLabel(item.riskLevel)}
              size="small"
              sx={{
                fontWeight: 850,
                bgcolor: alpha(riskColor, 0.1),
                color: riskColor,
                border: `1px solid ${alpha(riskColor, 0.2)}`,
              }}
            />
          </Stack>

          <Chip
            label={item.role}
            size="small"
            sx={{
              width: "fit-content",
              fontWeight: 800,
              bgcolor: alpha(theme.palette.text.primary, 0.045),
              color: "text.secondary",
            }}
          />

          <Box
            sx={{
              p: 1.4,
              borderRadius: 3.5,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Tahsilat
                </Typography>
                <Typography variant="caption" fontWeight={900}>
                  %{item.collectionRate}
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={item.collectionRate}
                sx={{
                  height: 8,
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                  },
                }}
              />

              <Typography variant="caption" color="text.secondary">
                Doluluk %{occupancyRate}
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
            }}
          >
            <MiniStat
              icon={<IconHomeStats size={17} />}
              label="Daire"
              value={`${item.occupiedUnits}/${item.totalUnits}`}
            />
            <MiniStat
              icon={<IconUsers size={17} />}
              label="Kiracı"
              value={`${item.tenantCount}`}
            />
            <MiniStat
              icon={<IconCoin size={17} />}
              label="Geciken"
              value={formatMoney(item.overdueAmount)}
              tone={item.overdueAmount > 0 ? "error" : "success"}
            />
            <MiniStat
              icon={<IconTool size={17} />}
              label="Açık Talep"
              value={`${item.openRequestCount}`}
              tone={item.openRequestCount > 0 ? "warning" : "success"}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            endIcon={<IconArrowRight size={18} />}
            onClick={onOpen}
            sx={{
              borderRadius: 3,
              py: 1.05,
              fontWeight: 850,
              textTransform: "none",
            }}
          >
            Operasyon Paneline Git
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function HeroStatCard({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "error";
}) {
  const theme = useTheme<Theme>();
  const color = getToneColor(theme, tone);

  return (
    <Box
      sx={{
        p: 1.6,
        borderRadius: 3.5,
        border: `1px solid ${alpha(color, 0.14)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.72),
        backdropFilter: "blur(8px)",
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
            bgcolor: alpha(color, 0.1),
            color,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            {label}
          </Typography>
          <Typography variant="h6" fontWeight={950} lineHeight={1.1}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "error";
}) {
  const theme = useTheme<Theme>();
  const color = getToneColor(theme, tone);

  return (
    <Box
      sx={{
        p: 1.2,
        borderRadius: 3,
        border: `1px solid ${alpha(color, 0.13)}`,
        bgcolor: alpha(color, 0.035),
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Box sx={{ display: "inline-flex", color }}>{icon}</Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Stack>

      <Typography fontWeight={900} sx={{ mt: 0.35 }}>
        {value}
      </Typography>
    </Box>
  );
}

function MiniInlineStat({ label, value }: { label: string; value: string }) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        px: 1,
        py: 0.75,
        borderRadius: 2.5,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.7),
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={800} lineHeight={1.15}>
        {value}
      </Typography>
    </Box>
  );
}

function getOperationalSummary(item: ManagedProperty) {
  if (item.riskLevel === "critical") {
    return "Kritik operasyon takibi gerekiyor. Tahsilat, bakım ve borç tarafı öncelikli.";
  }

  if (item.riskLevel === "high") {
    return "Yüksek dikkat gerektiriyor. Finansal ve operasyonel başlıklar izlenmeli.";
  }

  if (item.riskLevel === "medium") {
    return "Kontrollü ilerliyor. Açık işler ve tahsilat takibi sürdürülmeli.";
  }

  return "Operasyon dengeli ilerliyor. Kritik aksiyon ihtiyacı düşük seviyede.";
}

function getToneColor(
  theme: Theme,
  tone: "default" | "success" | "warning" | "error",
) {
  if (tone === "success") return theme.palette.success.main;
  if (tone === "warning") return theme.palette.warning.main;
  if (tone === "error") return theme.palette.error.main;
  return theme.palette.primary.main;
}

function getRiskColor(theme: Theme, risk: Exclude<RiskLevel, "all">) {
  if (risk === "critical") return theme.palette.error.dark;
  if (risk === "high") return theme.palette.error.main;
  if (risk === "medium") return theme.palette.warning.main;
  return theme.palette.success.main;
}

function getRiskOrder(risk: Exclude<RiskLevel, "all">) {
  if (risk === "critical") return 4;
  if (risk === "high") return 3;
  if (risk === "medium") return 2;
  return 1;
}

function riskLabel(risk: RiskLevel) {
  if (risk === "critical") return "Kritik";
  if (risk === "high") return "Yüksek";
  if (risk === "medium") return "Orta";
  if (risk === "low") return "Düşük";
  return "Tümü";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  }).format(value);
}