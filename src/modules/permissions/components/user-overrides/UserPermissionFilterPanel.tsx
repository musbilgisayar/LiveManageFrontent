"use client";

import {
  alpha,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Clear as ClearIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  GridView as GridViewIcon,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18nNs } from "@/app/context/i18nContext";
import type { UserPermissionFilters } from "../../types/UserPermissionOverride.types";

const FILTER_ALL = "all" as const;

const SCOPE_OPTIONS = {
  self: "self",
  tenant: "tenant",
  global: "global",
} as const;

type ScopeValue = (typeof SCOPE_OPTIONS)[keyof typeof SCOPE_OPTIONS];

const SOURCE_OPTIONS = {
  direct: "direct",
  role: "role",
  effective: "effective",
  missing: "missing",
} as const;

type SourceValue = (typeof SOURCE_OPTIONS)[keyof typeof SOURCE_OPTIONS];

interface ModuleOption {
  id: string;
  label: string;
  disabled?: boolean;
}

interface Props {
  modules: ModuleOption[] | string[];
  filters: UserPermissionFilters;
  onChange: (filters: UserPermissionFilters) => void;
  isLoading?: boolean;
  onFilterCountChange?: (count: number) => void;
}

const normalizeModules = (modules: ModuleOption[] | string[]): ModuleOption[] => {
  if (modules.length === 0) return [];

  if (typeof modules[0] === "string") {
    return (modules as string[]).map((id) => ({ id, label: id }));
  }

  return modules as ModuleOption[];
};

