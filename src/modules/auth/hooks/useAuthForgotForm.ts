// src/modules/auth/hooks/useAuthForgotForm.ts

import { useState } from "react";
import { requestForgotPassword } from "../services/authForgot.service";
import type {
  ForgotPasswordFormErrors,
  ForgotPasswordFormState,
} from "../types/AuthForgot.types";
import { validateForgotPasswordForm } from "../utils/authForgotValidation";

type TranslateFn = (key: string) => string;

const initialState: ForgotPasswordFormState = {
  email: "",
};

export function useAuthForgotForm(t: TranslateFn) {
  const [form, setForm] = useState<ForgotPasswordFormState>(initialState);
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const setEmail = (email: string) => {
    setForm((prev) => ({ ...prev, email }));

    setErrors((prev) => {
      if (!prev.email && !prev.general) return prev;

      const copy = { ...prev };
      delete copy.email;
      delete copy.general;
      return copy;
    });
  };

  const submit = async () => {
    if (loading) return;

    setErrors({});
    setSuccessMessage(null);

    const validationErrors = validateForgotPasswordForm(form, t);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const result = await requestForgotPassword({
        email: form.email.trim(),
      });

      if (!result.ok) {
        setErrors({
          general:
            result.userMessage ||
            result.message ||
            result.error ||
            t("auth:forgot.error"),
        });
        return;
      }

      setSent(true);
      setSuccessMessage(
        result.userMessage || result.message || t("auth:forgot.success")
      );
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message || t("auth:forgot.error")
            : t("auth:forgot.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    sent,
    loading,
    successMessage,
    setEmail,
    submit,
  };
}