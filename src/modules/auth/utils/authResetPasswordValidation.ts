// src/modules/auth/utils/authResetPasswordValidation.ts

import type {
  ResetPasswordFormErrors,
  ResetPasswordFormState,
} from "../types/AuthResetPassword.types";

type TranslateFn = (key: string) => string;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateResetPasswordForm(
  state: ResetPasswordFormState,
  token: string | null,
  t: TranslateFn
): ResetPasswordFormErrors {
  const errors: ResetPasswordFormErrors = {};

  if (!token) {
    errors.general = t("auth:reset.tokenMissing");
  }

  if (!state.email.trim()) {
    errors.email = t("auth:reset.emailRequired");
  } else if (!emailRegex.test(state.email.trim())) {
    errors.email = t("auth:reset.invalidEmail");
  }

  if (!state.newPassword) {
    errors.newPassword = t("auth:reset.newPasswordRequired");
  }

  if (!state.confirmPassword) {
    errors.confirmPassword = t("auth:reset.confirmPasswordRequired");
  }

  if (
    state.newPassword &&
    state.confirmPassword &&
    state.newPassword !== state.confirmPassword
  ) {
    const message = t("auth:reset.passwordsDoNotMatch");

    errors.newPassword = message;
    errors.confirmPassword = message;
  }

  return errors;
}