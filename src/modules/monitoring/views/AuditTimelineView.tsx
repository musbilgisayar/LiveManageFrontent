// File: src/app/[locale]/(DashboardLayout)/(panel)/superadmin/monitoring/audit-timeline/AuditTimelineView.tsx

"use client";

import React, { useMemo, useState } from "react";
import {
  alpha,
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconAlertTriangle,
  IconClock,
  IconFilter,
  IconLock,
  IconLockOpen,
  IconNotes,
  IconSearch,
  IconShield,
  IconUser,
  IconWorld,
} from "@tabler/icons-react";

import { useAuditTimeline } from "@/modules/monitoring/hooks/useAuditTimeline";
import type { AuditTimelineItem } from "@/modules/monitoring/types/AuditTimeline.types";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatRelativeTime(value: string): string {
  const diffMs = new Date(value).getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" });

  const minutes = Math.round(diffMs / (1000 * 60));
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");

  return rtf.format(days, "day");
}

function getTypeLabel(type?: string | null): string {
  switch ((type ?? "").toLowerCase()) {
    case "lock":
      return "Lock";
    case "unlock":
      return "Unlock";
    case "extend":
      return "Extend";
    case "review":
      return "Review";
    case "login":
      return "Login";
    case "security":
      return "Security";
    case "audit":
      return "Audit";
    case "sensitive":
      return "Sensitive";
    default:
      return type || "Unknown";
  }
}

function getRiskLabel(risk?: string | null): string {
  switch ((risk ?? "").toLowerCase()) {
    case "low":
      return "Düşük";
    case "medium":
      return "Orta";
    case "high":
      return "Yüksek";
    case "critical":
      return "Kritik";
    default:
      return "Bilinmiyor";
  }
}

function getTargetTypeLabel(type?: string | null): string {
  switch ((type ?? "").toLowerCase()) {
    case "user":
      return "Kullanıcı";
    case "ip":
      return "IP";
    case "entity":
      return "Entity";
    case "system":
      return "Sistem";
    default:
      return type || "Bilinmiyor";
  }
}

function getTypeChipColor(type?: string | null): "error" | "success" | "warning" | "info" | "default" {
  switch ((type ?? "").toLowerCase()) {
    case "lock":
      return "error";
    case "unlock":
      return "success";
    case "extend":
      return "warning";
    case "review":
    case "audit":
    case "security":
    case "login":
      return "info";
    default:
      return "default";
  }
}

function getRiskChipColor(risk?: string | null): "default" | "success" | "warning" | "error" {
  switch ((risk ?? "").toLowerCase()) {
    case "low":
      return "success";
    case "medium":
      return "warning";
    case "high":
    case "critical":
      return "error";
    default:
      return "default";
  }
}

function getTypeIcon(type?: string | null) {
  switch ((type ?? "").toLowerCase()) {
    case "lock":
      return IconLock;
    case "unlock":
      return IconLockOpen;
    case "extend":
      return IconClock;
    case "review":
      return IconNotes;
    default:
      return IconShield;
  }
}

type AuditTimelineItemProps = {
  item: AuditTimelineItem;
  isLast: boolean;
};