export default function UserPermissionFilterPanel({
  modules,
  filters,
  onChange,
  isLoading = false,
  onFilterCountChange,
}: Props) {
  const { t } = useI18nNs(["permission", "common"]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";

  const [localSearch, setLocalSearch] = useState(filters.search ?? "");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tr = useCallback(
    (key: string, fallback: string): string => {
      const value = t(key);
      return !value || value === key || value === `[${key}]` ? fallback : value;
    },
    [t]
  );

  const normalizedModules = useMemo(() => normalizeModules(modules), [modules]);

  useEffect(() => {
    setLocalSearch(filters.search ?? "");
  }, [filters.search]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.search?.trim()) count += 1;
    if (filters.module !== FILTER_ALL) count += 1;
    if (filters.scope !== FILTER_ALL) count += 1;
    if (filters.source !== FILTER_ALL) count += 1;
    if (filters.level !== FILTER_ALL) count += 1;

    return count;
  }, [filters]);

  useEffect(() => {
    onFilterCountChange?.(activeFilterCount);
  }, [activeFilterCount, onFilterCountChange]);

  const patch = useCallback(
    (value: Partial<UserPermissionFilters>) => {
      onChange({
        ...filters,
        ...value,
      });
    },
    [filters, onChange]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }

      searchTimerRef.current = setTimeout(() => {
        patch({ search: value });
      }, 300);
    },
    [patch]
  );

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearch(value);
    handleSearchChange(value);
  };

  const handleClearSearch = () => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    setLocalSearch("");
    patch({ search: "" });
  };

  const handleModuleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    patch({ module: event.target.value });
  };

  const handleScopeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (
      value === FILTER_ALL ||
      Object.values(SCOPE_OPTIONS).includes(value as ScopeValue)
    ) {
      patch({ scope: value });
    }
  };

  const handleSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (
      value === FILTER_ALL ||
      Object.values(SOURCE_OPTIONS).includes(value as SourceValue)
    ) {
      patch({ source: value as UserPermissionFilters["source"] });
    }
  };

  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    value: UserPermissionFilters["viewMode"] | null
  ) => {
    if (value === "table" || value === "grid") {
      patch({ viewMode: value });
    }
  };

  const handleClearAll = () => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    setLocalSearch("");

    onChange({
      search: "",
      module: FILTER_ALL,
      scope: FILTER_ALL,
      source: FILTER_ALL,
      level: FILTER_ALL,
      viewMode: filters.viewMode,
    });
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, isDark ? 0.45 : 0.85),
        bgcolor: alpha(theme.palette.background.paper, isDark ? 0.68 : 0.96),
        boxShadow: isDark
          ? "0 14px 34px rgba(0,0,0,0.22)"
          : "0 14px 34px rgba(15,23,42,0.06)",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.25 } }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Box minWidth={0}>
              <Typography variant="subtitle2" fontWeight={900}>
                {tr("permission:userOverrides.filters.title", "Filtreler")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tr(
                  "permission:userOverrides.filters.subtitle",
                  "Permission kataloğunu arayın, modül ve kaynak bilgisine göre daraltın."
                )}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
              alignItems="center"
              useFlexGap
              flexWrap="wrap"
            >
              <Chip
                size="small"
                icon={<FilterIcon fontSize="small" />}
                label={`${activeFilterCount} ${tr(
                  "permission:userOverrides.filters.active",
                  "aktif filtre"
                )}`}
                color={activeFilterCount > 0 ? "primary" : "default"}
                variant={activeFilterCount > 0 ? "filled" : "outlined"}
                sx={{ fontWeight: 800 }}
              />

              {isLoading && (
                <Chip
                  size="small"
                  label={tr("common:loading", "Yükleniyor...")}
                  variant="outlined"
                  sx={{ fontWeight: 800 }}
                />
              )}
            </Stack>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(280px, 1.55fr) minmax(160px, 0.8fr) minmax(140px, 0.65fr) minmax(150px, 0.7fr)",
              },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              size="small"
              label={tr("permission:userOverrides.filters.search", "Permission ara")}
              placeholder={tr(
                "permission:userOverrides.filters.searchPlaceholder",
                "Permission adı, açıklama veya modül ara"
              )}
              value={localSearch}
              onChange={handleSearchInputChange}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: localSearch ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      edge="end"
                      aria-label={tr("common:clear", "Temizle")}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.background.default, isDark ? 0.38 : 0.58),
                },
              }}
            />

            <TextField
              fullWidth
              select
              size="small"
              label={tr("permission:userOverrides.filters.module", "Modül")}
              value={filters.module}
              onChange={handleModuleChange}
              disabled={isLoading}
              SelectProps={{
                displayEmpty: true,
                renderValue: (value: unknown) => {
                  const selectedValue = String(value);

                  if (selectedValue === FILTER_ALL) {
                    return tr("common:all", "Tümü");
                  }

                  const selectedModule = normalizedModules.find(
                    (module) => module.id === selectedValue
                  );

                  return selectedModule?.label ?? selectedValue;
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.background.default, isDark ? 0.38 : 0.58),
                },
              }}
            >
              <MenuItem value={FILTER_ALL}>
                {tr("common:all", "Tümü")}
              </MenuItem>

              {normalizedModules.map((module) => (
                <MenuItem
                  key={module.id}
                  value={module.id}
                  disabled={module.disabled}
                >
                  {module.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              size="small"
              label={tr("permission:userOverrides.filters.scope", "Scope")}
              value={filters.scope}
              onChange={handleScopeChange}
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.background.default, isDark ? 0.38 : 0.58),
                },
              }}
            >
              <MenuItem value={FILTER_ALL}>{tr("common:all", "Tümü")}</MenuItem>
              <MenuItem value={SCOPE_OPTIONS.self}>
                {tr("permission:userOverrides.scope.self", "Self")}
              </MenuItem>
              <MenuItem value={SCOPE_OPTIONS.tenant}>
                {tr("permission:userOverrides.scope.tenant", "Tenant")}
              </MenuItem>
              <MenuItem value={SCOPE_OPTIONS.global}>
                {tr("permission:userOverrides.scope.global", "Global")}
              </MenuItem>
            </TextField>

            <TextField
              fullWidth
              select
              size="small"
              label={tr("permission:userOverrides.filters.source", "Kaynak")}
              value={filters.source}
              onChange={handleSourceChange}
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.background.default, isDark ? 0.38 : 0.58),
                },
              }}
            >
              <MenuItem value={FILTER_ALL}>{tr("common:all", "Tümü")}</MenuItem>
              <MenuItem value={SOURCE_OPTIONS.direct}>
                {tr("permission:userOverrides.source.direct", "Direct")}
              </MenuItem>
              <MenuItem value={SOURCE_OPTIONS.role}>
                {tr("permission:userOverrides.source.role", "Rol Kaynaklı")}
              </MenuItem>
              <MenuItem value={SOURCE_OPTIONS.effective}>
                {tr("permission:userOverrides.source.effective", "Effective")}
              </MenuItem>
              <MenuItem value={SOURCE_OPTIONS.missing}>
                {tr("permission:userOverrides.source.missing", "Eksik")}
              </MenuItem>
              <Typography variant="caption" color="text.secondary">
              {tr(
                "permission:userOverrides.filters.hint",
                "Arama permission adı, modül ve açıklama alanlarında çalışır."
              )}
            </Typography>
            </TextField>
          </Box>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="flex-end"
            >
              <Tooltip
                title={tr(
                  "permission:userOverrides.filters.activeFilters",
                  `${activeFilterCount} aktif filtre`
                )}
              >
                <Badge
                  badgeContent={activeFilterCount}
                  color="primary"
                  sx={{ width: isMobile ? "100%" : "auto" }}
                >
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={filters.viewMode}
                    onChange={handleViewModeChange}
                    aria-label={tr("permission:userOverrides.view.label", "Görünüm")}
                    sx={{
                      width: isMobile ? "100%" : "auto",
                      "& .MuiToggleButton-root": {
                        px: 1.5,
                        fontWeight: 800,
                        borderRadius: "999px !important",
                      },
                    }}
                  >
        

                  </ToggleButtonGroup>
                </Badge>
              </Tooltip>

              {activeFilterCount > 0 && (
                <Button
                  startIcon={<ClearIcon />}
                  onClick={handleClearAll}
                  disabled={isLoading}
                  size="small"
                  variant="outlined"
                  color="inherit"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 800,
                    minHeight: 36,
                    flexShrink: 0,
                  }}
                >
                  {tr("common:clear", "Temizle")}
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}