// src/modules/monitoring/views/SecurityTimelineView.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconCopy,
  IconDeviceDesktop,
  IconFingerprint,
  IconLock,
  IconLogin,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconSparkles,
  IconWorld,
} from "@tabler/icons-react";

import BlankCard from "@/app/components/shared/BlankCard";
import { useI18nNs } from "@/app/context/i18nContext";
import { useSecurityTimeline } from "../hooks/useSecurityTimeline";
import type {
  SecurityEventType,
  SecurityRiskLevel,
  SecurityTimelineFilter,
} from "../types/SecurityTimeline.types";

const RISK_OPTIONS: SecurityRiskLevel[] = ["low", "medium", "high", "critical"];

const EVENT_OPTIONS: SecurityEventType[] = [
  "login_failed",
  "login_success",
  "user_locked",
  "ip_locked",
  "lockout_decision",
  "password_changed",
  "suspicious_activity",
];

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function getRiskTone(level?: SecurityRiskLevel | null): "success" | "info" | "warning" | "error" {
  switch (level) {
    case "critical":
      return "error";
    case "high":
      return "warning";
    case "medium":
      return "info";
    case "low":
    default:
      return "success";
  }
}

function getEventIcon(eventType?: string | null, size = 20) {
  switch (eventType) {
    case "login_success":
      return <IconLogin size={size} />;
    case "login_failed":
      return <IconAlertTriangle size={size} />;
    case "user_locked":
    case "ip_locked":
    case "lockout_decision":
      return <IconLock size={size} />;
    case "password_changed":
      return <IconShieldCheck size={size} />;
    default:
      return <IconFingerprint size={size} />;
  }
}

type DetailRowProps = {
  label: string;
  value?: React.ReactNode;
};

function DetailRow({ label, value }: DetailRowProps) {
  if (!value) return null;

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1.25,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "action.hover",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mb: 0.5,
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>

     <Typography
  component="div"
  variant="body2"
  fontWeight={600}
  sx={{ wordBreak: "break-word" }}
>
  {value}
</Typography>
    </Box>
  );
}

type MetricCardProps = {
  label: string;
  value: number;
  color: string;
  subtitle?: string;
};

function MetricCard({ label, value, color, subtitle }: MetricCardProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
        <Box minWidth={0}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 0.4,
              fontWeight: 800,
              mb: 0.75,
            }}
          >
            {label}
          </Typography>

          <Typography variant="h5" fontWeight={900} lineHeight={1}>
            {value}
          </Typography>

          {subtitle ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: color,
            boxShadow: `0 0 0 8px ${alpha(color, 0.12)}`,
            flexShrink: 0,
            mt: 0.75,
          }}
        />
      </Stack>
    </Box>
  );
}

type LoadingBlockProps = {
  height: number;
  radius?: number;
};

