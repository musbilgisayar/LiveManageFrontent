// src/modules/auth/components/AuthForgotForm.tsx

"use client";

import React from "react";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";

import { textFieldStyle } from "@/app/components/shared/styles";
import { useI18nNs } from "@/app/context/i18nContext";
import { useAuthForgotForm } from "../hooks/useAuthForgotForm";

export default function AuthForgotForm() {
  const { t } = useI18nNs(["auth"]);

  const {
    form,
    errors,
    sent,
    loading,
    successMessage,
    setEmail,
    submit,
  } = useAuthForgotForm(t);

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Typography variant="h6" gutterBottom>
        {t("auth:forgot.title")}
      </Typography>

      {!sent ? (
        <>
          <TextField
            fullWidth
            margin="normal"
            type="email"
            label={t("auth:forgot.email")}
            placeholder={t("auth:forgot.emailPlaceholder")}
            value={form.email}
            onChange={(event) => setEmail(event.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            autoComplete="email"
            InputProps={{
              sx: textFieldStyle,
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "primary.main" }} fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {errors.general && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.general}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? t("auth:forgot.sending") : t("auth:forgot.submit")}
          </Button>
        </>
      ) : (
        <Alert severity="success" sx={{ mt: 3 }}>
          {successMessage || t("auth:forgot.success")}
        </Alert>
      )}

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        {t("auth:forgot.backToLogin")}
      </Typography>
    </Box>
  );
}