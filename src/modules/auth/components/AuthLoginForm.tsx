// src/modules/auth/components/AuthLoginForm.tsx

"use client";

import React from "react";
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
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { setTenantKey } from "@/utils/tenant.client";
import { textFieldStyle } from "@/app/components/shared/styles";
import { useAuth } from "@/app/context/AuthContext";
import { useI18nNs } from "@/app/context/i18nContext";
import { useAuthLoginForm } from "../hooks/useAuthLoginForm";
import AuthSocialButtons from "./AuthSocialButtons";

const LOGIN_TENANT_OPTIONS = [
  { key: "livemanage", label: "LiveManage" },
  { key: "kulturtisch", label: "KulturTisch" },
  { key: "system", label: "Administration" },
  { key: "demo", label: "Demo" },
];

export default function AuthLoginForm() {
  const { t } = useI18nNs(["auth"]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useParams() as { locale: string };
  const { refreshUser } = useAuth();

  const {
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
  } = useAuthLoginForm({
    t,
    locale,
    returnUrl: searchParams.get("returnUrl"),
    onSuccess: async (redirectTo) => {
      await refreshUser();
      router.replace(redirectTo);
      router.refresh();
    },
  });

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {t("auth:login.title")}
      </Typography>

      <TextField
        select
        fullWidth
        margin="normal"
        value={form.tenantKey}
        onChange={(event) => setTenant(event.target.value)}
        label={t("auth:login.tenant")}
        placeholder={t("auth:login.tenantPlaceholder")}
        error={!!errors.tenantKey}
        helperText={errors.tenantKey}
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
        value={form.identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        label={t("auth:login.email")}
        placeholder={t("auth:login.emailPlaceholder")}
        autoComplete="email"
        error={!!errors.identifier}
        helperText={errors.identifier}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
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
        value={form.password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder={t("auth:login.passwordPlaceholder")}
        autoComplete="current-password"
        inputRef={passwordInputRef}
        error={!!errors.password}
        helperText={errors.password}
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
                onClick={togglePassword}
                edge="end"
                aria-label={
                  showPassword
                    ? t("auth:login.hidePassword")
                    : t("auth:login.showPassword")
                }
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
            checked={form.rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
        }
        label={t("auth:login.rememberMe")}
        sx={{ mt: 1 }}
      />

      {errors.general && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.general}
        </Alert>
      )}

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

      <AuthSocialButtons
        locale={locale}
        rememberMe={form.rememberMe}
        tenantKey={form.tenantKey}
        disabled={loading}
        onStart={clearGeneralError}
        onError={setGeneralError}

        
         onSuccess={async (redirectTo, resolvedTenantKey) => {
  if (resolvedTenantKey) {
    setTenantKey(resolvedTenantKey);
  }

  await refreshUser();
  router.replace(redirectTo);
  router.refresh();
}}


      />
    </Box>
  );
}
