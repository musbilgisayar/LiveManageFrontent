// src/modules/permissions/views/RolePermissionMatrixView.tsx

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    alpha,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    InputAdornment,
    MenuItem,
    Paper,
    Stack,
    Switch,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";

import {
    IconArrowLeft,
    IconDeviceFloppy,
    IconFilter,
    IconLock,
    IconSearch,
    IconShieldCheck,
    IconX,
} from "@tabler/icons-react";

import { useI18n } from "@/app/context/i18nContext";
import { useRolePermissionMatrix } from "../hooks/useRolePermissionMatrix";

export default function RolePermissionMatrixView() {
    const theme = useTheme();
    const router = useRouter();
    const { t } = useI18n();

    const {
        roles,
        selectedRoleId,
        setSelectedRoleId,
        selectedRole,
        filters,
        updateFilter,
        resetFilters,
        permissions,
        totalPermissions,
        assignedCount,
        changedCount,
        hasChanges,
        togglePermission,
        resetChanges,
        saveChanges,
        isSaving,
    } = useRolePermissionMatrix();

    const tr = (key: string, fallback: string) => {
        const value = t(key);
        return value === `[${key}]` ? fallback : value;
    };



    return (
        <Box>
            <Paper
                variant="outlined"
                sx={{
                    p: { xs: 2.5, md: 3 },
                    mb: 3,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha(
                        theme.palette.info.main,
                        0.1
                    )} 0%, ${alpha(theme.palette.background.paper, 0.98)} 55%)`,
                }}
            >
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                            sx={{
                                width: 46,
                                height: 46,
                                borderRadius: 3,
                                display: "grid",
                                placeItems: "center",
                                color: theme.palette.info.main,
                                backgroundColor: alpha(theme.palette.info.main, 0.12),
                            }}
                        >
                            <IconShieldCheck size={24} />
                        </Box>

                        <Stack>
                            <Typography variant="h4" sx={{ fontWeight: 900 }}>
                                {tr("permissions:roleMatrix.title", "Rol Permission Matrix")}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                {tr(
                                    "permissions:roleMatrix.subtitle",
                                    "Rollere ait permission atamalarını güvenli ve denetlenebilir şekilde yönetin."
                                )}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<IconArrowLeft size={18} />}
                            onClick={() => router.push("/permissions")}
                        >
                            {tr("permissions:shared.backToDashboard", "Panele Dön")}
                        </Button>

                        <Button
                            variant="text"
                            startIcon={<IconX size={18} />}
                            disabled={!hasChanges || isSaving}
                            onClick={resetChanges}
                        >
                            {tr("permissions:roleMatrix.actions.discard", "Vazgeç")}
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<IconDeviceFloppy size={18} />}
                            disabled={!hasChanges || isSaving}
                            onClick={saveChanges}
                        >
                            {isSaving
                                ? tr("permissions:roleMatrix.actions.saving", "Kaydediliyor...")
                                : changedCount > 0
                                    ? `${tr("permissions:roleMatrix.actions.save", "Değişiklikleri Kaydet")} (${changedCount})`
                                    : tr("permissions:roleMatrix.actions.save", "Değişiklikleri Kaydet")}
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, lg: 3 }}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4 }}>
                        <Stack spacing={2}>
                            <Stack spacing={0.5}>
                                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                    {tr("permissions:roleMatrix.roleSelector.title", "Rol Seçimi")}
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    {tr(
                                        "permissions:roleMatrix.roleSelector.description",
                                        "Permission atamalarını yönetmek istediğiniz rolü seçin."
                                    )}
                                </Typography>
                            </Stack>

                            <TextField
                                select
                                fullWidth
                                size="small"
                                label={tr("permissions:roleMatrix.roleSelector.label", "Rol")}
                                value={selectedRoleId}
                                onChange={(event) => setSelectedRoleId(event.target.value)}
                            >
                                {roles.map((role) => (
                                    <MenuItem key={role.id} value={role.id}>
                                        {role.displayName}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {selectedRole ? (
                                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                    <CardContent>
                                        <Stack spacing={1.25}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                                {selectedRole.displayName}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                {selectedRole.description || "—"}
                                            </Typography>

                                            <Divider />

                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                {selectedRole.isSystemRole ? (
                                                    <Chip
                                                        size="small"
                                                        label={tr(
                                                            "permissions:roleMatrix.roleSelector.systemRole",
                                                            "Sistem Rolü"
                                                        )}
                                                        color="info"
                                                        variant="outlined"
                                                    />
                                                ) : null}

                                                <Chip
                                                    size="small"
                                                    label={`${selectedRole.assignedPermissionCount} permissions`}
                                                />
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ) : null}
                        </Stack>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, lg: 9 }}>
                    <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 4 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <IconFilter size={20} />
                                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                    {tr("permissions:roleMatrix.filters.title", "Matrix Filtreleri")}
                                </Typography>
                            </Stack>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={filters.search}
                                        onChange={(event) =>
                                            updateFilter("search", event.target.value)
                                        }
                                        placeholder={tr(
                                            "permissions:roleMatrix.filters.searchPlaceholder",
                                            "Permission kodu, modül veya aksiyon ara"
                                        )}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconSearch size={18} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        label={tr("permissions:catalog.filters.scope", "Kapsam")}
                                        value={filters.scope}
                                        onChange={(event) =>
                                            updateFilter("scope", event.target.value as typeof filters.scope)
                                        }
                                    >
                                        <MenuItem value="all">{tr("permissions:shared.all", "Tümü")}</MenuItem>
                                        <MenuItem value="self">self</MenuItem>
                                        <MenuItem value="tenant">tenant</MenuItem>
                                        <MenuItem value="global">global</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        label={tr("permissions:catalog.filters.level", "Seviye")}
                                        value={filters.level}
                                        onChange={(event) =>
                                            updateFilter("level", event.target.value as typeof filters.level)
                                        }
                                    >
                                        <MenuItem value="all">{tr("permissions:shared.all", "Tümü")}</MenuItem>
                                        <MenuItem value="1">Level 1</MenuItem>
                                        <MenuItem value="2">Level 2</MenuItem>
                                        <MenuItem value="3">Level 3</MenuItem>
                                        <MenuItem value="4">Level 4</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        label={tr("permissions:catalog.filters.sensitive", "Hassasiyet")}
                                        value={filters.sensitive}
                                        onChange={(event) =>
                                            updateFilter(
                                                "sensitive",
                                                event.target.value as typeof filters.sensitive
                                            )
                                        }
                                    >
                                        <MenuItem value="all">{tr("permissions:shared.all", "Tümü")}</MenuItem>
                                        <MenuItem value="sensitive">
                                            {tr("permissions:catalog.filters.onlySensitive", "Sadece Hassas")}
                                        </MenuItem>
                                        <MenuItem value="normal">
                                            {tr("permissions:catalog.filters.onlyNormal", "Normal")}
                                        </MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        label={tr("permissions:roleMatrix.filters.assignment", "Atama")}
                                        value={filters.assigned}
                                        onChange={(event) =>
                                            updateFilter(
                                                "assigned",
                                                event.target.value as typeof filters.assigned
                                            )
                                        }
                                    >
                                        <MenuItem value="all">{tr("permissions:shared.all", "Tümü")}</MenuItem>
                                        <MenuItem value="assigned">
                                            {tr("permissions:roleMatrix.filters.assigned", "Atanmış")}
                                        </MenuItem>
                                        <MenuItem value="unassigned">
                                            {tr("permissions:roleMatrix.filters.unassigned", "Atanmamış")}
                                        </MenuItem>
                                    </TextField>
                                </Grid>
                            </Grid>

                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                spacing={1}
                            >
                                <Typography variant="body2" color="text.secondary">

                                    {assignedCount} / {totalPermissions}
                                    {hasChanges ? ` • ${changedCount} ${tr("permissions:roleMatrix.changed", "değişiklik")}` : ""}
                                </Typography>

                                <Button
                                    size="small"
                                    variant="text"
                                    startIcon={<IconX size={16} />}
                                    onClick={resetFilters}
                                >
                                    {tr("permissions:shared.clearFilters", "Filtreleri Temizle")}
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>

                    <Stack spacing={1.5}>
                        {permissions.map((item) => {
                            const permission = item.permission;

                            return (
                                <Card
                                    key={permission.code}
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 3,
                                        borderColor: item.assigned
                                            ? alpha(theme.palette.success.main, 0.35)
                                            : undefined,
                                        backgroundColor: item.assigned
                                            ? alpha(theme.palette.success.main, 0.035)
                                            : undefined,
                                    }}
                                >
                                    <CardContent>
                                        <Stack
                                            direction={{ xs: "column", md: "row" }}
                                            spacing={2}
                                            justifyContent="space-between"
                                            alignItems={{ xs: "flex-start", md: "center" }}
                                        >
                                            <Stack spacing={1} sx={{ minWidth: 0 }}>
                                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{
                                                            fontWeight: 900,
                                                            fontFamily: "monospace",
                                                            wordBreak: "break-word",
                                                        }}
                                                    >
                                                        {permission.code}
                                                    </Typography>

                                                    {item.locked ? (
                                                        <Chip
                                                            size="small"
                                                            icon={<IconLock size={14} />}
                                                            label={tr("permissions:roleMatrix.locked", "Kilitli")}
                                                            variant="outlined"
                                                        />
                                                    ) : null}
                                                </Stack>

                                                <Typography variant="body2" color="text.secondary">
                                                    {permission.descriptionKey
                                                        ? tr(
                                                            permission.descriptionKey,
                                                            permission.fallbackDescription || "—"
                                                        )
                                                        : permission.fallbackDescription || "—"}
                                                </Typography>

                                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                    <Chip size="small" label={permission.module} />
                                                    <Chip size="small" label={permission.scope} variant="outlined" />
                                                    <Chip size="small" label={`Level ${permission.level}`} />
                                                    {permission.isSensitive ? (
                                                        <Chip
                                                            size="small"
                                                            color="warning"
                                                            variant="outlined"
                                                            label={tr("permissions:shared.sensitive", "Hassas")}
                                                        />
                                                    ) : null}
                                                </Stack>
                                            </Stack>

                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.assigned
                                                        ? tr("permissions:roleMatrix.assigned", "Atanmış")
                                                        : tr("permissions:roleMatrix.unassigned", "Atanmamış")}
                                                </Typography>

                                                <Switch
                                                    checked={item.assigned}
                                                    disabled={item.locked}
                                                    onChange={() => togglePermission(permission.code)}
                                                />
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}