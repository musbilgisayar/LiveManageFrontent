"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { IconCirclePlus } from "@tabler/icons-react";
import { useI18nNs } from "@/app/context/i18nContext";
import { useUserPhoneNumbersUltimate } from "@/modules/users/hooks/useUserPhoneNumbers_ultimate";
import {
  sendUserPhoneVerificationCodeUltimate,
  verifyUserPhoneCodeUltimate,
} from "@/modules/users/services/userPhone.service_ultimate";
import type {
  UiUserPhoneErrorUltimate,
  UserPhoneNumberDtoUltimate,
} from "@/modules/users/types/UserPhone.types_ultimate";
import UserDetailCard from "../../cards/UserDetailCard";
import PhoneCreateDialog_ultimate from "./dialogs/PhoneCreateDialog_ultimate";
import PhoneEditDialog_ultimate from "./dialogs/PhoneEditDialog_ultimate";
import PhoneDeleteDialog_ultimate from "./dialogs/PhoneDeleteDialog_ultimate";
import PhoneVerifyDialog_ultimate from "./dialogs/PhoneVerifyDialog_ultimate";
import PhoneListItem_ultimate from "./PhoneListItem_ultimate";

interface PropsUltimate {
  userId: string;
}

function getPhoneErrorMessageUltimate(
  error: UiUserPhoneErrorUltimate | null | undefined,
  fallback: string
): string {
  if (!error) return fallback;

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  if (error.fieldErrors) {
    const firstFieldError = Object.values(error.fieldErrors)
      .flat()
      .find((item) => typeof item === "string" && item.trim());

    if (firstFieldError) {
      return firstFieldError;
    }
  }

  return fallback;
}

