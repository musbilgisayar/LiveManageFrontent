// src/modules/users/components/detail/tabs/phone-manager/dialogs/PhoneDeleteDialog_ultimate.tsx

"use client";

import React, { useCallback, useMemo } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useI18nNs } from "@/app/context/i18nContext";
import { useDeleteUserPhoneNumberUltimate } from "@/modules/users/hooks/useDeleteUserPhoneNumber_ultimate";
import type { UserPhoneNumberDtoUltimate } from "@/modules/users/types/UserPhone.types_ultimate";
import { formatPhoneDisplayUltimate } from "../helpers/phoneDisplay_ultimate";
import { mapPhoneErrorToUiUltimate } from "../helpers/phoneErrorMapper_ultimate";

interface PropsUltimate {
  open: boolean;
  userId: string;
  item: UserPhoneNumberDtoUltimate | null;
  onClose: () => void;
  onDeleted?: () => Promise<void> | void;
  onSuccessMessage?: (message: string) => void;
}

export default function PhoneDeleteDialog_ultimate({
  open,
  userId,
  item,
  onClose,
  onDeleted,
  onSuccessMessage,
}: PropsUltimate) {
  const { t } = useI18nNs(["users", "common"]);

  const { deletePhone, isSubmitting, error, resetError } =
    useDeleteUserPhoneNumberUltimate({
      onSuccess: async () => {
        await onDeleted?.();
      },
    });

  const normalizedError = useMemo(
    () => (error ? mapPhoneErrorToUiUltimate(error) : null),
    [error]
  );

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    resetError();
    onClose();
  }, [isSubmitting, onClose, resetError]);

  const handleDelete = useCallback(async () => {
    if (!item?.phoneId) return;

    try {
      await deletePhone(userId, item.phoneId);
      onSuccessMessage?.(t("users:detail.phone.deleteSuccess"));
      handleClose();
    } catch {}
  }, [deletePhone, handleClose, item?.phoneId, onSuccessMessage, t, userId]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>{t("users:detail.phone.deleteTitle")}</DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t("users:detail.phone.deleteConfirm")}
        </Typography>

        {item ? (
          <Typography variant="body1" fontWeight={600}>
            {formatPhoneDisplayUltimate(item.countryCode, item.phoneNumber)}
          </Typography>
        ) : null}

        {normalizedError?.message ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {normalizedError.message}
          </Alert>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          {t("users:detail.phone.cancel")}
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={handleDelete}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={20} /> : t("common:delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}