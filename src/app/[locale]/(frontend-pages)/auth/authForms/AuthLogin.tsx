// ============================================================
// File: src/app/[locale]/(frontend-pages)/auth/authForms/AuthLogin.tsx
// ============================================================

"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import BusinessIcon from "@mui/icons-material/Business";
import { useParams, useRouter } from "next/navigation";

import { textFieldStyle } from "@/app/components/shared/styles";
import { useCustomizer } from "@/app/context/customizerContext";
import { useI18nNs } from "@/app/context/i18nContext";
import { getWebFetcher, postWebFetcher } from "@/utils/fetchers.web.client";
import { getTenantKey, setTenantKey } from "@/utils/tenant.client";

import AuthSocialButtons from "./AuthSocialButtons";

type LoginResponse = {
  ok: boolean;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    redirectTo?: string;
    user?: {
      id?: string;
      roles?: string[];
      role?: string;
      primaryRole?: string;
    };
    cultureCode?: string;
  };
  error?: string;
  message?: string;
  title?: string;
};

type AccountMeResponse = {
  ok?: boolean;
  data?: any;
  cultureCode?: string;
};

type TenantOption = {
  key: string;
  label: string;
};

const LOGIN_TENANT_OPTIONS: TenantOption[] = [
  { key: "default", label: "Default" },
  { key: "kulturtisch", label: "KulturTisch" },
  { key: "admin", label: "Administration" },
  { key: "demo", label: "Demo" },
];

const toPrefix = (cultureCode?: string | null) =>
  (cultureCode || "tr-TR").split("-")[0].toLowerCase();

function setLocaleCookie(prefixOrCulture: string) {
  const secure =
    typeof window !== "undefined" && window.location?.protocol === "https:"
      ? "; Secure"
      : "";

  const prefix = toPrefix(prefixOrCulture);

  document.cookie = `lm.lang=${prefix}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

function extractCultureCode(raw: any): string | null {
  return (
    raw?.cultureCode ||
    raw?.data?.cultureCode ||
    raw?.data?.data?.cultureCode ||
    raw?.user?.cultureCode ||
    raw?.data?.user?.cultureCode ||
    raw?.data?.data?.user?.cultureCode ||
    null
  );
}

function getDashboardPath(locale: string) {
  return `/${locale}/dashboard`;
}

export default function AuthLogin() {
  const { t } = useI18nNs(["auth"]);
  const { setIsLanguage } = useCustomizer();
  const router = useRouter();
  const { locale } = useParams() as { locale: string };

  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [tenantKey, setTenantKeyState] = useState("default");

  useEffect(() => {
    const existingTenant = getTenantKey();

    if (existingTenant) {
      setTenantKeyState(existingTenant);
      return;
    }

    setTenantKeyState("default");
  }, []);

  const handleTenantChange = (nextTenant: string) => {
    setTenantKeyState(nextTenant);
    setTenantKey(nextTenant);
  };

  const handleLogin = async () => {
    if (loading) {
      console.warn(
        "⚠️ [LOGIN FLOW] İşlem zaten devam ediyor, ikinci istek engellendi."
      );
      return;
    }

    console.group("🟦 [LOGIN FLOW]");
    setError(null);

    if (!tenantKey.trim()) {
      const msg = "Lütfen tenant seçiniz.";
      console.warn("⚠️ [LOGIN FLOW] Tenant seçilmedi.");
      setError(msg);
      console.groupEnd();
      return;
    }

    if (!email.trim() || !password) {
      const msg = t("auth:login.requiredFields");
      console.warn("⚠️ Eksik alan:", msg);
      setError(msg);
      console.groupEnd();
      return;
    }

    const payload = {
      identifier: email.trim(),
      password,
      rememberMe,
    };

    try {
      setLoading(true);

      setTenantKey(tenantKey);

      const result = (await postWebFetcher(
        "/api/v1.0/account/login",
        payload
      )) as LoginResponse;

      const data = (result.data as any)?.data ?? result.data;
      const accessToken = data?.accessToken;
      const refreshToken = data?.refreshToken;

      if (!result?.ok || !accessToken) {
        const msg =
          result?.error ||
          result?.message ||
          result?.title ||
          t("auth:login.error");

        setError(msg);
        console.groupEnd();
        return;
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken || "");
      setTenantKey(tenantKey);

      let effectiveCultureCode: string | null =
        extractCultureCode(data) || null;

      if (!effectiveCultureCode) {
        try {
          const meResult = (await getWebFetcher(
            "/api/v1.0/account/me"
          )) as AccountMeResponse;

          console.log("🔹 account/me result:", meResult);

          effectiveCultureCode = extractCultureCode(meResult);
        } catch (meErr) {
          console.warn(
            "⚠️ account/me çağrısından cultureCode alınamadı:",
            meErr
          );
        }
      }

      const targetLocale = effectiveCultureCode
        ? toPrefix(effectiveCultureCode)
        : locale;

      if (effectiveCultureCode) {
        setLocaleCookie(effectiveCultureCode);
        setIsLanguage(effectiveCultureCode);
      } else {
        console.warn(
          "⚠️ Login sonrası cultureCode bulunamadı, mevcut locale kullanılacak."
        );
      }

      const target = getDashboardPath(targetLocale);

      router.replace(target);
      router.refresh();
    } catch (err: any) {
      setError(
        err?.message && typeof err.message === "string"
          ? err.message
          : t("auth:login.error")
      );
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {t("auth:login.title")}
      </Typography>

      <TextField
        select
        fullWidth
        margin="normal"
        value={tenantKey}
        onChange={(e) => handleTenantChange(e.target.value)}
        label="Tenant"
        placeholder="Tenant seçiniz"
        InputProps={{
          sx: textFieldStyle,
          startAdornment: (
            <InputAdornment position="start">
              <BusinessIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      >
        {LOGIN_TENANT_OPTIONS.map((tenant) => (
          <MenuItem key={tenant.key} value={tenant.key}>
            {tenant.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        margin="normal"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label={t("auth:login.email")}
        placeholder={t("auth:login.emailPlaceholder")}
        autoComplete="email"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            passwordInputRef.current?.focus();
          }
        }}
        InputProps={{
          sx: textFieldStyle,
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        margin="normal"
        label={t("auth:login.password")}
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("auth:login.passwordPlaceholder")}
        autoComplete="current-password"
        inputRef={passwordInputRef}
        InputProps={{
          sx: textFieldStyle,
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((p) => !p)}
                edge="end"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
        }
        label={t("auth:login.rememberMe")}
        sx={{ mt: 1 }}
      />

      <Button
        fullWidth
        type="submit"
        variant="contained"
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={22} color="inherit" />
        ) : (
          t("auth:login.submit")
        )}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {typeof error === "string" ? error : JSON.stringify(error)}
        </Alert>
      )}

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: "pointer" }}
          onClick={() => router.push(`/${locale}/auth?tab=forgot`)}
        >
          {t("auth:login.forgotLink")}
        </Typography>

        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: "pointer" }}
          onClick={() => router.push(`/${locale}/auth?tab=register`)}
        >
          {t("auth:login.registerLink")}
        </Typography>
      </Stack>

      <AuthSocialButtons />
    </Box>
  );
}