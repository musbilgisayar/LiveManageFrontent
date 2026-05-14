// src/modules/auth/hooks/useAuthRegisterForm.ts

import { useState } from "react";
import type {
  RegisterFormErrors,
  RegisterFormState,
  RegisterPayloadDto,
} from "../types/AuthRegister.types";
import { registerWeb } from "../services/authRegister.service";
import {
  findDetails,
  normalizeDetails,
  unwrapRegisterApi,
} from "../utils/authRegisterApi.utils";
import { splitE164Phone } from "../utils/authRegisterPhone.utils";
import { validateRegisterForm } from "../utils/authRegisterValidation";

type UseAuthRegisterFormOptions = {
  t: (key: string) => string;
  onSuccess: () => void;
};

const initialForm: RegisterFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

export function useAuthRegisterForm({ t, onSuccess }: UseAuthRegisterFormOptions) {
  const [form, setForm] = useState<RegisterFormState>(initialForm);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [loading, setLoading] = useState(false);

  const setField = <TKey extends keyof RegisterFormState>(
    name: TKey,
    value: RegisterFormState[TKey]
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[name.toLowerCase()];
      delete copy.general;
      return copy;
    });
  };

  const submit = async () => {
    if (loading) return;

    setErrors({});

    const validationErrors = validateRegisterForm(form, t);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const splitPhone = form.phoneNumber ? splitE164Phone(form.phoneNumber) : null;

    if (form.phoneNumber && !splitPhone) {
      setErrors({
        phonenumber: [
          t("validation:invalidPhone") || "Telefon numarası ayrıştırılamadı.",
        ],
      });
      return;
    }

    const cultureCode =
      typeof navigator !== "undefined" ? navigator.language || "en-US" : "en-US";

    const timeZone =
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
        : "UTC";

    const fullName = `${form.firstName} ${form.lastName}`.trim();

    const payload: RegisterPayloadDto = {
      email: form.email.trim(),
      phoneCountryCode: splitPhone?.phoneCountryCode ?? null,
      phoneNumber: splitPhone?.phoneNumber ?? null,
      displayName: fullName,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      fullName,
      cultureCode,
      timeZone,
      password: form.password,
      requireEmailConfirmation: true,
      twoFactorEnabled: false,
    };

    try {
      setLoading(true);

      const result = await registerWeb(payload);
      const data = result.data;

      if ("userMessage" in data && data.userMessage) {
        const message = String(data.userMessage);

        if (
          message.includes("RegisterSuccess") ||
          message.includes("Account.RegisterSuccess")
        ) {
          onSuccess();
          return;
        }

        setErrors({ general: [message] });
        return;
      }

      const details =
        ("details" in data && data.details) ||
        findDetails(result.raw) ||
        findDetails((result.raw as Record<string, unknown>)?.error);

      if (details) {
        const normalized = normalizeDetails(details, t);

        if (Object.keys(normalized).length > 0) {
          setErrors(normalized);
          return;
        }
      }

      if (data.ok) {
        onSuccess();
        return;
      }

      setErrors({
        general: [t("auth:register.error") || "Bilinmeyen bir hata oluştu."],
      });
    } catch (error: unknown) {
      const raw =
        error && typeof error === "object" && "payload" in error
          ? (error as { payload?: unknown }).payload
          : null;

      const data = unwrapRegisterApi(raw);

      const details =
        ("details" in data && data.details) ||
        findDetails(raw) ||
        findDetails((raw as Record<string, unknown> | null)?.error);

      if (details) {
        const normalized = normalizeDetails(details, t);

        if (Object.keys(normalized).length > 0) {
          setErrors(normalized);
          return;
        }
      }

      if ("userMessage" in data && data.userMessage) {
        setErrors({ general: [String(data.userMessage)] });
        return;
      }

      setErrors({
        general: [
          error instanceof Error
            ? error.message || t("auth:register.networkError") || "Ağ hatası."
            : t("auth:register.networkError") || "Ağ hatası.",
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    loading,
    setField,
    submit,
  };
}