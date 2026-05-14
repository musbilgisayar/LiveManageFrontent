// src/modules/auth/hooks/useAuthResetPasswordForm.ts

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { resetPasswordWeb } from "../services/authResetPassword.service";
import type {
  ResetPasswordFormErrors,
  ResetPasswordFormState,
} from "../types/AuthResetPassword.types";
import { validateResetPasswordForm } from "../utils/authResetPasswordValidation";

type TranslateFn = (key: string) => string;

const initialState: ResetPasswordFormState = {
  email: "",
  newPassword: "",
  confirmPassword: "",
};

export function useAuthResetPasswordForm(t: TranslateFn) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState<ResetPasswordFormState>(initialState);
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const clearError = (field: keyof ResetPasswordFormErrors) => {
    setErrors((prev) => {
      if (!prev[field] && !prev.general) return prev;

      const copy = { ...prev };
      delete copy[field];
      delete copy.general;
      return copy;
    });
  };

  const setEmail = (email: string) => {
    setForm((prev) => ({ ...prev, email }));
    clearError("email");
  };

  const setNewPassword = (newPassword: string) => {
    setForm((prev) => ({ ...prev, newPassword }));
    clearError("newPassword");
  };

  const setConfirmPassword = (confirmPassword: string) => {
    setForm((prev) => ({ ...prev, confirmPassword }));
    clearError("confirmPassword");
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const submit = async () => {
    if (loading) return;

    setErrors({});

    const validationErrors = validateResetPasswordForm(form, token, t);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const result = await resetPasswordWeb({
        token: token as string,
        email: form.email.trim(),
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      if (!result.ok) {
        setErrors({
          general:
            result.userMessage ||
            result.message ||
            result.error ||
            result.title ||
            t("auth:reset.error"),
        });
        return;
      }

      setDone(true);
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message || t("auth:reset.error")
            : t("auth:reset.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    loading,
    done,
    showPassword,
    setEmail,
    setNewPassword,
    setConfirmPassword,
    togglePassword,
    submit,
  };
}