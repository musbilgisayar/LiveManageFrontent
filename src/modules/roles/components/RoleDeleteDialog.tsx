"use client";

import { useState } from "react";

import {
  Alert,
  alpha,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import {
  IconAlertTriangle,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { useSnackbar } from "notistack";

import { useI18nNs } from "@/app/context/i18nContext";

import { roleService } from "../services";
import type { RoleDto } from "../types";

type Props = {
  role?: RoleDto | null;
  onClose: () => void;
  onDeleted?: () => void;
};

function resolveRoleName(role: RoleDto): string {
  return role.name || "-";
}

export function RoleDeleteDialog({
  role,
  onClose,
  onDeleted,
}: Props) {
  const theme = useTheme();

  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const { locale } = useParams() as { locale?: string };
  const lang = locale ?? "tr";

  const { t } = useI18nNs(["roles", "common"]);

  const tr = (key: string, fallback: string) => {
    const value = t(key);

    return !value || value === key || value === `[${key}]`
      ? fallback
      : value;
  };

  if (!role) return null;

  const roleName = resolveRoleName(role);

  const isSystemLikeRole =
    roleName.toLowerCase().includes("admin") ||
    roleName.toLowerCase().includes("super") ||
    roleName.toLowerCase().includes("system");

  const handleDelete = async () => {
    try {
      setLoading(true);

      await roleService.delete(role.id, { lang });

      enqueueSnackbar(
        tr("roles:delete.success", "Rol başarıyla silindi."),
        { variant: "success" },
      );

      onDeleted?.();
    } catch (error) {
      console.error("ROLE_DELETE_DIALOG_FAILED", error);

      enqueueSnackbar(
        tr("roles:delete.error", "Rol silinemedi."),
        { variant: "error" },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={Boolean(role)}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${alpha(theme.palette.error.main, 0.22)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2.5,
          background: alpha(theme.palette.error.main, 0.07),
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.error.main, 0.13),
              color: theme.palette.error.main,
            }}
          >
            <IconAlertTriangle size={25} />
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={900}>
              {tr("roles:delete.title", "Rolü sil")}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {tr(
                "roles:delete.description",
                "Bu işlem rol kaydını sistemden kaldırır.",
              )}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="body1">
            {tr(
              "roles:delete.confirmPrefix",
              "Aşağıdaki rolü silmek istediğinizden emin misiniz?",
            )}
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              bgcolor: alpha(theme.palette.background.default, 0.55),
            }}
          >
            <Typography variant="subtitle1" fontWeight={900}>
              {roleName}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {role.description ||
                tr("roles:noDescription", "Açıklama bulunmuyor.")}
            </Typography>
          </Box>

          {isSystemLikeRole ? (
            <Alert severity="warning">
              {tr(
                "roles:delete.systemWarning",
                "Bu rol sistem/yönetici rolü gibi görünüyor. Silmeden önce bağlı kullanıcı ve permission etkilerini kontrol edin.",
              )}
            </Alert>
          ) : null}

          <Alert severity="error">
            {tr(
              "roles:delete.auditWarning",
              "Bu işlem audit log kapsamında izlenmelidir ve geri dönüşü olmayabilir.",
            )}
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          color="inherit"
          startIcon={<IconX size={18} />}
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          {tr("common:button.cancel", "İptal")}
        </Button>

        <Button
          variant="contained"
          color="error"
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <IconTrash size={18} />
            )
          }
          onClick={handleDelete}
          disabled={loading}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 900,
          }}
        >
          {tr("roles:delete.button", "Rolü sil")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}