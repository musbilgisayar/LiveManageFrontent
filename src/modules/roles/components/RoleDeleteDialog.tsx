"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { roleService } from "../services";
import { RoleDto } from "../types";
import { useSnackbar } from "notistack";
import { useParams } from "next/navigation";
import { useI18nNs } from "@/app/context/i18nContext"; // ✅ senin i18n context'in

type Props = {
  role?: RoleDto | null;
  onClose: () => void;
  onDeleted?: () => void;
};

/**
 * 🗑️ RoleDeleteDialog
 * LiveManage’in veritabanı tabanlı i18n sistemine (ns:a.b.c) göre yapılandırılmıştır.
 */
export function RoleDeleteDialog({ role, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { locale } = useParams() as { locale?: string };
  const lang = locale ?? "tr";

  // 🔹 DB'den namespace bazlı çeviri (örnek: roles:delete.title)
  const { t } = useI18nNs(["roles", "common"]);

  if (!role) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      await roleService.delete(role.id, { lang });
      enqueueSnackbar(t("roles:delete.success"), { variant: "success" });
      onDeleted?.();
    } catch (err) {
      enqueueSnackbar(t("roles:delete.error"), { variant: "error" });
      console.error("RoleDeleteDialog error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={!!role}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, boxShadow: "var(--shadow-md)" },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
        {t("roles:delete.title")}
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1">
          {t("roles:delete.confirm", { roleName: role.name })}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: "none" }}>
          {t("common:button.cancel")}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {t("roles:delete.button")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
