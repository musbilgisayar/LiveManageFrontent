// src/modules/auth/utils/authLoginValidation.ts

import type {
  LoginFormErrors,
  LoginFormState,
} from "../types/AuthLogin.types";

type TranslateFn = (key: string) => string;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginForm(
  state: LoginFormState,
  t: TranslateFn
): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!state.tenantKey.trim()) {
    errors.tenantKey = t("auth:login.tenantRequired");
  }

  const identifier = state.identifier.trim();

  if (!identifier) {
    errors.identifier = t("auth:login.requiredFields");
  } else if (!emailRegex.test(identifier)) {
    errors.identifier = t("auth:login.invalidEmail");
  }

  if (!state.password) {
    errors.password = t("auth:login.requiredFields");
  }

  return errors;
}