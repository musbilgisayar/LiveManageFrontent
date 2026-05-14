// File: src/modules/permissions/components/user-overrides/UserPermissionUserPicker.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  alpha,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconAlertTriangle,
  IconMail,
  IconPhone,
  IconSearch,
  IconShieldCheck,
  IconUser,
  IconUserCheck,
  IconUserShield,
  IconX,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";
import type { PermissionUserLookupItemDto } from "../../types/PermissionUserLookup.types";

interface Props {
  users: PermissionUserLookupItemDto[];
  selectedUser: PermissionUserLookupItemDto | null;
  userSearch: string;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onSearch: (value: string) => void;
  onChange: (user: PermissionUserLookupItemDto | null) => void;
}

function normalize(value?: string | null): string {
  return value?.trim() ?? "";
}

function getDisplayName(user: PermissionUserLookupItemDto): string {
  return (
    normalize(user.fullName) ||
    normalize(user.userName) ||
    normalize(user.email) ||
    normalize(user.phoneNumber) ||
    user.id
  );
}

function getInitials(user: PermissionUserLookupItemDto): string {
  return getDisplayName(user)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getMetaLine(user: PermissionUserLookupItemDto): string {
  const parts = [
    normalize(user.email),
    normalize(user.userName) ? `@${normalize(user.userName)}` : "",
    normalize(user.phoneNumber),
  ].filter(Boolean);

  return parts.length ? parts.join(" • ") : user.id;
}

function buildSearchIndex(user: PermissionUserLookupItemDto): string {
  return [
    normalize(user.fullName),
    normalize(user.userName),
    normalize(user.email),
    normalize(user.phoneNumber),
    normalize(user.id),
  ]
    .join(" ")
    .toLocaleLowerCase("tr");
}

function dedupeUsers(users: PermissionUserLookupItemDto[]): PermissionUserLookupItemDto[] {
  const map = new Map<string, PermissionUserLookupItemDto>();

  for (const user of users) {
    if (!map.has(user.id)) {
      map.set(user.id, user);
    }
  }

  return Array.from(map.values());
}

export default function UserPermissionUserPicker({
  users,
  selectedUser,
  userSearch,
  loading,
  onSearchChange,
  onSearch,
  onChange,
}: Props) {
  const theme = useTheme();
  const { t } = useI18nNs(["permission", "users", "common"]);
  const isDark = theme.palette.mode === "dark";

  const [searchInput, setSearchInput] = useState(userSearch ?? "");
  const [open, setOpen] = useState(false);

  const skipNextSearchRef = useRef(false);
  const lastEmittedSearchRef = useRef<string>("");

  const tr = (key: string, fallback: string): string => {
    const value = t(key);
    return !value || value === key || value === `[${key}]` ? fallback : value;
  };

  const safeUsers = useMemo(() => (Array.isArray(users) ? users : []), [users]);

  const filteredUsers = useMemo(() => {
    const term = searchInput.trim().toLocaleLowerCase("tr");

    if (!term) {
      return safeUsers.slice(0, 8);
    }

    return safeUsers
      .filter((user) => buildSearchIndex(user).includes(term))
      .slice(0, 12);
  }, [safeUsers, searchInput]);

  const autocompleteOptions = useMemo(() => {
    const merged = selectedUser
      ? dedupeUsers([selectedUser, ...filteredUsers])
      : filteredUsers;

    return merged;
  }, [filteredUsers, selectedUser]);

  const visibleUsers = autocompleteOptions;
  const showInlineResults = !open;

useEffect(() => {
  if (selectedUser) {
    const selectedName = getDisplayName(selectedUser);
    setSearchInput((prev) => (prev === selectedName ? prev : selectedName));
    return;
  }


  const nextValue = userSearch ?? "";
  setSearchInput((prev) => (prev === nextValue ? prev : nextValue));
}, [selectedUser, userSearch]);
  useEffect(() => {
    const trimmed = searchInput.trim();

    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      if (lastEmittedSearchRef.current === trimmed) return;
      lastEmittedSearchRef.current = trimmed;
      onSearchChange(trimmed);
      onSearch(trimmed);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput, onSearch, onSearchChange]);

  const clearSelection = () => {
    skipNextSearchRef.current = false;
    lastEmittedSearchRef.current = "";
    setSearchInput("");
    setOpen(false);
    onChange(null);
    onSearchChange("");
    onSearch("");
  };

  const selectUser = (user: PermissionUserLookupItemDto) => {
    skipNextSearchRef.current = true;
    setSearchInput(getDisplayName(user));
    setOpen(false);
    onChange(user);
  };

  const emptyStateText = loading
    ? tr("common:loading", "Yükleniyor...")
    : searchInput.trim()
      ? tr(
          "permission:userOverrides.userPicker.noResults",
          "Eşleşen kullanıcı bulunamadı."
        )
      : tr(
          "permission:userOverrides.userPicker.startTyping",
          "Aramaya başlamak için yazın."
        );

  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, isDark ? 0.65 : 1),
        bgcolor: alpha(theme.palette.background.paper, isDark ? 0.74 : 0.98),
        backdropFilter: "blur(18px)",
        boxShadow: isDark
          ? "0 22px 48px rgba(0,0,0,0.34)"
          : "0 20px 46px rgba(15,23,42,0.08)",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 2.5 },
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            isDark ? 0.16 : 0.08
          )} 0%, ${alpha(theme.palette.background.default, isDark ? 0.42 : 0.7)} 100%)`,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.24 : 0.12),
                color: "primary.main",
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <IconUserShield size={18} />
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight={900}>
                {tr("permission:userOverrides.userPicker.title", "Kullanıcı Seç")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tr(
                  "permission:userOverrides.userPicker.subtitle",
                  "Direct permission uygulanacak kullanıcıyı arayın ve seçin."
                )}
              </Typography>
            </Box>
          </Stack>

          <Chip
            size="small"
            variant="outlined"
            label={`${visibleUsers.length}/${safeUsers.length} sonuç`}
            sx={{ fontWeight: 800, borderRadius: 999 }}
          />
        </Stack>
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
            gap: 2,
            alignItems: "stretch",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: alpha(theme.palette.divider, isDark ? 0.55 : 1),
              bgcolor: alpha(theme.palette.background.default, isDark ? 0.22 : 0.5),
              minHeight: { xs: 360, md: 420 },
            }}
          >
            <Stack spacing={1.5}>
              <Autocomplete<PermissionUserLookupItemDto, false, false, false>
                fullWidth
                disablePortal
                open={open}
                onOpen={() => setOpen(true)}
                onClose={(_, reason) => {
                  if (reason !== "toggleInput") {
                    setOpen(false);
                  }
                }}
                openOnFocus
                autoHighlight
                selectOnFocus
                clearOnBlur={false}
                handleHomeEndKeys
                options={autocompleteOptions}
                value={selectedUser}
                loading={loading}
                inputValue={searchInput}
                filterOptions={(x) => x}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => getDisplayName(option)}
                onInputChange={(_, value, reason) => {
                  if (reason === "reset") return;

                  if (reason === "clear") {
                    clearSelection();
                    return;
                  }

                  setSearchInput(value);

                  if (!open) {
                    setOpen(true);
                  }

                  if (selectedUser && value !== getDisplayName(selectedUser)) {
                    onChange(null);
                  }
                }}
                onChange={(_, value) => {
                  if (value) {
                    selectUser(value);
                    return;
                  }

                  clearSelection();
                }}
                loadingText={tr("common:loading", "Yükleniyor...")}
                noOptionsText={emptyStateText}
                slotProps={{
                  paper: {
                    elevation: 10,
                    sx: {
                      mt: 1,
                      borderRadius: 2.5,
                      border: "1px solid",
                      borderColor: alpha(theme.palette.divider, isDark ? 0.5 : 1),
                      boxShadow: isDark
                        ? "0 20px 40px rgba(0,0,0,0.35)"
                        : "0 18px 36px rgba(15,23,42,0.14)",
                      overflow: "hidden",
                    },
                  },
                  popper: {
                    sx: {
                      zIndex: theme.zIndex.modal - 1,
                    },
                  },
                }}
                ListboxProps={{
                  sx: {
                    p: 1,
                    maxHeight: 280,
                    overflowY: "auto",
                    "& .MuiAutocomplete-option": {
                      alignItems: "stretch",
                      borderRadius: 2,
                      mb: 0.5,
                      px: 0.75,
                      py: 0.5,
                    },
                    "& .MuiAutocomplete-option:last-of-type": {
                      mb: 0,
                    },
                    "& .MuiAutocomplete-option[aria-selected='true']": {
                      bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1),
                    },
                    "& .MuiAutocomplete-option.Mui-focused": {
                      bgcolor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08),
                    },
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label={tr(
                      "permission:userOverrides.userPicker.searchLabel",
                      "Kullanıcı ara"
                    )}
                    placeholder="Ad, kullanıcı adı, e-posta veya telefon ara"
                    onClick={() => setOpen(true)}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSearch size={18} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {loading ? (
                            <CircularProgress color="inherit" size={18} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 999,
                        bgcolor: alpha(
                          theme.palette.background.paper,
                          isDark ? 0.55 : 0.96
                        ),
                        transition: "all 160ms ease",
                        "&.Mui-focused": {
                          boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.12)}`,
                        },
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const isSelected = selectedUser?.id === option.id;

                  return (
                    <Box component="li" {...props} key={option.id}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        width="100%"
                        minWidth={0}
                        sx={{
                          px: 0.5,
                          py: 0.5,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: isSelected
                            ? alpha(theme.palette.primary.main, 0.4)
                            : "transparent",
                          bgcolor: isSelected
                            ? alpha(theme.palette.primary.main, isDark ? 0.14 : 0.07)
                            : "transparent",
                        }}
                      >
                        <Avatar
                          src={normalize(option.avatarUrl) || undefined}
                          sx={{
                            width: 40,
                            height: 40,
                            fontWeight: 900,
                            bgcolor: alpha(theme.palette.primary.main, 0.14),
                            color: "primary.main",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(option) || <IconUser size={18} />}
                        </Avatar>

                        <Box minWidth={0} flex={1}>
                          <Typography variant="body2" fontWeight={850} noWrap>
                            {getDisplayName(option)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {getMetaLine(option)}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={
                            isSelected
                              ? "Seçili"
                              : option.isActive
                                ? tr("users:status.active", "Aktif")
                                : tr("users:status.passive", "Pasif")
                          }
                          color={
                            isSelected
                              ? "primary"
                              : option.isActive
                                ? "success"
                                : "default"
                          }
                          variant={isSelected || option.isActive ? "filled" : "outlined"}
                          sx={{ fontWeight: 800, flexShrink: 0, borderRadius: 999 }}
                        />
                      </Stack>
                    </Box>
                  );
                }}
              />

              <Typography variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
                {tr(
                  "permission:userOverrides.userPicker.helper",
                  "Kullanıcı seçildikten sonra direct permission özeti ve katalog alanı yüklenir."
                )}
              </Typography>

              <Divider />

              {showInlineResults && (
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography variant="subtitle2" fontWeight={900}>
                      Arama sonuçları
                    </Typography>

                    {loading ? (
                      <Chip
                        size="small"
                        label={tr("common:loading", "Yükleniyor...")}
                        variant="outlined"
                        sx={{ fontWeight: 800, borderRadius: 999 }}
                      />
                    ) : (
                      <Chip
                        size="small"
                        label={`${visibleUsers.length} kayıt`}
                        variant="outlined"
                        sx={{ fontWeight: 800, borderRadius: 999 }}
                      />
                    )}
                  </Stack>

                  {visibleUsers.length === 0 ? (
                    <Box
                      sx={{
                        p: 2.25,
                        borderRadius: 2.5,
                        border: "1px dashed",
                        borderColor: alpha(theme.palette.divider, isDark ? 0.65 : 1),
                        bgcolor: alpha(theme.palette.background.paper, isDark ? 0.2 : 0.7),
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {searchInput.trim()
                          ? "Bu arama ile eşleşen kullanıcı bulunamadı."
                          : "Kullanıcı aramak için yukarıdaki alanı kullanın."}
                      </Typography>
                    </Box>
                  ) : (
                    <Stack
                      spacing={0.9}
                      sx={{
                        maxHeight: 260,
                        overflowY: "auto",
                        pr: 0.5,
                      }}
                    >
                      {visibleUsers.map((user) => {
                        const isSelected = selectedUser?.id === user.id;

                        return (
                          <Box
                            key={user.id}
                            onClick={() => selectUser(user)}
                            sx={{
                              p: 1.15,
                              borderRadius: 2.5,
                              border: "1px solid",
                              borderColor: isSelected
                                ? alpha(theme.palette.primary.main, 0.55)
                                : alpha(theme.palette.divider, isDark ? 0.45 : 1),
                              bgcolor: isSelected
                                ? alpha(theme.palette.primary.main, isDark ? 0.18 : 0.08)
                                : alpha(theme.palette.background.paper, isDark ? 0.26 : 0.84),
                              cursor: "pointer",
                              transition: "all 160ms ease",
                              "&:hover": {
                                borderColor: alpha(theme.palette.primary.main, 0.45),
                                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.055),
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
                              <Avatar
                                src={normalize(user.avatarUrl) || undefined}
                                sx={{
                                  width: 38,
                                  height: 38,
                                  fontSize: 13,
                                  fontWeight: 900,
                                  bgcolor: alpha(theme.palette.primary.main, 0.13),
                                  color: "primary.main",
                                  flexShrink: 0,
                                }}
                              >
                                {getInitials(user) || <IconUser size={16} />}
                              </Avatar>

                              <Box minWidth={0} flex={1}>
                                <Typography variant="body2" fontWeight={850} noWrap>
                                  {getDisplayName(user)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {getMetaLine(user)}
                                </Typography>
                              </Box>

                              {isSelected ? (
                                <Chip
                                  size="small"
                                  label="Seçili"
                                  color="primary"
                                  sx={{ fontWeight: 800, flexShrink: 0, borderRadius: 999 }}
                                />
                              ) : (
                                <Chip
                                  size="small"
                                  label={user.isActive ? "Aktif" : "Pasif"}
                                  variant="outlined"
                                  color={user.isActive ? "success" : "default"}
                                  sx={{ fontWeight: 800, flexShrink: 0, borderRadius: 999 }}
                                />
                              )}
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </Stack>
              )}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: selectedUser
                ? alpha(theme.palette.primary.main, 0.3)
                : alpha(theme.palette.divider, isDark ? 0.55 : 1),
              bgcolor: selectedUser
                ? alpha(theme.palette.primary.main, isDark ? 0.1 : 0.045)
                : alpha(theme.palette.background.default, isDark ? 0.22 : 0.42),
              minHeight: { xs: 320, md: 420 },
            }}
          >
            {!selectedUser ? (
              <Stack spacing={2} sx={{ height: "100%" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: "primary.main",
                    }}
                  >
                    <IconUserShield size={23} />
                  </Avatar>

                  <Box>
                    <Typography variant="subtitle1" fontWeight={900}>
                      Kullanıcı seçilmedi
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sol panelden kullanıcı seçerek override işlemini başlatın.
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack spacing={1.25}>
                  {[
                    {
                      icon: <IconUserCheck size={17} />,
                      title: "Kullanıcı seçimi",
                      text: "Direct permission sadece seçili kullanıcıya uygulanır.",
                    },
                    {
                      icon: <IconShieldCheck size={17} />,
                      title: "Role permission etkilenmez",
                      text: "Rol kaynaklı permissionlar bu işlemle değişmez.",
                    },
                    {
                      icon: <IconAlertTriangle size={17} />,
                      title: "Audit izlenebilirliği",
                      text: "Atama ve kaldırma işlemleri güvenlik/audit kayıtlarına düşer.",
                    },
                  ].map((item) => (
                    <Box
                      key={item.title}
                      sx={{
                        p: 1.35,
                        borderRadius: 2.25,
                        bgcolor: alpha(theme.palette.background.paper, isDark ? 0.26 : 0.7),
                        border: "1px solid",
                        borderColor: alpha(theme.palette.divider, isDark ? 0.45 : 1),
                      }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="flex-start">
                        <Box sx={{ color: "primary.main", display: "flex", mt: 0.2 }}>
                          {item.icon}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={850}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.text}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={1.75}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    src={normalize(selectedUser.avatarUrl) || undefined}
                    sx={{
                      width: 60,
                      height: 60,
                      fontWeight: 900,
                      fontSize: 22,
                      bgcolor: alpha(theme.palette.primary.main, 0.14),
                      color: "primary.main",
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(selectedUser) || <IconUser size={23} />}
                  </Avatar>

                  <Box minWidth={0} flex={1}>
                    <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
                      <Typography variant="subtitle1" fontWeight={900} noWrap>
                        {getDisplayName(selectedUser)}
                      </Typography>

                      <Chip
                        size="small"
                        label={
                          selectedUser.isActive
                            ? tr("users:status.active", "Aktif")
                            : tr("users:status.passive", "Pasif")
                        }
                        color={selectedUser.isActive ? "success" : "default"}
                        variant={selectedUser.isActive ? "filled" : "outlined"}
                        sx={{ fontWeight: 800, flexShrink: 0, borderRadius: 999 }}
                      />
                    </Stack>

                    <Typography variant="body2" color="text.secondary" noWrap>
                      Seçili kullanıcı kimliği doğrulandı.
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack spacing={0.5}>
                  {normalize(selectedUser.fullName) && (
                    <InfoRow
                      icon={<IconUser size={17} />}
                      label="Ad Soyad"
                      value={normalize(selectedUser.fullName)}
                    />
                  )}

                  {normalize(selectedUser.email) && (
                    <InfoRow
                      icon={<IconMail size={17} />}
                      label="E-posta"
                      value={normalize(selectedUser.email)}
                    />
                  )}

                  {normalize(selectedUser.userName) && (
                    <InfoRow
                      icon={<IconShieldCheck size={17} />}
                      label="Kullanıcı Adı"
                      value={`@${normalize(selectedUser.userName)}`}
                    />
                  )}

                  {normalize(selectedUser.phoneNumber) && (
                    <InfoRow
                      icon={<IconPhone size={17} />}
                      label="Telefon"
                      value={normalize(selectedUser.phoneNumber)}
                    />
                  )}
                </Stack>

                <Box
                  sx={{
                    p: 1.4,
                    borderRadius: 2.25,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.warning.main, 0.28),
                    bgcolor: alpha(theme.palette.warning.main, isDark ? 0.1 : 0.055),
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <Box sx={{ color: "warning.main", display: "flex", mt: 0.2 }}>
                      <IconAlertTriangle size={17} />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={850}>
                        Direct permission dikkat gerektirir
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Bu işlem kullanıcıya özel yetki davranışı oluşturur ve audit kaydı üretir.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<IconX size={16} />}
                    onClick={clearSelection}
                    sx={{
                      borderRadius: 999,
                      fontWeight: 800,
                    }}
                  >
                    {tr("common:clear", "Temizle")}
                  </Button>
                </Stack>
              </Stack>
            )}
          </Paper>
        </Box>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        py: 1.05,
        px: 0.5,
        borderBottom: "1px solid",
        borderColor: alpha(theme.palette.divider, isDark ? 0.35 : 0.75),
        "&:last-of-type": {
          borderBottom: "none",
        },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            color: "primary.main",
            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.08),
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box minWidth={0}>
          <Typography variant="caption" color="text.secondary" fontWeight={800}>
            {label}
          </Typography>
          <Typography variant="body2" fontWeight={850} noWrap>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}