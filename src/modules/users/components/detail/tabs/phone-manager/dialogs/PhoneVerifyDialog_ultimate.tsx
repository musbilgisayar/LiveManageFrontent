// 1) src/modules/users/components/PhoneVerifyDialog_ultimate.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { formatPhoneDisplayUltimate } from "../helpers/phoneDisplay_ultimate";
import type { UserPhoneNumberDtoUltimate } from "@/modules/users/types/UserPhone.types_ultimate";

type TFunctionUltimate = (
  key: string,
  vars?: Record<string, string | number>
) => string;

interface PropsUltimate {
  open: boolean;
  item: UserPhoneNumberDtoUltimate | null;
  t: TFunctionUltimate;
  isSending?: boolean;
  isVerifying?: boolean;
  hasSentCode?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSendCode: (item: UserPhoneNumberDtoUltimate) => void | Promise<void>;
  onVerifyCode: (
    item: UserPhoneNumberDtoUltimate,
    code: string
  ) => void | Promise<void>;
}

function pickFirstStringUltimate(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = pickFirstStringUltimate(item);
      if (found) return found;
    }
  }

  if (value && typeof value === "object") {
    for (const key of [
      "userMessage",
      "message",
      "error",
      "title",
      "detail",
      "description",
    ]) {
      const found = pickFirstStringUltimate((value as Record<string, unknown>)[key]);
      if (found) return found;
    }

    const errors = (value as Record<string, unknown>).errors;
    const found = pickFirstStringUltimate(errors);
    if (found) return found;
  }

  return "";
}

function extractErrorMessageUltimate(
  error: unknown,
  fallback: string
): string {
  if (!error) return fallback;

  if (error instanceof Error) {
    const direct = pickFirstStringUltimate(error.message);
    if (direct) return direct;

    const responseData = pickFirstStringUltimate(
      (error as Error & { response?: { data?: unknown } }).response?.data
    );
    if (responseData) return responseData;

    const causeMessage = pickFirstStringUltimate(
      (error as Error & { cause?: unknown }).cause
    );
    if (causeMessage) return causeMessage;

    return fallback;
  }

  const objectMessage = pickFirstStringUltimate(error);
  if (objectMessage) return objectMessage;

  return fallback;
}

export default function PhoneVerifyDialog_ultimate({
  open,
  item,
  t,
  isSending = false,
  isVerifying = false,
  hasSentCode = false,
  errorMessage = null,
  onClose,
  onSendCode,
  onVerifyCode,
}: PropsUltimate) {
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) {
      setCode("");
      setLocalError("");
    }
  }, [open]);

  const phoneText = useMemo(() => {
    if (!item) return "";
    return formatPhoneDisplayUltimate(item.countryCode, item.phoneNumber);
  }, [item]);

  const combinedError = useMemo(() => {
    const external = (errorMessage ?? "").trim();
    const local = localError.trim();
    return external || local || "";
  }, [errorMessage, localError]);

  const handleSendCode = async () => {
    if (!item || isSending || isVerifying) return;

    setLocalError("");

    try {
      await onSendCode(item);
    } catch (error: unknown) {
      setLocalError(
        extractErrorMessageUltimate(
          error,
          t("users:detail.phone.verifyDialog.sendFailed")
        )
      );
    }
  };

  const handleVerify = async () => {
    if (!item || isSending || isVerifying) return;

    const trimmed = code.trim();

    if (!trimmed) {
      setLocalError(t("users:detail.phone.verifyDialog.codeRequired"));
      return;
    }

    if (trimmed.length < 4) {
      setLocalError(t("users:detail.phone.verifyDialog.codeInvalidLength"));
      return;
    }

    setLocalError("");

    try {
      await onVerifyCode(item, trimmed);
    } catch (error: unknown) {
      setLocalError(
        extractErrorMessageUltimate(
          error,
          t("users:detail.phone.verifyDialog.verifyFailed")
        )
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSending || isVerifying ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>{t("users:detail.phone.verifyDialog.title")}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t("users:detail.phone.verifyDialog.description")}
          </Typography>

          {item ? (
            <Alert severity="info">
              {t("users:detail.phone.verifyDialog.phoneLabel")}:{" "}
              <strong>{phoneText}</strong>
            </Alert>
          ) : null}

          {!hasSentCode && !combinedError ? (
            <Alert severity="warning">
              {t("users:detail.phone.verifyDialog.sendInfo")}
            </Alert>
          ) : null}

          {hasSentCode ? (
            <Alert severity="success">
              {t("users:detail.phone.verifyDialog.codeSentInfo")}
            </Alert>
          ) : null}

          {combinedError ? (
            <Alert severity="error">{combinedError}</Alert>
          ) : null}

          <TextField
            label={t("users:detail.phone.verifyDialog.codeLabel")}
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              if (localError) setLocalError("");
            }}
            fullWidth
            inputProps={{ maxLength: 6, inputMode: "numeric" }}
            placeholder={t("users:detail.phone.verifyDialog.codePlaceholder")}
            disabled={!hasSentCode || isVerifying}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          disabled={isSending || isVerifying}
          sx={{ textTransform: "none" }}
        >
          {t("common:cancel")}
        </Button>

        {!hasSentCode ? (
          <Button
            variant="contained"
            color="warning"
            onClick={() => void handleSendCode()}
            disabled={!item || isSending}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {isSending ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} color="inherit" />
                <span>{t("users:detail.phone.verifyDialog.sending")}</span>
              </Stack>
            ) : (
              t("users:detail.phone.verifyDialog.sendButton")
            )}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => void handleVerify()}
            disabled={!item || isVerifying}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {isVerifying ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} color="inherit" />
                <span>{t("users:detail.phone.verifyDialog.verifying")}</span>
              </Stack>
            ) : (
              t("users:detail.phone.verifyDialog.confirmButton")
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// 2) Parent/container tarafı örnek düzeltme
// Buradaki kritik nokta: generic message ile overwrite ETME.

function extractApiMessageUltimate(error: unknown): string {
  return extractErrorMessageUltimate(
    error,
    "Beklenmeyen bir hata oluştu, lütfen tekrar deneyiniz."
  );
}

// Örnek:
// const handleSendCode = async (item: UserPhoneNumberDtoUltimate) => {
//   setIsSending(true);
//   setErrorMessage(null);
//
//   try {
//     await phoneService.sendVerificationCode(item.id);
//     setHasSentCode(true);
//   } catch (error: unknown) {
//     const message = extractApiMessageUltimate(error);
//     setErrorMessage(message);
//     throw new Error(message);
//   } finally {
//     setIsSending(false);
//   }
// };

// 3) Service/api client tarafı örnek düzeltme
// En yaygın gerçek sebep burada oluyor: backend mesajı burada eziliyor.

export async function normalizeAndThrowApiErrorUltimate(response: Response): Promise<never> {
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const message =
    pickFirstStringUltimate(payload) ||
    `HTTP ${response.status} hatası oluştu.`;

  throw new Error(message);
}

// Axios kullanıyorsan örnek:
// catch (error: unknown) {
//   const message = extractErrorMessageUltimate(error, "Beklenmeyen bir hata oluştu, lütfen tekrar deneyiniz.");
//   throw new Error(message);
// }