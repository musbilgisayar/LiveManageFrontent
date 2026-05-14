// src/modules/auth/utils/authForgotValidation.ts

import type {
  ForgotPasswordFormErrors,
  ForgotPasswordFormState,
} from "../types/AuthForgot.types";

type TranslateFn = (key: string) => string;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateForgotPasswordForm(
  state: ForgotPasswordFormState,
  t: TranslateFn
): ForgotPasswordFormErrors {
  const errors: ForgotPasswordFormErrors = {};

  const email = state.email.trim();

  if (!email) {
    errors.email = t("auth:forgot.emailRequired");
    return errors;
  }

  if (!emailRegex.test(email)) {
    errors.email =
      t("auth:forgot.invalidEmail") || "Geçerli bir e-posta giriniz.";
  }

  return errors;
}