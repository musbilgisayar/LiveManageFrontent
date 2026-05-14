// src/modules/users/components/list/UsersTable.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconChevronLeft,
  IconChevronRight,
  IconMail,
  IconPhone,
  IconSearch,
  IconShieldCheck,
  IconUser,
} from "@tabler/icons-react";
import { useI18nNs } from "@/app/context/i18nContext";
import { useSuperAdminUsers } from "../../hooks/useSuperAdminUsers";

type Props = {
  locale: string;
};

type StatusFilter = "all" | "active" | "passive";
type PageSizeOption = 10 | 20 | 50;

type LoadingBlockProps = {
  height: number;
  radius?: number;
};

function LoadingBlock({ height, radius = 14 }: LoadingBlockProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        height,
        borderRadius: radius / 8,
        background: isDark
          ? `linear-gradient(90deg,
              ${alpha(theme.palette.common.white, 0.05)} 0%,
              ${alpha(theme.palette.common.white, 0.10)} 18%,
              ${alpha(theme.palette.common.white, 0.05)} 36%)`
          : `linear-gradient(90deg,
              ${alpha(theme.palette.common.black, 0.04)} 0%,
              ${alpha(theme.palette.common.black, 0.08)} 18%,
              ${alpha(theme.palette.common.black, 0.04)} 36%)`,
        backgroundSize: "200% 100%",
        animation: "users-table-shimmer 1.8s linear infinite",
        "@keyframes users-table-shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      }}
    />
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
        p: 2,
        minWidth: 0,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 12px 28px rgba(0,0,0,0.06)",
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1.5}>
        <Box minWidth={0}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mb: 0.75,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 0.4,
              fontWeight: 800,
            }}
          >
            {label}
          </Typography>

          <Typography variant="h5" fontWeight={900} lineHeight={1}>
            {value}
          </Typography>

          {subtitle ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.75 }}
            >
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

function UsersTableLoading() {
  return (
    <Box>
      <Box
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.5fr 220px 160px auto" },
              gap: 2,
            }}
          >
            <LoadingBlock height={40} radius={999} />
            <LoadingBlock height={40} radius={999} />
            <LoadingBlock height={40} radius={999} />
            <LoadingBlock height={40} radius={999} />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4, minmax(0, 1fr))" },
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
                <Box mt={1} />
                <LoadingBlock height={28} />
                <Box mt={1} />
                <LoadingBlock height={12} />
              </Box>
            ))}
          </Box>
        </Stack>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ p: 2 }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                py: 1.5,
                borderBottom: index < 5 ? "1px solid" : "none",
                borderColor: "divider",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <LoadingBlock height={44} radius={14} />
                <Box minWidth={0} flex={1}>
                  <LoadingBlock height={18} />
                  <Box mt={0.75} />
                  <LoadingBlock height={14} />
                </Box>
                <Box width={100}>
                  <LoadingBlock height={28} radius={999} />
                </Box>
                <Box width={120}>
                  <LoadingBlock height={36} radius={999} />
                </Box>
              </Stack>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

