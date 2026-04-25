//src/modules/users/components/detail/tabs/phone-manager/helpers/phoneErrorMapper_ultimate.ts

import type { UiUserPhoneErrorUltimate } from "@/modules/users/types/UserPhone.types_ultimate";

type UnknownError = unknown;

function isRecordUltimate(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function mapPhoneErrorToUiUltimate(
  error: UnknownError,
  fallbackMessage = "İşlem sırasında beklenmeyen bir hata oluştu."
): UiUserPhoneErrorUltimate {
  if (!isRecordUltimate(error)) {
    return { message: fallbackMessage };
  }

  const status =
    typeof error.status === "number"
      ? error.status
      : typeof error.statusCode === "number"
      ? error.statusCode
      : undefined;

  const message =
    typeof error.userMessage === "string"
      ? error.userMessage
      : typeof error.message === "string"
      ? error.message
      : fallbackMessage;

  const code =
    typeof error.code === "string"
      ? error.code
      : typeof error.errorCode === "string"
      ? error.errorCode
      : undefined;

  const fieldErrors =
    isRecordUltimate(error.errors) &&
    Object.values(error.errors).every((x) => Array.isArray(x))
      ? (error.errors as Record<string, string[]>)
      : undefined;

  return {
    code,
    message,
    fieldErrors,
    status,
  };
}