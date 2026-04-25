"use client";

import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";
import type { SocialMediaAccountListItemDto } from "@/modules/users/types/UserSocialMedia.types";

type Props = {
  open: boolean;
  loading?: boolean;
  item: SocialMediaAccountListItemDto | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function SocialMediaDeleteDialog({
  open,
  loading = false,
  item,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useI18nNs?.("users") ?? {
    t: (key: string, fallback?: any) => fallback?.defaultValue ?? key,
  };

  return (
    <Dialog open={open} onClose={() => !loading && onClose()} fullWidth maxWidth="xs">
      <DialogTitle>
        {t("users:socialMedia.deleteDialogTitle", {
          defaultValue: "Sosyal Medya Kaydını Sil",
        })}
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2">
          {t("users:socialMedia.deleteConfirm", {
            defaultValue: "Bu sosyal medya kaydını silmek istediğinize emin misiniz?",
          })}
        </Typography>

        {item && (
          <Box mt={2}>
            <Typography variant="subtitle2" fontWeight={700}>
              {item.displayName || item.platform}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {item.url}
            </Typography>

            {!!item.userNameOrHandle && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                @{item.userNameOrHandle.replace(/^@/, "")}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("common:cancel", { defaultValue: "Vazgeç" })}
        </Button>

        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
          {loading ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            t("common:delete", { defaultValue: "Sil" })
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}