export default function UsersTable({ locale }: Props) {
  const theme = useTheme();
  const { t } = useI18nNs(["users", "common"]);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(20);

  const isDark = theme.palette.mode === "dark";

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return !value || value === key || value === `[${key}]` ? fallback : value;
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPageNumber(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPageNumber(1);
  }, [statusFilter, pageSize]);

  const { users, isLoading, error } = useSuperAdminUsers({
    pageNumber,
    pageSize,
    search: debouncedSearch,
  });

  const safeUsers = useMemo(() => (Array.isArray(users) ? users : []), [users]);

  const filteredUsers = useMemo(() => {
    return safeUsers.filter((user) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return Boolean(user.isActive);
      return !user.isActive;
    });
  }, [safeUsers, statusFilter]);

  const metrics = useMemo(() => {
    const totalOnPage = safeUsers.length;
    const visible = filteredUsers.length;
    const active = safeUsers.filter((user) => Boolean(user.isActive)).length;
    const passive = totalOnPage - active;
    const withRoles = safeUsers.filter(
      (user) => Array.isArray(user.roles) && user.roles.length > 0
    ).length;

    return {
      totalOnPage,
      visible,
      active,
      passive,
      withRoles,
      activeRate: totalOnPage > 0 ? (active / totalOnPage) * 100 : 0,
    };
  }, [filteredUsers, safeUsers]);

  const canGoPrevious = pageNumber > 1;
  const canGoNext = safeUsers.length === pageSize;

  const searchSummary = debouncedSearch
    ? tr("users:list.searchSummary", "Arama sonucu")
    : tr("users:list.defaultSummary", "Mevcut sayfa verisi");

  if (isLoading && safeUsers.length === 0) {
    return <UsersTableLoading />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        {error.message || tr("common:error", "Bir hata oluştu.")}
      </Alert>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.background.paper, isDark ? 0.66 : 0.9),
          backdropFilter: "blur(14px)",
          boxShadow: isDark
            ? "0 16px 36px rgba(0,0,0,0.30)"
            : "0 16px 36px rgba(15,23,42,0.06)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.6fr 220px 160px auto" },
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            fullWidth
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={tr(
              "users:list.searchPlaceholder",
              "Ad, kullanıcı adı, e-posta, telefon veya rol ara"
            )}
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
                bgcolor: alpha(theme.palette.background.default, isDark ? 0.42 : 0.58),
              },
            }}
          />

          <FormControl size="small" fullWidth>
            <InputLabel>{tr("users:list.filters.status", "Durum")}</InputLabel>
            <Select
              label={tr("users:list.filters.status", "Durum")}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              sx={{
                borderRadius: 999,
                bgcolor: alpha(theme.palette.background.default, isDark ? 0.42 : 0.58),
              }}
            >
              <MenuItem value="all">{tr("common:all", "Tümü")}</MenuItem>
              <MenuItem value="active">{tr("users:status.active", "Aktif")}</MenuItem>
              <MenuItem value="passive">{tr("users:status.passive", "Pasif")}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>{tr("users:list.filters.pageSize", "Sayfa Boyutu")}</InputLabel>
            <Select
              label={tr("users:list.filters.pageSize", "Sayfa Boyutu")}
              value={pageSize}
              onChange={(event) => setPageSize(event.target.value as PageSizeOption)}
              sx={{
                borderRadius: 999,
                bgcolor: alpha(theme.palette.background.default, isDark ? 0.42 : 0.58),
              }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="text"
            onClick={() => {
              setSearchInput("");
              setDebouncedSearch("");
              setStatusFilter("all");
              setPageNumber(1);
              setPageSize(20);
            }}
            sx={{
              borderRadius: 999,
              minHeight: 40,
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            {tr("common:clear", "Temizle")}
          </Button>
        </Box>

        <Box
          sx={{
            mt: 2,
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4, minmax(0, 1fr))" },
            gap: 1.5,
          }}
        >
          <MetricCard
            label={tr("users:list.metrics.pageTotal", "Bu Sayfa")}
            value={metrics.totalOnPage}
            color={theme.palette.primary.main}
            subtitle={searchSummary}
          />
          <MetricCard
            label={tr("users:status.active", "Aktif")}
            value={metrics.active}
            color={theme.palette.success.main}
            subtitle={`${metrics.activeRate.toFixed(0)}%`}
          />
          <MetricCard
            label={tr("users:status.passive", "Pasif")}
            value={metrics.passive}
            color={theme.palette.warning.main}
            subtitle={tr("users:list.metrics.passiveHint", "Bu sayfadaki pasif kayıtlar")}
          />
          <MetricCard
            label={tr("users:list.metrics.roles", "Rollü")}
            value={metrics.withRoles}
            color={theme.palette.info.main}
            subtitle={tr("users:list.metrics.rolesHint", "En az bir role sahip")}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              {tr("users:list.metrics.activeDistribution", "Aktif Kullanıcı Oranı")}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              {metrics.active}/{metrics.totalOnPage}
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={metrics.activeRate}
            color="success"
            sx={{ mt: 0.75, height: 8, borderRadius: 999 }}
          />
        </Box>
      </Box>

      {!safeUsers.length ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          {tr("users:list.empty", "Gösterilecek kullanıcı bulunamadı.")}
        </Alert>
      ) : !filteredUsers.length ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          {tr("users:list.noFilterResult", "Filtreye uygun kullanıcı bulunamadı.")}
        </Alert>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.background.paper, isDark ? 0.66 : 0.94),
            backdropFilter: "blur(14px)",
            boxShadow: isDark
              ? "0 18px 40px rgba(0,0,0,0.32)"
              : "0 18px 40px rgba(15,23,42,0.08)",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              background: alpha(theme.palette.background.default, isDark ? 0.30 : 0.55),
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={900}>
                  {tr("users:list.tableTitle", "Kullanıcı Kayıtları")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tr(
                    "users:list.tableSubtitle",
                    "Server-side arama ve sayfalama ile güncellenen kullanıcı listesi"
                  )}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${tr("users:list.filtered", "Görünen")}: ${filteredUsers.length}`}
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${tr("users:list.page", "Sayfa")}: ${pageNumber}`}
                  sx={{ fontWeight: 800 }}
                />
              </Stack>
            </Stack>
          </Box>

          {isLoading ? <LinearProgress /> : null}

          <TableContainer sx={{ maxHeight: 720 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      bgcolor: alpha(theme.palette.background.paper, isDark ? 0.92 : 0.98),
                      fontWeight: 900,
                    }}
                  >
                    {tr("users:list.columns.fullName", "Ad Soyad")}
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: alpha(theme.palette.background.paper, isDark ? 0.92 : 0.98),
                      fontWeight: 900,
                    }}
                  >
                    {tr("users:list.columns.userName", "Kullanıcı Adı")}
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: alpha(theme.palette.background.paper, isDark ? 0.92 : 0.98),
                      fontWeight: 900,
                    }}
                  >
                    {tr("users:list.columns.email", "E-posta")}
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: alpha(theme.palette.background.paper, isDark ? 0.92 : 0.98),
                      fontWeight: 900,
                    }}
                  >
                    {tr("users:list.columns.phoneNumber", "Telefon")}
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: alpha(theme.palette.background.paper, isDark ? 0.92 : 0.98),
                      fontWeight: 900,
                    }}
                  >
                    {tr("users:list.columns.status", "Durum")}
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: alpha(theme.palette.background.paper, isDark ? 0.92 : 0.98),
                      fontWeight: 900,
                    }}
                  >
                    {tr("users:list.columns.roles", "Roller")}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      bgcolor: alpha(theme.palette.background.paper, isDark ? 0.92 : 0.98),
                      fontWeight: 900,
                    }}
                  >
                    {tr("common:actions", "İşlemler")}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredUsers.map((user) => {
                  const fullName =
                    user.fullName?.trim() ||
                    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                    "-";

                  const initials =
                    fullName && fullName !== "-"
                      ? fullName
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase())
                          .join("")
                      : "U";

                  const roles = Array.isArray(user.roles) ? user.roles : [];
                  const primaryRole = roles[0] || "-";
                  const extraRoleCount = roles.length > 1 ? roles.length - 1 : 0;

                  return (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{
                        "& td": {
                          borderColor: alpha(theme.palette.divider, isDark ? 0.42 : 0.82),
                        },
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.04),
                        },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
                          <Avatar
                            sx={{
                              width: 42,
                              height: 42,
                              fontWeight: 800,
                              bgcolor: alpha(theme.palette.primary.main, 0.14),
                              color: "primary.main",
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                            }}
                          >
                            {initials}
                          </Avatar>

                          <Box minWidth={0}>
                            <Typography variant="subtitle2" fontWeight={800} noWrap>
                              {fullName}
                            </Typography>
                            <Stack direction="row" spacing={0.75} alignItems="center" mt={0.25}>
                              <IconUser size={14} />
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {user.id}
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {user.userName || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={0.75} alignItems="center" minWidth={0}>
                          <IconMail size={14} />
                          <Typography variant="body2" noWrap>
                            {user.email || "-"}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <IconPhone size={14} />
                          <Typography variant="body2">{user.phoneNumber || "-"}</Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            user.isActive
                              ? tr("users:status.active", "Aktif")
                              : tr("users:status.passive", "Pasif")
                          }
                          color={user.isActive ? "success" : "default"}
                          variant={user.isActive ? "filled" : "outlined"}
                          sx={{ fontWeight: 800 }}
                        />
                      </TableCell>

                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                          useFlexGap
                          flexWrap="wrap"
                        >
                          {roles.length ? (
                            <>
                              <Chip
                                size="small"
                                icon={<IconShieldCheck size={14} />}
                                label={primaryRole}
                                color="info"
                                variant="outlined"
                                sx={{ fontWeight: 700, maxWidth: 180 }}
                              />
                              {extraRoleCount > 0 ? (
                                <Chip
                                  size="small"
                                  label={`+${extraRoleCount}`}
                                  variant="outlined"
                                  sx={{ fontWeight: 800 }}
                                />
                              ) : null}
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          component={Link}
                          href={`/${locale}/users/${user.id}`}
                          variant="outlined"
                          size="small"
                          endIcon={<IconChevronRight size={16} />}
                          sx={{
                            borderRadius: 999,
                            fontWeight: 800,
                            minWidth: 104,
                          }}
                        >
                          {tr("common:detail", "Detay")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderTop: "1px solid",
              borderColor: "divider",
              background: alpha(theme.palette.background.default, isDark ? 0.22 : 0.45),
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", md: "center" }}
              justifyContent="space-between"
            >
              <Typography variant="body2" color="text.secondary">
                {debouncedSearch
                  ? `${tr("users:list.pagination.searchLabel", "Arama")}: "${debouncedSearch}"`
                  : tr("users:list.pagination.defaultLabel", "Tüm kayıtlar içinde geziniyorsunuz")}
              </Typography>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<IconChevronLeft size={16} />}
                  disabled={!canGoPrevious || isLoading}
                  onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                  sx={{ borderRadius: 999, fontWeight: 800 }}
                >
                  {tr("common:previous", "Önceki")}
                </Button>

                <Chip
                  label={`${tr("users:list.page", "Sayfa")} ${pageNumber}`}
                  variant="outlined"
                  sx={{ fontWeight: 800 }}
                />

                <Button
                  variant="contained"
                  endIcon={<IconChevronRight size={16} />}
                  disabled={!canGoNext || isLoading}
                  onClick={() => setPageNumber((prev) => prev + 1)}
                  sx={{ borderRadius: 999, fontWeight: 800 }}
                >
                  {tr("common:next", "Sonraki")}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
