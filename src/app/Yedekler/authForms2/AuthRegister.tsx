//src/app/Yedekler/authForms2/AuthRegister.tsx
"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Stack } from "@mui/system";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { getCultureCode } from "@/utils/cultureCode";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import AuthSocialButtons from "./AuthSocialButtons";
import { useI18nNs } from "@/app/context/i18nContext";

// ============================================================
// 📌 Validasyon Şeması
// ============================================================
const schema = z.object({
  email: z
    .string()
    .min(1, { message: "Validation:Email.Required" })
    .email({ message: "Validation:Email.Invalid" }),

  phoneCountryCode: z
    .string()
    .min(1, { message: "Validation:PhoneCountryCode.Required" }),

  phoneNumber: z
    .string()
    .min(1, { message: "Validation:PhoneNumber.Required" }),

  password: z
    .string()
    .min(8, { message: "Validation:Password.MinLength" })
    .regex(/[A-Z]/, { message: "Validation:Password.Uppercase" })
    .regex(/[a-z]/, { message: "Validation:Password.Lowercase" })
    .regex(/[0-9]/, { message: "Validation:Password.Number" })
    .regex(/[^A-Za-z0-9]/, { message: "Validation:Password.Special" }),
});

// ============================================================
// 📌 Props
// ============================================================
interface Props {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
  onChangeView?: (
    view: "login" | "register" | "forgot" | "twoSteps" | "close"
  ) => void;
}

// ============================================================
// 📌 Backend DTO (Register)
// ============================================================
type RegisterBody = {
  userName?: string;
  email: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  cultureCode: string;
  timeZone: string;
  password: string;
  requireEmailConfirmation?: boolean;
  twoFactorEnabled?: boolean;
};

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string | null | object;
  details?: Record<string, string[]>;
};

// ============================================================
// 📌 Form Type
// ============================================================
type RegisterFormValues = {
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  password: string;
};

// ============================================================
// 📌 Component
// ============================================================
const AuthRegister = ({ title, subtitle, subtext, onChangeView }: Props) => {
  const { t } = useI18nNs(["auth", "validation"]);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
      phoneCountryCode: "+41",
      phoneNumber: "",
      password: "",
    },
  });

  const password = watch("password") || "";

  const passwordRules = [
    { key: "Validation:Password.MinLength", valid: password.length >= 8 },
    { key: "Validation:Password.Uppercase", valid: /[A-Z]/.test(password) },
    { key: "Validation:Password.Lowercase", valid: /[a-z]/.test(password) },
    { key: "Validation:Password.Number", valid: /\d/.test(password) },
    { key: "Validation:Password.Special", valid: /[^A-Za-z0-9]/.test(password) },
  ];

  // ============================================================
  // 📌 Submit
  // ============================================================
  const onSubmit = async (formData: RegisterFormValues) => {
    setServerError(null);

    const cultureCode = getCultureCode();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const body: RegisterBody = {
      email: formData.email,
      phoneCountryCode: formData.phoneCountryCode,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      cultureCode,
      timeZone,
      requireEmailConfirmation: true,
      twoFactorEnabled: false,
    };

    try {
      const res = await fetch("/api/v1.0/account/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Tenant-Key": "kulturtisch",
        },
        body: JSON.stringify(body),
      });

      const result: ApiResponse<unknown> = await res.json();

      if (!result.ok) {
        let message: string | null = null;

        if (typeof result.error === "string") {
          message = t(result.error);
        } else if (result.details) {
          const firstError = Object.values(result.details).flat()[0];
          message = firstError || t("auth:register.error");
        } else if (result.error && typeof result.error === "object") {
          message = JSON.stringify(result.error);
        } else {
          message = t("auth:register.error");
        }

        setServerError(message);
        return;
      }

      onChangeView?.("close");

      const targetUrl = `/${cultureCode}/email/verify-email?email=${encodeURIComponent(
        formData.email
      )}`;

      router.push(targetUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("auth:register.error");
      setServerError(msg);
    }
  };

  // ============================================================
  // 📌 Render
  // ============================================================
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {title && (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {t("auth:register.title")}
        </Typography>
      )}

      {subtext}
      <AuthSocialButtons />

      <Box mt={3}>
        <Divider>
          <Typography
            component="span"
            color="textSecondary"
            variant="h6"
            fontWeight="400"
            px={2}
          >
            {t("auth:register.or")}
          </Typography>
        </Divider>
      </Box>

      <Stack spacing={2} mt={3}>
        {/* Email */}
        <div>
          <CustomFormLabel htmlFor="email">
            {t("auth:register.email")}
          </CustomFormLabel>
          <CustomTextField
            id="email"
            type="email"
            placeholder="ornek@mail.com"
            fullWidth
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <Alert severity="error">{t(errors.email.message!)}</Alert>
          )}
        </div>

        {/* Phone Country Code */}
        <div>
          <CustomFormLabel htmlFor="phoneCountryCode">
            {t("auth:register.phoneCountryCode")}
          </CustomFormLabel>
          <CustomTextField
            id="phoneCountryCode"
            type="text"
            placeholder="+41"
            fullWidth
            autoComplete="tel-country-code"
            {...register("phoneCountryCode")}
          />
          {errors.phoneCountryCode && (
            <Alert severity="error">
              {t(errors.phoneCountryCode.message!)}
            </Alert>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <CustomFormLabel htmlFor="phoneNumber">
            {t("auth:register.phoneNumber")}
          </CustomFormLabel>
          <CustomTextField
            id="phoneNumber"
            type="text"
            placeholder="791234567"
            fullWidth
            autoComplete="tel"
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && (
            <Alert severity="error">{t(errors.phoneNumber.message!)}</Alert>
          )}
        </div>

        {/* Password */}
        <div>
          <CustomFormLabel htmlFor="password">
            {t("auth:register.password")}
          </CustomFormLabel>
          <CustomTextField
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            fullWidth
            autoComplete="new-password"
            {...register("password")}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box mt={1}>
            {passwordRules.map((rule) => (
              <Typography
                key={rule.key}
                variant="body2"
                sx={{ color: rule.valid ? "success.main" : "error.main" }}
              >
                {t(rule.key)}
              </Typography>
            ))}
          </Box>
        </div>
      </Stack>

      <Button
        color="primary"
        variant="contained"
        size="large"
        fullWidth
        type="submit"
        disabled={!isValid || isSubmitting}
        aria-busy={isSubmitting}
        sx={{ mt: 3 }}
      >
        {isSubmitting ? t("auth:register.loading") : t("auth:register.signUp")}
      </Button>

      {serverError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {serverError}
        </Alert>
      )}

      <Stack direction="row" spacing={1} mt={3}>
        <Typography color="textSecondary" variant="h6" fontWeight="400">
          {t("auth:register.already")}
        </Typography>
        <Typography
          component="button"
          onClick={() => router.push(`/${getCultureCode()}/login`)}
          style={{
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer",
          }}
        >
          {t("auth:register.signIn")}
        </Typography>
      </Stack>

      {subtitle}
    </form>
  );
};

export default AuthRegister;