function LoadingBlock({ height, radius = 16 }: LoadingBlockProps) {
  return (
    <Box
      sx={(theme) => ({
        height,
        borderRadius: radius / 8,
        background: theme.palette.mode === "dark"
          ? `linear-gradient(90deg,
              ${alpha(theme.palette.common.white, 0.05)} 0%,
              ${alpha(theme.palette.common.white, 0.1)} 18%,
              ${alpha(theme.palette.common.white, 0.05)} 36%)`
          : `linear-gradient(90deg,
              ${alpha(theme.palette.common.black, 0.04)} 0%,
              ${alpha(theme.palette.common.black, 0.08)} 18%,
              ${alpha(theme.palette.common.black, 0.04)} 36%)`,
        backgroundSize: "200% 100%",
        animation: "security-timeline-shimmer 1.8s linear infinite",
        "@keyframes security-timeline-shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      })}
    />
  );
}

function SecurityTimelineLoading() {
  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Box minWidth={0} flex={1}>
              <LoadingBlock height={18} />
              <Box mt={1} />
              <LoadingBlock height={42} />
              <Box mt={1} />
              <LoadingBlock height={16} />
            </Box>
            <Box width={140}>
              <LoadingBlock height={42} radius={999} />
            </Box>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, minmax(0, 1fr))" },
              gap: 1.5,
            }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <LoadingBlock height={14} />
                <Box mt={1.25} />
                <LoadingBlock height={32} />
                <Box mt={1.25} />
                <LoadingBlock height={12} />
              </Box>
            ))}
          </Box>
        </Stack>
      </Box>

      <BlankCard>
        <Box sx={{ p: 2, mb: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.8fr 1fr 1fr auto" },
              gap: 2,
            }}
          >
            <LoadingBlock height={40} radius={999} />
            <LoadingBlock height={40} radius={999} />
            <LoadingBlock height={40} radius={999} />
            <LoadingBlock height={40} radius={999} />
          </Box>
        </Box>
      </BlankCard>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.35fr) minmax(400px, 0.65fr)" },
          gap: 2,
        }}
      >
        <Stack spacing={1.5}>
          {Array.from({ length: 5 }).map((_, index) => (
            <BlankCard key={index}>
              <Box sx={{ p: 2 }}>
                <Stack direction="row" spacing={1.5}>
                  <LoadingBlock height={48} radius={14} />
                  <Box minWidth={0} flex={1}>
                    <LoadingBlock height={20} />
                    <Box mt={1} />
                    <LoadingBlock height={16} />
                    <Box mt={1} />
                    <Stack direction="row" spacing={1}>
                      <Box width={80}>
                        <LoadingBlock height={28} radius={999} />
                      </Box>
                      <Box width={110}>
                        <LoadingBlock height={28} radius={999} />
                      </Box>
                      <Box width={150}>
                        <LoadingBlock height={28} radius={999} />
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </BlankCard>
          ))}
        </Stack>

        <BlankCard>
          <Box sx={{ p: 2.5 }}>
            <LoadingBlock height={86} />
            <Box mt={2} />
            <LoadingBlock height={18} />
            <Box mt={1.5} />
            {Array.from({ length: 6 }).map((_, index) => (
              <Box key={index} sx={{ mb: 1.25 }}>
                <LoadingBlock height={58} />
              </Box>
            ))}
          </Box>
        </BlankCard>
      </Box>
    </Box>
  );
}