function AuditTimelineItemCard({ item, isLast }: AuditTimelineItemProps) {
  const theme = useTheme();
  const TypeIcon = getTypeIcon(item.type);
  const TargetIcon = item.targetType === "user" ? IconUser : IconWorld;

  return (
    <Box position="relative" pl={{ xs: 0, md: 4 }}>
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "absolute",
          left: 14,
          top: 0,
          bottom: isLast ? "50%" : -20,
          width: 2,
          bgcolor: alpha(theme.palette.divider, 0.9),
        }}
      />

      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          position: "absolute",
          left: 0,
          top: 28,
          width: 30,
          height: 30,
          borderRadius: "50%",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          border: `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      >
        <TypeIcon size={16} />
      </Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
          boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.05)}`,
          transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `0 16px 40px ${alpha(theme.palette.common.black, 0.08)}`,
            borderColor: alpha(theme.palette.primary.main, 0.2),
          },
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={1.25}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  useFlexGap
                >
                  <Typography variant="h6" fontWeight={800}>
                    {item.title}
                  </Typography>

                  <Chip
                    size="small"
                    label={getTypeLabel(item.type)}
                    color={getTypeChipColor(item.type)}
                    variant="filled"
                  />

                  {item.riskLevel && (
                    <Chip
                      size="small"
                      label={getRiskLabel(item.riskLevel)}
                      color={getRiskChipColor(item.riskLevel)}
                      variant="outlined"
                    />
                  )}
                </Stack>

                <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                  {item.description || "Açıklama bulunmuyor."}
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap>
                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<TargetIcon size={14} />}
                    label={`${getTargetTypeLabel(item.targetType)} • ${item.targetValueMasked}`}
                  />

                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<IconClock size={14} />}
                    label={formatDate(item.at)}
                  />
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  px: 2,
                  py: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Olay zamanı
                  </Typography>
                  <Typography fontWeight={700}>{formatRelativeTime(item.at)}</Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="caption" color="text.secondary">
                    Hedef
                  </Typography>
                  <Typography fontWeight={700}>{item.targetValueMasked}</Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Risk düzeyi
                  </Typography>
                  <Typography fontWeight={700}>
                    {item.riskLevel ? getRiskLabel(item.riskLevel) : "Tanımsız"}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function AuditTimelineView() {
  const theme = useTheme();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const {
    summary,
    items,
    filterOptions,
    totalCount,
    loading,
    error,
    updateQuery,
    resetQuery,
  } = useAuditTimeline({
    page: 1,
    pageSize: 20,
  });

  const stats = useMemo(
    () => [
      {
        key: "total",
        label: "Toplam Olay",
        value: summary?.totalEvents ?? totalCount ?? 0,
        hint: "Audit akışındaki toplam kayıt",
        icon: IconShield,
      },
      {
        key: "critical",
        label: "Kritik Risk",
        value: summary?.criticalEvents ?? 0,
        hint: "Öncelikli inceleme gerektiren kayıtlar",
        icon: IconAlertTriangle,
      },
      {
        key: "security",
        label: "Güvenlik Olayı",
        value: summary?.securityEvents ?? 0,
        hint: "Güvenlik kaynaklı audit kayıtları",
        icon: IconLock,
      },
      {
        key: "failed",
        label: "Başarısız Olay",
        value: summary?.failedEvents ?? 0,
        hint: "Başarısız veya riskli işlem kayıtları",
        icon: IconLockOpen,
      },
    ],
    [summary, totalCount]
  );

  function applyFilters() {
    updateQuery({
      search: search.trim() || undefined,
      eventType: typeFilter !== "all" ? typeFilter : undefined,
      targetType: targetFilter !== "all" ? targetFilter : undefined,
      riskLevel: riskFilter !== "all" ? riskFilter : undefined,
      page: 1,
    });
  }

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setTargetFilter("all");
    setRiskFilter("all");
    resetQuery();
  }

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Box
        sx={{
          mb: 3,
          p: { xs: 2.5, md: 3 },
          borderRadius: 5,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.1
          )} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <Stack spacing={1.25}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" fontWeight={900}>
                Audit Timeline
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={1}>
                Güvenlik, lockout ve manuel inceleme olaylarının kronolojik görünümü.
              </Typography>
            </Box>

            <Chip
              color="primary"
              variant="outlined"
              icon={loading ? <CircularProgress size={14} /> : <IconShield size={16} />}
              label={`${items.length} kayıt görüntüleniyor`}
            />
          </Stack>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} mb={3}>
        {stats.map((stat) => {
          const StatIcon = stat.icon;

          return (
            <Grid key={stat.key} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                  boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.04)}`,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" fontWeight={900} mt={1}>
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                        {stat.hint}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                      }}
                    >
                      <StatIcon size={20} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
          boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.04)}`,
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <IconFilter size={18} />
                <Typography fontWeight={800}>Filtreler</Typography>
              </Stack>

              <IconButton size="small" onClick={clearFilters}>
                <IconFilter size={18} />
              </IconButton>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Kullanıcı, IP, açıklama veya işlem ara..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") applyFilters();
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={16} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.333 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="İşlem"
                  value={typeFilter}
                  onChange={(event) => {
                    setTypeFilter(event.target.value);
                    updateQuery({
                      eventType: event.target.value !== "all" ? event.target.value : undefined,
                      page: 1,
                    });
                  }}
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  {(filterOptions?.eventTypes ?? ["lock", "unlock", "extend", "review"]).map(
                    (type) => (
                      <MenuItem key={type} value={type}>
                        {getTypeLabel(type)}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.333 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Hedef"
                  value={targetFilter}
                  onChange={(event) => {
                    setTargetFilter(event.target.value);
                    updateQuery({
                      targetType: event.target.value !== "all" ? event.target.value : undefined,
                      page: 1,
                    });
                  }}
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  {(filterOptions?.targetTypes ?? ["user", "ip", "entity", "system"]).map(
                    (type) => (
                      <MenuItem key={type} value={type}>
                        {getTargetTypeLabel(type)}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.333 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Risk"
                  value={riskFilter}
                  onChange={(event) => {
                    setRiskFilter(event.target.value);
                    updateQuery({
                      riskLevel: event.target.value !== "all" ? event.target.value : undefined,
                      page: 1,
                    });
                  }}
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  {(filterOptions?.riskLevels ?? ["low", "medium", "high", "critical"]).map(
                    (risk) => (
                      <MenuItem key={risk} value={risk}>
                        {getRiskLabel(risk)}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {loading && items.length === 0 ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      ) : (
        <Stack spacing={2.25}>
          {items.map((item, index) => (
            <AuditTimelineItemCard
              key={item.id}
              item={item}
              isLast={index === items.length - 1}
            />
          ))}

          {items.length === 0 && (
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: `1px dashed ${alpha(theme.palette.divider, 1)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
              }}
            >
              <CardContent sx={{ py: 6 }}>
                <Stack spacing={1.5} alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    }}
                  >
                    <IconSearch size={24} />
                  </Box>

                  <Typography variant="h6" fontWeight={800}>
                    Sonuç bulunamadı
                  </Typography>

                  <Typography variant="body2" color="text.secondary" maxWidth={480}>
                    Seçtiğiniz filtreler ile eşleşen audit kaydı bulunmuyor. Filtreleri
                    temizleyerek tekrar deneyin.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}
    </Box>
  );
}