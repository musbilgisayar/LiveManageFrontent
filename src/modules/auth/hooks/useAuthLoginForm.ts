// src/modules/auth/hooks/useAuthLoginForm.ts

import { useEffect, useRef, useState } from "react";

import { getTenantKey, setTenantKey } from "@/utils/tenant.client";
import { DEFAULT_TENANT_KEY } from "@/lib/tenantKeys";
import type {
  LoginFormErrors,
  LoginFormState,
} from "../types/AuthLogin.types";
import { loginWeb } from "../services/authLogin.service";
import { validateLoginForm } from "../utils/authLoginValidation";

type TranslateFn = (key: string) => string;

type UseAuthLoginFormOptions = {
  t: TranslateFn;
  locale: string;
  returnUrl?: string | null;
  onSuccess: (redirectTo: string) => void | Promise<void>;
};

const initialState: LoginFormState = {
  identifier: "",
  password: "",
  rememberMe: false,
  tenantKey: DEFAULT_TENANT_KEY,
};

function toPrefix(cultureCode?: string | null) {
  return (cultureCode || "tr-TR").split("-")[0].toLowerCase();
}

function getDashboardPath(locale: string) {
  return `/${locale}/dashboard`;
}

export function useAuthLoginForm({
  t,
  locale,
  returnUrl,
  onSuccess,
}: UseAuthLoginFormOptions) {
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<LoginFormState>(initialState);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const existingTenant = getTenantKey();

    if (existingTenant) {
      setForm((prev) => ({
        ...prev,
        tenantKey: existingTenant,
      }));
    }
  }, []);

  const clearFieldError = (field: keyof LoginFormErrors) => {
    setErrors((prev) => {
      if (!prev[field] && !prev.general) return prev;

      const copy = { ...prev };
      delete copy[field];
      delete copy.general;
      return copy;
    });
  };

  const setIdentifier = (identifier: string) => {
    setForm((prev) => ({ ...prev, identifier }));
    clearFieldError("identifier");
  };

  const setPassword = (password: string) => {
    setForm((prev) => ({ ...prev, password }));
    clearFieldError("password");
  };

  const setRememberMe = (rememberMe: boolean) => {
    setForm((prev) => ({ ...prev, rememberMe }));
  };

  const setTenant = (tenantKey: string) => {
    setForm((prev) => ({ ...prev, tenantKey }));
    setTenantKey(tenantKey);
    clearFieldError("tenantKey");
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const setGeneralError = (message: string) => {
    setErrors((prev) => ({
      ...prev,
      general: message,
    }));
  };

  const clearGeneralError = () => {
    clearFieldError("general");
  };

  const submit = async () => {
    if (loading) return;

    setErrors({});

    const validationErrors = validateLoginForm(form, t);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      setTenantKey(form.tenantKey);

      const result = await loginWeb({
        identifier: form.identifier.trim(),
        password: form.password,
        rememberMe: form.rememberMe,
      });

      if (!result.ok) {
        setErrors({
          general:
            result.userMessage ||
            result.message ||
            result.error ||
            result.title ||
            t("auth:login.error"),
        });
        return;
      }

      const targetLocale = result.data?.cultureCode
        ? toPrefix(result.data.cultureCode)
        : locale;

      const safeReturnUrl =
        returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")
          ? returnUrl
          : null;

      const redirectTo =
        safeReturnUrl || result.data?.redirectTo || getDashboardPath(targetLocale);

      await onSuccess(redirectTo);
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message || t("auth:login.error")
            : t("auth:login.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    loading,
    showPassword,
    passwordInputRef,
    setIdentifier,
    setPassword,
    setRememberMe,
    setTenant,
    setGeneralError,
    clearGeneralError,
    togglePassword,
    submit,
  };
}