export default function SecurityTimelineView() {
  const theme = useTheme();
  const { t } = useI18nNs(["monitoring", "common"]);

  const [search, setSearch] = useState("");
  const [riskLevel, setRiskLevel] = useState<SecurityRiskLevel | "">("");
  const [eventType, setEventType] = useState<SecurityEventType | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const isDark = theme.palette.mode === "dark";

  function tx(key: string, fallback: string) {
    const value = t(key, { defaultValue: fallback });
    if (!value || value === key || value === `[${key}]`) return fallback;
    return value;
  }

  function getRiskColor(level?: SecurityRiskLevel | null): string {
    const tone = getRiskTone(level);
    switch (tone) {
      case "error":
        return theme.palette.error.main;
      case "warning":
        return theme.palette.warning.main;
      case "info":
        return theme.palette.info.main;
      case "success":
      default:
        return theme.palette.success.main;
    }
  }

  const panelGlass = alpha(theme.palette.background.paper, isDark ? 0.74 : 0.9);
  const softBorder = alpha(theme.palette.divider, isDark ? 0.42 : 0.82);
  const ambientShadow = isDark
    ? "0 18px 40px rgba(0,0,0,0.34)"
    : "0 18px 40px rgba(15,23,42,0.08)";
  const heroShadow = isDark
    ? "0 24px 60px rgba(0,0,0,0.42)"
    : "0 24px 60px rgba(15,23,42,0.10)";

  const filter: SecurityTimelineFilter = useMemo(
    () => ({
      search: search.trim() || undefined,
      riskLevels: riskLevel ? [riskLevel] : undefined,
      eventTypes: eventType ? [eventType] : undefined,
    }),
    [search, riskLevel, eventType]
  );

  const { items, isLoading, isValidating, error, refresh, totalCount } = useSecurityTimeline({
    pageNumber: 1,
    pageSize: 20,
    filter,
  });

  const selectedItem = useMemo(() => {
    if (!items.length) return null;
    return items.find((x) => x.id === selectedId) ?? items[0];
  }, [items, selectedId]);

  const metrics = useMemo(() => {
    const summary = {
      critical: 0,
      high: 0,
      suspicious: 0,
      success: 0,
      total: items.length,
    };

    for (const item of items) {
      if (item.riskLevel === "critical") summary.critical += 1;
      if (item.riskLevel === "high") summary.high += 1;
      if (item.eventType === "suspicious_activity") summary.suspicious += 1;
      if (item.eventType === "login_success") summary.success += 1;
    }

    return summary;
  }, [items]);

  const riskDistribution = useMemo(() => {
    const total = items.length || 1;
    const counts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    for (const item of items) {
      if (item.riskLevel && item.riskLevel in counts) {
        counts[item.riskLevel] += 1;
      }
    }

    return {
      low: (counts.low / total) * 100,
      medium: (counts.medium / total) * 100,
      high: (counts.high / total) * 100,
      critical: (counts.critical / total) * 100,
    };
  }, [items]);

  function clearFilters() {
    setSearch("");
    setRiskLevel("");
    setEventType("");
    setSelectedId(null);
  }

  async function handleCopyMetadata() {
    if (!selectedItem?.metadata) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(selectedItem.metadata, null, 2));
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
      setCopied(false);
    }
  }

  useEffect(() => {
    setShowMetadata(false);
    setCopied(false);
    setCopyError(false);
  }, [selectedItem?.id]);

  if (isLoading) {
    return <SecurityTimelineLoading />;
  }

  if (error) {
    return (
      <Box mt={1}>
        <Alert severity="error" sx={{ borderRadius: 3, mb: 2 }}>
          {error}
        </Alert>

        <Button variant="contained" onClick={refresh} startIcon={<IconRefresh size={18} />}>
          {tx("common:retry", "Tekrar Dene")}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
          border: `1px solid ${softBorder}`,
          background: isDark
            ? `
              radial-gradient(circle at top left, ${alpha(theme.palette.primary.main, 0.22)} 0%, transparent 30%),
              radial-gradient(circle at top right, ${alpha(theme.palette.info.main, 0.18)} 0%, transparent 28%),
              linear-gradient(180deg, ${alpha("#101828", 0.96)} 0%, ${alpha("#0B1220", 0.92)} 100%)
            `
            : `
              radial-gradient(circle at top left, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 30%),
              radial-gradient(circle at top right, ${alpha(theme.palette.info.main, 0.10)} 0%, transparent 28%),
              linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 0.92)} 100%)
            `,
          boxShadow: heroShadow,
          backdropFilter: "blur(18px)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, isDark ? 0.04 : 0.16)} 0%, transparent 35%)`,
          }}
        />

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box minWidth={0}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.22 : 0.12),
                  color: "primary.main",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                }}
              >
                <IconSparkles size={18} />
              </Box>

              <Chip
                size="small"
                label={tx("monitoring:securityTimeline.live", "Security Insights")}
                variant="outlined"
                sx={{
                  fontWeight: 800,
                  borderColor: alpha(theme.palette.common.white, isDark ? 0.12 : 0.18),
                  bgcolor: alpha(theme.palette.background.paper, isDark ? 0.08 : 0.28),
                  backdropFilter: "blur(10px)",
                }}
              />
            </Stack>

            <Typography variant="h4" fontWeight={900} letterSpacing={-0.8}>
              {tx("monitoring:securityTimeline.title", "Güvenlik Zaman Çizelgesi")}
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={1} sx={{ maxWidth: 760 }}>
              {tx(
                "monitoring:securityTimeline.subtitle",
                "Güvenlik olaylarının birleşik akışı."
              )}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            {isValidating && (
              <Chip
                size="small"
                label={tx("common:refreshing", "Güncelleniyor")}
                color="info"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            )}

            <Tooltip title={tx("common:refresh", "Yenile")}>
              <span>
                <Button
                  variant="contained"
                  startIcon={<IconRefresh size={18} />}
                  onClick={refresh}
                  disabled={isValidating}
                  sx={{
                    borderRadius: 999,
                    px: 2,
                    fontWeight: 800,
                    boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.28)}`,
                  }}
                >
                  {tx("common:refresh", "Yenile")}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        <Box
          sx={{
            mt: 3,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              md: "repeat(4, minmax(0, 1fr))",
            },
            gap: 1.5,
            position: "relative",
            zIndex: 1,
          }}
        >
          <MetricCard
            label={tx("monitoring:securityTimeline.totalShort", "Kayıt")}
            value={totalCount}
            color={theme.palette.primary.main}
            subtitle={tx("monitoring:securityTimeline.totalHint", "Toplam eşleşen sonuç")}
          />
          <MetricCard
            label={tx("monitoring:risk.critical", "Critical")}
            value={metrics.critical}
            color={theme.palette.error.main}
            subtitle={tx("monitoring:securityTimeline.criticalHint", "Anında müdahale gerektirir")}
          />
          <MetricCard
            label={tx("monitoring:risk.high", "High")}
            value={metrics.high}
            color={theme.palette.warning.main}
            subtitle={tx("monitoring:securityTimeline.highHint", "Yüksek öncelikli olaylar")}
          />
          <MetricCard
            label={tx("monitoring:events.suspicious_activity", "Şüpheli")}
            value={metrics.suspicious}
            color={theme.palette.info.main}
            subtitle={tx("monitoring:securityTimeline.suspiciousHint", "Davranışsal anomali sinyalleri")}
          />
        </Box>
      </Box>

      <BlankCard>
        <Box
          sx={{
            p: 2,
            mb: 2,
            position: "sticky",
            top: 0,
            zIndex: 5,
            backdropFilter: "blur(18px)",
            backgroundColor: alpha(theme.palette.background.paper, isDark ? 0.72 : 0.82),
            borderBottom: `1px solid ${softBorder}`,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1.8fr 1fr 1fr auto",
              },
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tx("monitoring:filters.search", "User, IP, cihaz veya sebep ara")}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.background.default, isDark ? 0.42 : 0.55),
                },
              }}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>{tx("monitoring:filters.risk", "Risk")}</InputLabel>
              <Select
                label={tx("monitoring:filters.risk", "Risk")}
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as SecurityRiskLevel | "")}
                sx={{
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.background.default, isDark ? 0.42 : 0.55),
                }}
              >
                <MenuItem value="">{tx("common:all", "Tümü")}</MenuItem>
                {RISK_OPTIONS.map((risk) => (
                  <MenuItem key={risk} value={risk}>
                    {tx(`monitoring:risk.${risk}`, risk)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>{tx("monitoring:filters.eventType", "Olay Tipi")}</InputLabel>
              <Select
                label={tx("monitoring:filters.eventType", "Olay Tipi")}
                value={eventType}
                onChange={(e) => setEventType(e.target.value as SecurityEventType | "")}
                sx={{
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.background.default, isDark ? 0.42 : 0.55),
                }}
              >
                <MenuItem value="">{tx("common:all", "Tümü")}</MenuItem>
                {EVENT_OPTIONS.map((event) => (
                  <MenuItem key={event} value={event}>
                    {tx(`monitoring:events.${event}`, event)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="text"
              onClick={clearFilters}
              sx={{
                whiteSpace: "nowrap",
                borderRadius: 999,
                minHeight: 40,
                fontWeight: 800,
              }}
            >
              {tx("common:clear", "Temizle")}
            </Button>
          </Box>

          {items.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.75}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  {tx("monitoring:securityTimeline.riskOverview", "Risk Dağılımı")}
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 1,
                }}
              >
                <LinearProgress
                  variant="determinate"
                  value={riskDistribution.low}
                  color="success"
                  sx={{ height: 8, borderRadius: 999 }}
                />
                <LinearProgress
                  variant="determinate"
                  value={riskDistribution.medium}
                  color="info"
                  sx={{ height: 8, borderRadius: 999 }}
                />
                <LinearProgress
                  variant="determinate"
                  value={riskDistribution.high}
                  color="warning"
                  sx={{ height: 8, borderRadius: 999 }}
                />
                <LinearProgress
                  variant="determinate"
                  value={riskDistribution.critical}
                  color="error"
                  sx={{ height: 8, borderRadius: 999 }}
                />
              </Box>
            </Box>
          ) : null}
        </Box>
      </BlankCard>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.35fr) minmax(400px, 0.65fr)",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Box
          sx={{
            position: "relative",
            pl: 3.25,
            pr: 0.5,
            "&::before": {
              content: '""',
              position: "absolute",
              left: 14,
              top: 12,
              bottom: 12,
              width: 2,
              borderRadius: 999,
              background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.28)} 0%, ${alpha(
                theme.palette.divider,
                1
              )} 18%, ${alpha(theme.palette.divider, 1)} 82%, ${alpha(theme.palette.primary.main, 0.12)} 100%)`,
            },
          }}
        >
          {items.length === 0 ? (
            <Alert severity="success" sx={{ borderRadius: 3 }}>
              {tx("monitoring:securityTimeline.empty", "Bu aralıkta güvenlik olayı bulunamadı.")}
            </Alert>
          ) : (
            <Stack spacing={1.5}>
              {items.map((item) => {
                const selected = selectedItem?.id === item.id;
                const tone = getRiskTone(item.riskLevel);
                const accent = getRiskColor(item.riskLevel);

                return (
                  <Box key={item.id} sx={{ position: "relative" }}>
                    <Box
                      sx={{
                        position: "absolute",
                        left: -16,
                        top: 26,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        bgcolor: accent,
                        border: `3px solid ${theme.palette.background.paper}`,
                        boxShadow: `0 0 0 6px ${alpha(accent, 0.14)}`,
                        zIndex: 1,
                      }}
                    />

                    <BlankCard>
                      <Box
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected}
                        onClick={() => setSelectedId(item.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedId(item.id);
                          }
                        }}
                        sx={{
                          p: 2,
                          cursor: "pointer",
                          borderRadius: 3,
                          border: `1px solid ${selected ? alpha(accent, 0.34) : softBorder}`,
                          borderLeft: `4px solid ${accent}`,
                          background: selected
                            ? `linear-gradient(180deg, ${alpha(accent, isDark ? 0.18 : 0.11)} 0%, ${alpha(
                                theme.palette.background.paper,
                                1
                              )} 100%)`
                            : `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(
                                theme.palette.background.default,
                                isDark ? 0.26 : 0.5
                              )} 100%)`,
                          boxShadow: selected
                            ? `0 18px 40px ${alpha(accent, isDark ? 0.22 : 0.16)}`
                            : ambientShadow,
                          transition:
                            "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: `0 18px 40px ${alpha(accent, isDark ? 0.22 : 0.14)}`,
                            borderColor: alpha(accent, 0.28),
                          },
                          "&:focus-visible": {
                            outline: "none",
                            boxShadow: `0 0 0 3px ${alpha(accent, 0.22)}, 0 18px 40px ${alpha(
                              accent,
                              isDark ? 0.22 : 0.14
                            )}`,
                          },
                        }}
                      >
                        <Box display="flex" gap={1.5}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: "14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: accent,
                              bgcolor: alpha(accent, 0.12),
                              boxShadow: `inset 0 0 0 1px ${alpha(accent, 0.14)}`,
                              flexShrink: 0,
                            }}
                          >
                            {getEventIcon(item.eventType, 20)}
                          </Box>

                          <Box minWidth={0} flex={1}>
                            <Stack
                              direction="row"
                              alignItems="flex-start"
                              justifyContent="space-between"
                              spacing={1}
                            >
                              <Box minWidth={0}>
                                <Typography fontWeight={900} sx={{ lineHeight: 1.2 }}>
                                  {tx(`monitoring:events.${item.eventType}`, item.eventType)}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    mt: 0.5,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.reason || "—"}
                                </Typography>
                              </Box>

                              <IconChevronRight
                                size={18}
                                style={{
                                  flexShrink: 0,
                                  opacity: selected ? 1 : 0.45,
                                }}
                              />
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={1}
                              mt={1.25}
                              useFlexGap
                              flexWrap="wrap"
                              alignItems="center"
                            >
                              <Chip
                                size="small"
                                label={tx(`monitoring:risk.${item.riskLevel}`, item.riskLevel)}
                                color={tone}
                                variant={selected ? "filled" : "outlined"}
                                sx={{ fontWeight: 800 }}
                              />

                              {item.status ? (
                                <Chip
                                  size="small"
                                  label={tx(`monitoring:status.${item.status}`, item.status)}
                                  variant="outlined"
                                  sx={{ fontWeight: 700 }}
                                />
                              ) : null}

                              <Chip
                                size="small"
                                icon={<IconClock size={14} />}
                                label={formatDateTime(item.timestamp)}
                                variant="outlined"
                                sx={{ fontWeight: 700 }}
                              />
                            </Stack>
                          </Box>
                        </Box>
                      </Box>
                    </BlankCard>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        <BlankCard>
          <Box
            sx={{
              p: 2.5,
              position: { lg: "sticky" },
              top: { lg: 16 },
            }}
          >
            {!selectedItem ? (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                {tx(
                  "monitoring:securityTimeline.detailPlaceholder",
                  "Bir olay seçildiğinde detay burada görünecek."
                )}
              </Alert>
            ) : (
              <Stack spacing={2}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${softBorder}`,
                    background: isDark
                      ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.88)} 0%, ${alpha(
                          theme.palette.background.default,
                          0.38
                        )} 100%)`
                      : `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(
                          theme.palette.background.default,
                          0.5
                        )} 100%)`,
                    boxShadow: ambientShadow,
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 54,
                          height: 54,
                          borderRadius: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: getRiskColor(selectedItem.riskLevel),
                          bgcolor: alpha(getRiskColor(selectedItem.riskLevel), 0.12),
                          boxShadow: `inset 0 0 0 1px ${alpha(getRiskColor(selectedItem.riskLevel), 0.12)}`,
                          flexShrink: 0,
                        }}
                      >
                        {getEventIcon(selectedItem.eventType, 22)}
                      </Box>

                      <Box minWidth={0} flex={1}>
                        <Typography variant="overline" color="text.secondary" fontWeight={900}>
                          {tx("monitoring:securityTimeline.detail", "Incident Detail")}
                        </Typography>

                        <Typography
                          variant="h6"
                          fontWeight={900}
                          sx={{ lineHeight: 1.12, letterSpacing: -0.25 }}
                        >
                          {tx(`monitoring:events.${selectedItem.eventType}`, selectedItem.eventType)}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          {formatDateTime(selectedItem.timestamp)}
                        </Typography>
                      </Box>

                      <Chip
                        size="small"
                        label={tx(`monitoring:risk.${selectedItem.riskLevel}`, selectedItem.riskLevel)}
                        color={getRiskTone(selectedItem.riskLevel)}
                        sx={{ fontWeight: 900 }}
                      />
                    </Stack>

                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={800}>
                        {tx("monitoring:securityTimeline.severityStrip", "Severity Heat Strip")}
                      </Typography>

                      <Box
                        sx={{
                          mt: 0.75,
                          p: 0.75,
                          borderRadius: 999,
                          border: `1px solid ${softBorder}`,
                          bgcolor: alpha(theme.palette.background.default, isDark ? 0.4 : 0.7),
                        }}
                      >
                        <Box
                          sx={{
                            height: 10,
                            borderRadius: 999,
                            background: `linear-gradient(90deg,
                              ${theme.palette.success.main} 0%,
                              ${theme.palette.info.main} 35%,
                              ${theme.palette.warning.main} 68%,
                              ${theme.palette.error.main} 100%)`,
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              top: "50%",
                              left:
                                selectedItem.riskLevel === "low"
                                  ? "8%"
                                  : selectedItem.riskLevel === "medium"
                                  ? "38%"
                                  : selectedItem.riskLevel === "high"
                                  ? "71%"
                                  : "94%",
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              bgcolor: theme.palette.background.paper,
                              border: `3px solid ${getRiskColor(selectedItem.riskLevel)}`,
                              transform: "translate(-50%, -50%)",
                              boxShadow: `0 0 0 6px ${alpha(getRiskColor(selectedItem.riskLevel), 0.18)}`,
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {selectedItem.userId ? (
                        <Chip size="small" variant="outlined" label={`User: ${selectedItem.userId}`} />
                      ) : null}
                      {selectedItem.ipAddress ? (
                        <Chip size="small" variant="outlined" label={`IP: ${selectedItem.ipAddress}`} />
                      ) : null}
                      {selectedItem.device ? (
                        <Chip size="small" variant="outlined" label={`Device: ${selectedItem.device}`} />
                      ) : null}
                    </Stack>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${softBorder}`,
                    overflow: "hidden",
                    bgcolor: alpha(theme.palette.background.paper, isDark ? 0.52 : 0.8),
                  }}
                >
                  <Box sx={{ px: 1.5, py: 1.2, borderBottom: `1px solid ${softBorder}` }}>
                    <Typography variant="subtitle2" fontWeight={900}>
                      {tx("monitoring:securityTimeline.context", "Olay Bağlamı")}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: 1.25,
                      }}
                    >
                      <DetailRow
                        label="Risk"
                        value={tx(`monitoring:risk.${selectedItem.riskLevel}`, selectedItem.riskLevel)}
                      />

                      {selectedItem.status ? (
                        <DetailRow
                          label="Status"
                          value={tx(`monitoring:status.${selectedItem.status}`, selectedItem.status)}
                        />
                      ) : null}

                      <DetailRow label="Reason" value={selectedItem.reason} />
                      <DetailRow label="User ID" value={selectedItem.userId} />

                      <DetailRow
                        label="IP Address"
                        value={
                          selectedItem.ipAddress ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <IconWorld size={16} />
                              <span>{selectedItem.ipAddress}</span>
                            </Box>
                          ) : null
                        }
                      />

                      <DetailRow
                        label="Device"
                        value={
                          selectedItem.device ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <IconDeviceDesktop size={16} />
                              <span>{selectedItem.device}</span>
                            </Box>
                          ) : null
                        }
                      />

                      <DetailRow label="Correlation ID" value={selectedItem.correlationId} />
                    </Box>
                  </Box>
                </Box>

                {selectedItem.metadata ? (
                  <Box
                    sx={{
                      borderRadius: 3,
                      border: `1px solid ${softBorder}`,
                      overflow: "hidden",
                      bgcolor: alpha(theme.palette.background.paper, isDark ? 0.52 : 0.8),
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1.2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        borderBottom: `1px solid ${softBorder}`,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={900}>
                          {tx("monitoring:metadata.title", "Metadata")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tx(
                            "monitoring:metadata.subtitle",
                            "Ham olay verisi ve ek bağlam bilgileri"
                          )}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleCopyMetadata}
                          startIcon={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                          sx={{ borderRadius: 999, fontWeight: 800 }}
                        >
                          {copied
                            ? tx("monitoring:metadata.copied", "Kopyalandı")
                            : tx("monitoring:metadata.copy", "Kopyala")}
                        </Button>

                        <Button
                          variant={showMetadata ? "contained" : "outlined"}
                          size="small"
                          onClick={() => setShowMetadata((v) => !v)}
                          sx={{ borderRadius: 999, fontWeight: 800 }}
                        >
                          {showMetadata
                            ? tx("monitoring:metadata.hide", "Metadata gizle")
                            : tx("monitoring:metadata.show", "Metadata göster")}
                        </Button>
                      </Stack>
                    </Box>

                    {showMetadata ? (
                      <Box
                        sx={{
                          position: "relative",
                          bgcolor: isDark
                            ? alpha(theme.palette.common.black, 0.28)
                            : alpha(theme.palette.common.black, 0.03),
                        }}
                      >
                        <Box
                          sx={{
                            px: 1.5,
                            py: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottom: `1px solid ${softBorder}`,
                            bgcolor: alpha(theme.palette.background.paper, isDark ? 0.48 : 0.8),
                          }}
                        >
                          <Typography variant="caption" fontWeight={900} color="text.secondary">
                            JSON
                          </Typography>

                          <IconButton size="small" onClick={handleCopyMetadata}>
                            {copied ? <IconCheck size={14} /> : <IconFingerprint size={14} />}
                          </IconButton>
                        </Box>

                        <Box
                          component="pre"
                          sx={{
                            m: 0,
                            p: 1.5,
                            overflow: "auto",
                            fontSize: 12,
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            fontFamily:
                              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          }}
                        >
                          {JSON.stringify(selectedItem.metadata, null, 2)}
                        </Box>
                      </Box>
                    ) : null}
                  </Box>
                ) : null}
              </Stack>
            )}
          </Box>
        </BlankCard>
      </Box>

      <Snackbar
        open={copied}
        autoHideDuration={1800}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setCopied(false)} severity="success" variant="filled" sx={{ width: "100%" }}>
          {tx("monitoring:metadata.copySuccess", "Metadata panoya kopyalandı")}
        </Alert>
      </Snackbar>

      <Snackbar
        open={copyError}
        autoHideDuration={2200}
        onClose={() => setCopyError(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setCopyError(false)} severity="error" variant="filled" sx={{ width: "100%" }}>
          {tx("monitoring:metadata.copyError", "Metadata kopyalanamadı")}
        </Alert>
      </Snackbar>
    </Box>
  );
}