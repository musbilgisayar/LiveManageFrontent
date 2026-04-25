"use client";

import React, { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useI18nNs } from "@/app/context/i18nContext";
import { useRoles } from "@/modules/roles/hooks/useRoles";

import {
  RoleToolbar,
  RoleList,
  RoleFormDialog,
  RoleDeleteDialog,
  RoleEditDialog,
} from "@/modules/roles";
import { roleService } from "@/modules/roles/services/roleService";

/**
 * 🎛️ RoleManagerPage
 * Kurumsal tema, i18n ve BFF mimarisiyle entegre rol yönetimi sayfası.
 *
 * Özellikler:
 *  - Çok dilli başlıklar (veritabanı tabanlı)
 *  - SWR cache + invalidasyon destekli veri akışı
 *  - MUI kurumsal tema ile tam uyum
 */
export default function RoleManagerPage() {
  const { locale } = useParams() as { locale?: string };
  const lang = locale ?? "tr";

  const { t, ready } = useI18nNs(["roles"]);
  const { data: roles, isLoading, mutate, error } = useRoles();

  const [openForm, setOpenForm] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editRole, setEditRole] = useState<any | null>(null);
  const [deleteRole, setDeleteRole] = useState<any | null>(null);

  const safeT = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };
 

  const handleEditSubmit = async (formValues: any) => {
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
        mutate();
        setOpenEdit(false);
        setEditRole(null);
      } else {
        console.error("❌ [SecureLog] Update failed:", updated);
      }
    } catch (err) {
      console.error("🚨 [SecureDecryptLog] Unexpected error:", err);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {safeT("roles:title", "Roller")}
        </Typography>

        <RoleToolbar
          addLabel={safeT("roles:add", "Yeni Rol")}
          searchPlaceholder={safeT("roles:search", "Rol ara")}
          onAdd={() => {
            setEditRole(null);
            setOpenForm(true);
          }}
        />
      </Box>

      <Paper
        sx={{
          borderRadius: 2,
          boxShadow:
            (theme) =>
              (theme as any).customShadows?.md ??
              "0 2px 10px rgba(0,0,0,0.08)",
          p: 2,
        }}
      >
        <RoleList
          roles={roles ?? []}
          isLoading={isLoading}
          labels={{
            name: safeT("roles:name", "Rol Adı"),
            description: safeT("roles:description", "Açıklama"),
            actions: safeT("roles:actions", "İşlemler"),
          }}
          onEdit={(r) => {
            setEditRole(r);
            setOpenEdit(true);
          }}
          onDelete={(r) => setDeleteRole(r)}
        />
      </Paper>

      <RoleFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        role={null}
        onSaved={() => {
          setOpenForm(false);
          mutate();
        }}
      />

      {editRole && (
        <RoleEditDialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          onSubmit={handleEditSubmit}
          defaultValues={editRole}
        />
      )}

      <RoleDeleteDialog
        role={deleteRole}
        onClose={() => setDeleteRole(null)}
        onDeleted={() => {
          setDeleteRole(null);
          mutate();
        }}
      />
    </Box>
  );
}