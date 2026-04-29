// src/modules/monitoring/views/LockoutCenterView.tsx

"use client";

import React, { useMemo, useState } from "react";
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
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
  IconArrowNarrowRight,
  IconClock,
  IconFilter,
  IconFingerprint,
  IconLock,
  IconLockOpen,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconShieldLock,
  IconSparkles,
  IconUser,
  IconWorld,
} from "@tabler/icons-react";

import BlankCard from "@/app/components/shared/BlankCard";
import { useI18nNs } from "@/app/context/i18nContext";
import { useLockoutMonitoring } from "../hooks/useLockoutMonitoring";
import { useLockoutOperations } from "../hooks/useLockoutOperations";

import type {
  LockoutActivityType,
  LockoutRisk,
  LockoutStatus,
  LockoutTargetType,
} from "../types/LockoutMonitoring.types";

type MetricCardProps = {
  label: string;
  value: string | number;
  subtitle: string;
  color: string;
};

type LockoutOperationType = "unlock" | "extend" | "review";

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function getRiskTone(risk?: LockoutRisk): "success" | "info" | "warning" | "error" {
  switch (risk) {
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

function getStatusTone(status?: LockoutStatus): "success" | "warning" | "default" {
  switch (status) {
    case "active":
      return "warning";
    case "expiring":
      return "success";
    case "released":
    default:
      return "default";
  }
}

function getTargetIcon(type?: LockoutTargetType, size = 18) {
  return type === "ip" ? <IconWorld size={size} /> : <IconUser size={size} />;
}

function getActivityIcon(type: LockoutActivityType, size = 18) {
  switch (type) {
    case "unlock":
      return <IconLockOpen size={size} />;
    case "decision":
      return <IconShieldCheck size={size} />;
    case "review":
      return <IconFingerprint size={size} />;
    case "extend":
      return <IconClock size={size} />;
    case "lock":
    default:
      return <IconLock size={size} />;
  }
}

function MetricCard({ label, value, subtitle, color }: MetricCardProps) {
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

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
            {subtitle}
          </Typography>
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

export default function LockoutCenterView() {
  const theme = useTheme();
  const { t } = useI18nNs(["monitoring", "common"]);

  const tx = (key: string, fallback: string) => {
    const value = t(key, { defaultValue: fallback });
    return !value || value === key || value === `[${key}]` ? fallback : value;
  };

  const {
    summary,
    listResult,
    items,
    selectedItem,
    recentActivity,
    filters,
    setFilters,
    setSelectedId,
    clearFilters,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useLockoutMonitoring({
    pageSize: 20,
    recentActivityTake: 20,
  });

  const {
    isProcessing,
    error: operationError,
    unlockUserAsync,
    unlockIpAsync,
    extendLockoutAsync,
    markManualReviewAsync,
  } = useLockoutOperations();

  const [operationType, setOperationType] = useState<LockoutOperationType>("unlock");
  const [operationNote, setOperationNote] = useState("");
  const [operationSuccessOpen, setOperationSuccessOpen] = useState(false);

  const selectedActionLabel = useMemo(() => {
    if (!selectedItem) return "";

    if (operationType === "unlock") {
      return selectedItem.targetType === "ip"
        ? tx("monitoring:lockoutCenter.actions.unlockIp", "Unlock IP")
        : tx("monitoring:lockoutCenter.actions.unlockUser", "Unlock User");
    }

    if (operationType === "extend") {
      return tx("monitoring:lockoutCenter.actions.extend", "Lock Süresini Uzat");
    }

    return tx("monitoring:lockoutCenter.actions.review", "Manual Review");
  }, [operationType, selectedItem]);

  const requiresAttention =
    selectedItem?.risk === "critical" || selectedItem?.risk === "high";

  async function handleOperationSubmit() {
    if (!selectedItem) return;
    if (!operationNote.trim()) return;

    let result = null;

    if (operationType === "unlock") {
      if (selectedItem.targetType === "ip") {
        result = await unlockIpAsync({
          ipAddress: selectedItem.targetValue,
          reason: operationNote.trim(),
        });
      } else if (selectedItem.userId) {
        result = await unlockUserAsync(selectedItem.userId, {
          reason: operationNote.trim(),
        });
      }
    }

    if (operationType === "extend") {
      result = await extendLockoutAsync(selectedItem.id, {
        extendMinutes: 30,
        reason: operationNote.trim(),
      });
    }

if (operationType === "review") {
  if (selectedItem.targetType === "user" && !selectedItem.userId) {
    return;
  }

  result = await markManualReviewAsync(selectedItem.id, {
    targetType: selectedItem.targetType,
    userId: selectedItem.targetType === "user" ? selectedItem.userId : null,
    ipAddress: selectedItem.targetType === "ip" ? selectedItem.targetValue : null,
    reason: operationNote.trim(),
    reviewerNote: operationNote.trim(),
  });
}

    if (result?.success) {
      setOperationSuccessOpen(true);
      setOperationNote("");
      await refresh();
    }
  }

  const isDark = theme.palette.mode === "dark";
  const softBorder = alpha(theme.palette.divider, isDark ? 0.42 : 0.82);
  const heroShadow = isDark
    ? "0 24px 60px rgba(0,0,0,0.42)"
    : "0 24px 60px rgba(15,23,42,0.10)";
  const ambientShadow = isDark
    ? "0 18px 40px rgba(0,0,0,0.34)"
    : "0 18px 40px rgba(15,23,42,0.08)";

  const filteredItems = items;

  const metrics = {
    active: summary?.active ?? 0,
    expiring: summary?.expiring ?? 0,
    critical: summary?.critical ?? 0,
    automatic: summary?.automatic ?? 0,
    autoRate: summary?.autoRate ?? 0,
  };

  const riskDistribution = useMemo(() => {
    const distribution = listResult?.riskDistribution;

    const total =
      (distribution?.low ?? 0) +
      (distribution?.medium ?? 0) +
      (distribution?.high ?? 0) +
      (distribution?.critical ?? 0);

    if (!distribution || total <= 0) {
      return {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };
    }

    return {
      low: (distribution.low / total) * 100,
      medium: (distribution.medium / total) * 100,
      high: (distribution.high / total) * 100,
      critical: (distribution.critical / total) * 100,
    };
  }, [listResult]);

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
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.common.white,
              isDark ? 0.04 : 0.16
            )} 0%, transparent 35%)`,
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
                label={tx("monitoring:lockoutCenter.badge", "Access Protection")}
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
              {tx("monitoring:lockoutCenter.title", "Lockout Center")}
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={1} sx={{ maxWidth: 820 }}>
              {tx(
                "monitoring:lockoutCenter.subtitle",
                "Kilitli kullanıcılar, engellenmiş IP adresleri ve unlock kararları için merkezi operasyon ekranı."
              )}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              size="small"
              color="warning"
              variant="outlined"
              label={`${tx("monitoring:lockoutCenter.hero.active", "Active")}: ${metrics.active}`}
              sx={{ fontWeight: 800 }}
            />
            <Button
              variant="contained"
              onClick={() => void refresh()}
              disabled={isRefreshing}
              startIcon={<IconRefresh size={18} />}
              sx={{
                borderRadius: 999,
                px: 2,
                fontWeight: 800,
                boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.28)}`,
              }}
            >
              {tx("common:refresh", "Yenile")}
            </Button>
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
            label={tx("monitoring:lockoutCenter.metrics.active", "Aktif Lock")}
            value={metrics.active}
            subtitle={tx("monitoring:lockoutCenter.metrics.activeHint", "Müdahale bekleyen kayıtlar")}
            color={theme.palette.warning.main}
          />
          <MetricCard
            label={tx("monitoring:lockoutCenter.metrics.expiring", "Süresi Dolmak Üzere")}
            value={metrics.expiring}
            subtitle={tx("monitoring:lockoutCenter.metrics.expiringHint", "Yakın zamanda kapanacak lock’lar")}
            color={theme.palette.success.main}
          />
          <MetricCard
            label={tx("monitoring:lockoutCenter.metrics.critical", "Critical")}
            value={metrics.critical}
            subtitle={tx("monitoring:lockoutCenter.metrics.criticalHint", "En yüksek risk segmenti")}
            color={theme.palette.error.main}
          />
          <MetricCard
            label={tx("monitoring:lockoutCenter.metrics.autoRate", "Otomasyon")}
            value={`${metrics.autoRate.toFixed(0)}%`}
            subtitle={tx("monitoring:lockoutCenter.metrics.autoRateHint", "Policy motoru ile oluşturulan lock")}
            color={theme.palette.info.main}
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {tx("monitoring:lockoutCenter.loadError", "Lockout verileri yüklenirken bir hata oluştu.")}
        </Alert>
      )}

      {operationError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {operationError}
        </Alert>
      )}

      {isLoading && <LinearProgress sx={{ mb: 2, borderRadius: 999 }} />}

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
                md: "1.5fr 1fr 1fr 1fr auto",
              },
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
              size="small"
              fullWidth
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              placeholder={tx(
                "monitoring:lockoutCenter.filters.search",
                "Kullanıcı, IP, rule, correlation veya sebep ara"
              )}
              InputProps={{
                startAdornment: <IconSearch size={18} />,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.background.default, isDark ? 0.42 : 0.55),
                },
              }}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>{tx("monitoring:lockoutCenter.filters.type", "Hedef")}</InputLabel>
              <Select
                label={tx("monitoring:lockoutCenter.filters.type", "Hedef")}
                value={filters.type}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: event.target.value as "all" | LockoutTargetType,
                  }))
                }
                sx={{
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.background.default, isDark ? 0.42 : 0.55),
                }}
              >
                <MenuItem value="all">{tx("common:all", "Tümü")}</MenuItem>
                <MenuItem value="user">{tx("monitoring:lockoutCenter.type.user", "Kullanıcı")}</MenuItem>
                <MenuItem value="ip">{tx("monitoring:lockoutCenter.type.ip", "IP")}</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>{tx("monitoring:lockoutCenter.filters.status", "Durum")}</InputLabel>
              <Select
                label={tx("monitoring:lockoutCenter.filters.status", "Durum")}
                value={filters.status}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: event.target.value as "all" | LockoutStatus,
                  }))
                }
                sx={{
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.background.default, isDark ? 0.42 : 0.55),
                }}
              >
                <MenuItem value="all">{tx("common:all", "Tümü")}</MenuItem>
                <MenuItem value="active">{tx("monitoring:lockoutCenter.status.active", "Aktif")}</MenuItem>
                <MenuItem value="expiring">{tx("monitoring:lockoutCenter.status.expiring", "Süresi Doluyor")}</MenuItem>
                <MenuItem value="released">{tx("monitoring:lockoutCenter.status.released", "Serbest")}</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>{tx("monitoring:lockoutCenter.filters.risk", "Risk")}</InputLabel>
              <Select
                label={tx("monitoring:lockoutCenter.filters.risk", "Risk")}
                value={filters.risk}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    risk: event.target.value as "all" | LockoutRisk,
                  }))
                }
                sx={{
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.background.default, isDark ? 0.42 : 0.55),
                }}
              >
                <MenuItem value="all">{tx("common:all", "Tümü")}</MenuItem>
                <MenuItem value="low">{tx("monitoring:risk.low", "Low")}</MenuItem>
                <MenuItem value="medium">{tx("monitoring:risk.medium", "Medium")}</MenuItem>
                <MenuItem value="high">{tx("monitoring:risk.high", "High")}</MenuItem>
                <MenuItem value="critical">{tx("monitoring:risk.critical", "Critical")}</MenuItem>
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
        </Box>
      </BlankCard>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            xl: "minmax(0, 1.25fr) minmax(390px, 0.75fr)",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Box>
          {!filteredItems.length ? (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              {tx("monitoring:lockoutCenter.empty", "Filtreye uygun lock kaydı bulunamadı.")}
            </Alert>
          ) : (
            <Stack spacing={1.5}>
              {filteredItems.map((item) => {
                const selected = selectedItem?.id === item.id;
                const tone = getRiskTone(item.risk);
                const accent = theme.palette[tone].main;

                return (
                  <BlankCard key={item.id}>
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-pressed={selected}
                      onClick={() => setSelectedId(item.id)}
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
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: alpha(accent, 0.12),
                              color: accent,
                              border: `1px solid ${alpha(accent, 0.18)}`,
                            }}
                          >
                            {getTargetIcon(item.targetType, 20)}
                          </Avatar>

                          <Box minWidth={0} flex={1}>
                            <Stack direction="row" spacing={1} justifyContent="space-between">
                              <Box minWidth={0}>
                                <Typography fontWeight={900} sx={{ lineHeight: 1.15 }}>
                                  {item.displayName || item.targetValue}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {item.displayName
                                    ? item.targetValueMasked
                                    : item.targetValueMasked || item.targetValue}
                                </Typography>
                              </Box>

                              <IconArrowNarrowRight size={18} style={{ opacity: selected ? 1 : 0.45 }} />
                            </Stack>
                          </Box>
                        </Stack>

                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {item.reason}
                        </Typography>

                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          <Chip
                            size="small"
                            label={tx(`monitoring:risk.${item.risk}`, item.risk)}
                            color={tone}
                            variant={selected ? "filled" : "outlined"}
                            sx={{ fontWeight: 800 }}
                          />
                          <Chip
                            size="small"
                            label={tx(`monitoring:lockoutCenter.status.${item.status}`, item.status)}
                            variant="outlined"
                            color={getStatusTone(item.status)}
                            sx={{ fontWeight: 800 }}
                          />
                          <Chip
                            size="small"
                            icon={<IconShieldLock size={14} />}
                            label={item.sourceRule}
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                          <Chip
                            size="small"
                            icon={<IconClock size={14} />}
                            label={formatDateTime(item.lockedAt)}
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  </BlankCard>
                );
              })}
            </Stack>
          )}
        </Box>

        <Stack spacing={2}>
          <BlankCard>
            <Box sx={{ p: 2.5, position: { xl: "sticky" }, top: { xl: 16 } }}>
              {!selectedItem ? (
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                  {tx(
                    "monitoring:lockoutCenter.detailPlaceholder",
                    "Bir lock kaydı seçildiğinde detay burada görünecek."
                  )}
                </Alert>
              ) : (
                <Stack spacing={2}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: `1px solid ${softBorder}`,
                      bgcolor: alpha(theme.palette.background.paper, isDark ? 0.72 : 0.95),
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
                            color: theme.palette[getRiskTone(selectedItem.risk)].main,
                            bgcolor: alpha(theme.palette[getRiskTone(selectedItem.risk)].main, 0.12),
                            flexShrink: 0,
                          }}
                        >
                          {getTargetIcon(selectedItem.targetType, 22)}
                        </Box>

                        <Box minWidth={0} flex={1}>
                          <Typography variant="overline" color="text.secondary" fontWeight={900}>
                            {tx("monitoring:lockoutCenter.detail", "Incident Inspector")}
                          </Typography>

                          <Typography variant="h6" fontWeight={900}>
                            {selectedItem.displayName || selectedItem.targetValue}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" mt={0.5}>
                            {selectedItem.targetValueMasked || selectedItem.targetValue}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          color={getRiskTone(selectedItem.risk)}
                          label={tx(`monitoring:risk.${selectedItem.risk}`, selectedItem.risk)}
                          sx={{ fontWeight: 900 }}
                        />
                      </Stack>

                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`${tx("monitoring:lockoutCenter.fields.attempts", "Attempt")}: ${selectedItem.attempts}`}
                        />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={
                            selectedItem.automatic
                              ? tx("monitoring:lockoutCenter.automatic", "Otomatik")
                              : tx("monitoring:lockoutCenter.manual", "Manuel")
                          }
                        />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`${tx("monitoring:lockoutCenter.fields.rule", "Rule")}: ${selectedItem.sourceRule}`}
                        />
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
                        {tx("monitoring:lockoutCenter.context", "Karar Bağlamı")}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 1.5 }}>
                      <Stack spacing={1.5}>
                        <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
                          {selectedItem.notes ||
                            tx(
                              "monitoring:lockoutCenter.defaultReason",
                              "Bu karar güvenlik sinyalleri birleştirilerek üretildi."
                            )}
                        </Alert>

                        <Box sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${softBorder}` }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={800}>
                            {tx("monitoring:lockoutCenter.fields.reason", "Reason")}
                          </Typography>
                          <Typography variant="body2" fontWeight={700} mt={0.5}>
                            {selectedItem.reason}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25 }}>
                          <Box sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${softBorder}` }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={800}>
                              {tx("monitoring:lockoutCenter.fields.lockedAt", "Locked At")}
                            </Typography>
                            <Typography variant="body2" fontWeight={700} mt={0.5}>
                              {formatDateTime(selectedItem.lockedAt)}
                            </Typography>
                          </Box>

                          <Box sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${softBorder}` }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={800}>
                              {tx("monitoring:lockoutCenter.fields.expiresAt", "Expires At")}
                            </Typography>
                            <Typography variant="body2" fontWeight={700} mt={0.5}>
                              {formatDateTime(selectedItem.expiresAt)}
                            </Typography>
                          </Box>

                          <Box sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${softBorder}` }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={800}>
                              {tx("monitoring:lockoutCenter.fields.country", "Country")}
                            </Typography>
                            <Typography variant="body2" fontWeight={700} mt={0.5}>
                              {selectedItem.country || "—"}
                            </Typography>
                          </Box>

                          <Box sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${softBorder}` }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={800}>
                              {tx("monitoring:lockoutCenter.fields.device", "Device")}
                            </Typography>
                            <Typography variant="body2" fontWeight={700} mt={0.5}>
                              {selectedItem.device || "—"}
                            </Typography>
                          </Box>
                        </Box>

                        <Divider />

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
                              borderBottom: `1px solid ${softBorder}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1,
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle2" fontWeight={900}>
                                {tx("monitoring:lockoutCenter.actions.title", "Operasyon Aksiyonları")}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {tx(
                                  "monitoring:lockoutCenter.actions.subtitle",
                                  "Seçili lock kaydı için kontrollü işlem akışı"
                                )}
                              </Typography>
                            </Box>

                            <Tooltip
                              title={tx(
                                "monitoring:lockoutCenter.actions.auditHint",
                                "Tüm işlemler audit trail ile izlenmelidir"
                              )}
                            >
                              <Chip
                                size="small"
                                icon={<IconShieldCheck size={14} />}
                                label={tx("monitoring:lockoutCenter.actions.audit", "Audit Ready")}
                                variant="outlined"
                                sx={{ fontWeight: 800 }}
                              />
                            </Tooltip>
                          </Box>

                          <Box sx={{ p: 1.5 }}>
                            <Stack spacing={1.5}>
                              {requiresAttention && (
                                <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
                                  {tx(
                                    "monitoring:lockoutCenter.actions.warning",
                                    "Seçili kayıt yüksek risk taşıyor. İşlem öncesi sebep ve etki değerlendirmesi not edilmelidir."
                                  )}
                                </Alert>
                              )}

                              <FormControl fullWidth size="small">
                                <InputLabel>
                                  {tx("monitoring:lockoutCenter.actions.operationType", "İşlem Tipi")}
                                </InputLabel>
                                <Select
                                  label={tx("monitoring:lockoutCenter.actions.operationType", "İşlem Tipi")}
                                  value={operationType}
                                  onChange={(event) =>
                                    setOperationType(event.target.value as LockoutOperationType)
                                  }
                                  sx={{
                                    borderRadius: 2.5,
                                    bgcolor: alpha(theme.palette.background.default, isDark ? 0.32 : 0.58),
                                  }}
                                >
                                  <MenuItem value="unlock">
                                    {selectedItem.targetType === "ip"
                                      ? tx("monitoring:lockoutCenter.actions.unlockIp", "Unlock IP")
                                      : tx("monitoring:lockoutCenter.actions.unlockUser", "Unlock User")}
                                  </MenuItem>
                                  <MenuItem value="extend">
                                    {tx("monitoring:lockoutCenter.actions.extend", "Lock Süresini Uzat")}
                                  </MenuItem>
                                  <MenuItem value="review">
                                    {tx("monitoring:lockoutCenter.actions.review", "Manual Review")}
                                  </MenuItem>
                                </Select>
                              </FormControl>

                              <TextField
                                fullWidth
                                multiline
                                minRows={4}
                                value={operationNote}
                                onChange={(event) => setOperationNote(event.target.value)}
                                placeholder={tx(
                                  "monitoring:lockoutCenter.actions.notePlaceholder",
                                  "İşlem sebebini, gözlemini veya açıklamasını yazın"
                                )}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2.5,
                                    bgcolor: alpha(theme.palette.background.default, isDark ? 0.28 : 0.48),
                                  },
                                }}
                              />

                              <Box
                                sx={{
                                  p: 1.25,
                                  borderRadius: 2.5,
                                  border: `1px solid ${softBorder}`,
                                  bgcolor: alpha(theme.palette.background.default, isDark ? 0.22 : 0.42),
                                }}
                              >
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={1}
                                  alignItems={{ xs: "flex-start", sm: "center" }}
                                  justifyContent="space-between"
                                >
                                  <Box>
                                    <Typography variant="body2" fontWeight={800}>
                                      {tx("monitoring:lockoutCenter.actions.summary", "İşlem Özeti")}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {selectedActionLabel || "—"}
                                    </Typography>
                                  </Box>

                                  <Button
                                    variant="contained"
                                    onClick={() => void handleOperationSubmit()}
                                    disabled={isProcessing || !selectedItem || !operationNote.trim()}
                                    startIcon={<IconArrowNarrowRight size={18} />}
                                    sx={{ borderRadius: 999, fontWeight: 800 }}
                                  >
                                    {isProcessing
                                      ? tx("monitoring:lockoutCenter.actions.processing", "İşleniyor")
                                      : selectedActionLabel}
                                  </Button>
                                </Stack>
                              </Box>
                            </Stack>
                          </Box>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>
                </Stack>
              )}
            </Box>
          </BlankCard>

          <BlankCard>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: `1px solid ${softBorder}`,
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.66 : 0.9),
                backdropFilter: "blur(16px)",
                boxShadow: ambientShadow,
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" fontWeight={900}>
                  {tx("monitoring:lockoutCenter.timelineTitle", "Recent Activity")}
                </Typography>

                {recentActivity.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 3 }}>
                    {tx("monitoring:lockoutCenter.timelineEmpty", "Henüz görüntülenecek aktivite bulunamadı.")}
                  </Alert>
                ) : (
                  recentActivity.map((item) => {
                    const accent =
                      item.type === "unlock"
                        ? theme.palette.success.main
                        : item.type === "decision"
                          ? theme.palette.info.main
                          : item.type === "review"
                            ? theme.palette.warning.main
                            : theme.palette.error.main;

                    return (
                      <Box key={item.id} sx={{ position: "relative" }}>
                        <Stack direction="row" spacing={1.25} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: 2.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: accent,
                              bgcolor: alpha(accent, 0.12),
                              boxShadow: `inset 0 0 0 1px ${alpha(accent, 0.14)}`,
                              flexShrink: 0,
                            }}
                          >
                            {getActivityIcon(item.type, 18)}
                          </Box>

                          <Box minWidth={0} flex={1}>
                            <Typography variant="subtitle2" fontWeight={800}>
                             {tx(item.title, item.title)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={0.25}>
                              {item.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                              {formatDateTime(item.at)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })
                )}
              </Stack>
            </Box>
          </BlankCard>
        </Stack>
      </Box>

      <Snackbar
        open={operationSuccessOpen}
        autoHideDuration={1800}
        onClose={() => setOperationSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOperationSuccessOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {tx("monitoring:lockoutCenter.actions.success", "Operasyon başarıyla işlendi")}
        </Alert>
      </Snackbar>
    </Box>
  );
}