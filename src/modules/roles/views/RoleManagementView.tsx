"use client";

import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Paper,
    Stack,
    Typography,
    alpha,
    useTheme,
} from "@mui/material";
import { IconRefresh, IconShieldLock, IconUserCog } from "@tabler/icons-react";
import { useParams } from "next/navigation";

import { useI18nNs } from "@/app/context/i18nContext";
import { RoleDeleteDialog } from "@/modules/roles/components/RoleDeleteDialog";
import RoleEditDialog from "@/modules/roles/components/RoleEditDialog";
import { RoleFormDialog } from "@/modules/roles/components/RoleFormDialog";
import RoleList from "@/modules/roles/components/RoleList";
import { RoleToolbar } from "@/modules/roles/components/RoleToolbar";
import { useRoles } from "@/modules/roles/hooks/useRoles";
import { roleService } from "@/modules/roles/services/role.Service";

type RoleRecord = any;

export default function RoleManagementView() {
    const theme = useTheme();
    const { locale } = useParams() as { locale?: string };
    const lang = locale ?? "tr";

    const { t } = useI18nNs(["roles"]);

const [openForm, setOpenForm] = useState(false);
const [search, setSearch] = useState("");
const [openEdit, setOpenEdit] = useState(false);
const [editRole, setEditRole] = useState<RoleRecord | null>(null);
const [deleteRole, setDeleteRole] = useState<RoleRecord | null>(null);

const { data: roles, isLoading, mutate, error, isValidating } = useRoles({
  search,
});
    const safeT = (key: string, fallback: string) => {
        const value = t(key);
        return !value || value === key || value === `[${key}]`
            ? fallback
            : value;
    };

    const roleCount = roles?.length ?? 0;

    const handleEditSubmit = async (formValues: RoleRecord) => {
        try {
            const dto = {
                id: formValues.id,
                name: formValues.name,
                description: formValues.description,
                priority: formValues.priority ?? 0,
                category: formValues.category ?? 1,
                isSensitive: formValues.isSensitive ?? false,
                complianceTag: formValues.complianceTag ?? "",
                expirationDate: formValues.expirationDate ?? null,
                permissions: formValues.permissions ?? [],
                isDeleted: formValues.isDeleted ?? false,
            };

            const updated = await roleService.upsert(dto, { lang });

            if (updated) {
                console.info("✅ [AuditLog] Role updated:", dto);
                await mutate();
                setOpenEdit(false);
                setEditRole(null);
            } else {
                console.error("❌ [SecureLog] Role update failed:", dto.id);
            }
        } catch (err) {
            console.error("🚨 [SecureDecryptLog] Role update unexpected error:", err);
        }
    };

    return (
        <Stack spacing={3}>
            <Card
                sx={{
                    borderRadius: 5,
                    overflow: "hidden",
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                    background: `linear-gradient(135deg, ${alpha(
                        theme.palette.primary.main,
                        0.12,
                    )}, ${alpha(theme.palette.background.paper, 0.96)})`,
                }}
            >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={3}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                    >
                        <Stack spacing={1.5}>
                            <Chip
                                icon={<IconShieldLock size={18} />}
                                label={safeT("roles:hero.badge", "Yetki ve rol yönetimi")}
                                color="primary"
                                sx={{ alignSelf: "flex-start", fontWeight: 700 }}
                            />

                            <Typography variant="h3" fontWeight={900}>
                                {safeT("roles:title", "Roller")}
                            </Typography>

                            <Typography variant="body1" color="text.secondary" maxWidth={760}>
                                {safeT(
                                    "roles:hero.description",
                                    "Sistem rollerini, açıklamalarını ve rol bazlı yetki ilişkilerini merkezi olarak yönetin.",
                                )}
                            </Typography>
                        </Stack>

                        <Paper
                            elevation={0}
                            sx={{
                                px: 2.5,
                                py: 2,
                                borderRadius: 4,
                                minWidth: 180,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                                bgcolor: alpha(theme.palette.background.paper, 0.72),
                            }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 3,
                                        display: "grid",
                                        placeItems: "center",
                                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                                        color: theme.palette.primary.main,
                                    }}
                                >
                                    <IconUserCog size={24} />
                                </Box>

                                <Box>
                                    <Typography variant="h4" fontWeight={900}>
                                        {roleCount}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {safeT("roles:stats.total", "Toplam rol")}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Stack>
                </CardContent>
            </Card>

            {error ? (
                <Alert
                    severity="error"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            startIcon={<IconRefresh size={16} />}
                            onClick={() => void mutate()}
                        >
                            {safeT("roles:retry", "Tekrar dene")}
                        </Button>
                    }
                >
                    {safeT("roles:loadError", "Roller yüklenemedi.")}
                </Alert>
            ) : null}

            <Card
                sx={{
                    borderRadius: 4,
                    border: `1px solid ${alpha(theme.palette.divider, 0.75)}`,
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                            justifyContent="space-between"
                            alignItems={{ xs: "stretch", md: "center" }}
                        >
                            <Box>
                                <Typography variant="h5" fontWeight={900}>
                                    {safeT("roles:list.title", "Rol listesi")}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {safeT(
                                        "roles:list.description",
                                        "Rolleri görüntüleyin, düzenleyin veya yeni rol oluşturun.",
                                    )}
                                </Typography>
                            </Box>

                            <RoleToolbar
                                addLabel={safeT("roles:add", "Yeni Rol")}
                                searchPlaceholder={safeT("roles:search", "Rol ara")}
                                refreshLabel={safeT("roles:refresh", "Yenile")}
                                onSearch={setSearch}
                                onRefresh={() => void mutate()}
                                onAdd={() => {
                                    setEditRole(null);
                                    setOpenForm(true);
                                }}
                            />

                        </Stack>

                        <RoleList
                            roles={roles ?? []}
                            isLoading={isLoading}
                            labels={{
                                name: safeT("roles:name", "Rol Adı"),
                                description: safeT("roles:description", "Açıklama"),
                                actions: safeT("roles:actions", "İşlemler"),
                            }}
                            onEdit={(role) => {
                                setEditRole(role);
                                setOpenEdit(true);
                            }}
                            onDelete={(role) => setDeleteRole(role)}
                        />
                    </Stack>
                </CardContent>
            </Card>

            <RoleFormDialog
                open={openForm}
                onClose={() => setOpenForm(false)}
                role={null}
                onSaved={() => {
                    setOpenForm(false);
                    void mutate();
                }}
            />

            {editRole ? (
                <RoleEditDialog
                    open={openEdit}
                    onClose={() => setOpenEdit(false)}
                    onSubmit={handleEditSubmit}
                    defaultValues={editRole}
                />
            ) : null}

            <RoleDeleteDialog
                role={deleteRole}
                onClose={() => setDeleteRole(null)}
                onDeleted={() => {
                    setDeleteRole(null);
                    void mutate();
                }}
            />
        </Stack>
    );
}