export default function PhoneManagerCard_ultimate({ userId }: PropsUltimate) {
  const { t } = useI18nNs(["users", "common"]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<UserPhoneNumberDtoUltimate | null>(null);
  const [deleteItem, setDeleteItem] = useState<UserPhoneNumberDtoUltimate | null>(null);
  const [verifyItem, setVerifyItem] = useState<UserPhoneNumberDtoUltimate | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [verifyErrorMessage, setVerifyErrorMessage] = useState("");
  const [isSendingVerifyCode, setIsSendingVerifyCode] = useState(false);
  const [isSubmittingVerifyCode, setIsSubmittingVerifyCode] = useState(false);
  const [hasSentVerifyCode, setHasSentVerifyCode] = useState(false);

  const { items, isLoading, isRefreshing, error, refresh } =
    useUserPhoneNumbersUltimate(userId, { enabled: Boolean(userId) });

  const hasItems = useMemo(() => items.length > 0, [items]);

  const handleOpenCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleCloseCreate = useCallback(() => {
    setCreateOpen(false);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditItem(null);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteItem(null);
  }, []);

  const handleCloseVerify = useCallback(() => {
    if (isSendingVerifyCode || isSubmittingVerifyCode) return;

    setVerifyItem(null);
    setVerifyErrorMessage("");
    setHasSentVerifyCode(false);
  }, [isSendingVerifyCode, isSubmittingVerifyCode]);

  const handleSuccessMessage = useCallback((message: string) => {
    setSuccessMessage(message);
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSuccessMessage("");
  }, []);

  const handleEdit = useCallback((item: UserPhoneNumberDtoUltimate) => {
    console.log("[PhoneManagerCard_ultimate] edit tıklandı", {
      phoneId: item.phoneId,
    });
    setEditItem(item);
  }, []);

  const handleDelete = useCallback((item: UserPhoneNumberDtoUltimate) => {
    console.log("[PhoneManagerCard_ultimate] delete tıklandı", {
      phoneId: item.phoneId,
    });
    setDeleteItem(item);
  }, []);

  const handleVerify = useCallback((item: UserPhoneNumberDtoUltimate) => {
    console.log("[PhoneManagerCard_ultimate] verify tıklandı", {
      phoneId: item.phoneId,
      isVerified: item.isVerified,
    });
    setVerifyErrorMessage("");
    setHasSentVerifyCode(false);
    setVerifyItem(item);
  }, []);

  const handleSendCode = useCallback(
    async (item: UserPhoneNumberDtoUltimate) => {
      setVerifyErrorMessage("");
      setHasSentVerifyCode(false);
      setIsSendingVerifyCode(true);

      try {
        await sendUserPhoneVerificationCodeUltimate({
          phoneId: item.phoneId,
        });

        setHasSentVerifyCode(true);
        handleSuccessMessage(t("users:detail.phone.verifyDialog.codeSentInfo"));
      } catch (err) {
        const message = getPhoneErrorMessageUltimate(
          err as UiUserPhoneErrorUltimate,
          t("users:detail.phone.unexpectedError")
        );

        setVerifyErrorMessage(message);
        setHasSentVerifyCode(false);
        throw err;
      } finally {
        setIsSendingVerifyCode(false);
      }
    },
    [handleSuccessMessage, t]
  );

  const handleVerifyCode = useCallback(
    async (item: UserPhoneNumberDtoUltimate, code: string) => {
      setVerifyErrorMessage("");
      setIsSubmittingVerifyCode(true);

      try {
        await verifyUserPhoneCodeUltimate({
          phoneId: item.phoneId,
          code,
        });

        setVerifyItem(null);
        setHasSentVerifyCode(false);
        handleSuccessMessage(t("users:detail.phone.verifiedBadge"));
        await refresh();
      } catch (err) {
        const message = getPhoneErrorMessageUltimate(
          err as UiUserPhoneErrorUltimate,
          t("users:detail.phone.unexpectedError")
        );

        setVerifyErrorMessage(message);
        throw err;
      } finally {
        setIsSubmittingVerifyCode(false);
      }
    },
    [handleSuccessMessage, refresh, t]
  );

  const errorMessage = useMemo(
    () =>
      getPhoneErrorMessageUltimate(
        error,
        t("users:detail.phone.unexpectedError")
      ),
    [error, t]
  );

  return (
    <>
      <UserDetailCard title={t("users:detail.phone.sectionTitle")}>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            {t("users:detail.phone.sectionDescription")}
          </Typography>

          {isLoading ? (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={20} />
                <Typography variant="body2">
                  {t("users:detail.phone.loading")}
                </Typography>
              </Stack>
            </Paper>
          ) : null}

          {!isLoading && error ? (
            <Alert severity="error">{errorMessage}</Alert>
          ) : null}

          {!isLoading && !error && !hasItems ? (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {t("users:detail.phone.empty")}
              </Typography>
            </Paper>
          ) : null}

          {!isLoading && !error && hasItems ? (
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 2,
                py: 0.5,
              }}
            >
              <Stack>
                {items.map((item, index) => (
                  <PhoneListItem_ultimate
                    key={item.phoneId}
                    item={item}
                    t={t}
                    isLast={index === items.length - 1}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onVerify={handleVerify}
                  />
                ))}
              </Stack>
            </Paper>
          ) : null}

          {isRefreshing ? (
            <Typography variant="caption" color="text.secondary">
              {t("users:detail.phone.refreshing")}
            </Typography>
          ) : null}

          <Box sx={{ pt: 0.5 }}>
            <Button
              variant="text"
              startIcon={<IconCirclePlus size={18} />}
              onClick={handleOpenCreate}
              sx={{
                borderRadius: 999,
                px: 1.5,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {t("users:detail.phone.addButton")}
            </Button>
          </Box>
        </Stack>
      </UserDetailCard>

      <PhoneCreateDialog_ultimate
        open={createOpen}
        userId={userId}
        onClose={handleCloseCreate}
        onCreated={refresh}
        onSuccessMessage={handleSuccessMessage}
      />

      <PhoneEditDialog_ultimate
        open={Boolean(editItem)}
        userId={userId}
        item={editItem}
        onClose={handleCloseEdit}
        onUpdated={refresh}
        onSuccessMessage={handleSuccessMessage}
      />

      <PhoneDeleteDialog_ultimate
        open={Boolean(deleteItem)}
        userId={userId}
        item={deleteItem}
        onClose={handleCloseDelete}
        onDeleted={refresh}
        onSuccessMessage={handleSuccessMessage}
      />

      <PhoneVerifyDialog_ultimate
        open={Boolean(verifyItem)}
        item={verifyItem}
        t={t}
        isSending={isSendingVerifyCode}
        isVerifying={isSubmittingVerifyCode}
        hasSentCode={hasSentVerifyCode}
        errorMessage={verifyErrorMessage || null}
        onClose={handleCloseVerify}
        onSendCode={handleSendCode}
        onVerifyCode={handleVerifyCode}
      />

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
    </>
  );
}