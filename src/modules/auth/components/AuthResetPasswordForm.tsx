"use client";

import React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { textFieldStyle } from "@/app/components/shared/styles";
import { useI18nNs } from "@/app/context/i18nContext";
import { useAuthResetPasswordForm } from "../hooks/useAuthResetPasswordForm";

export default function AuthResetPasswordForm() {
  const { t } = useI18nNs(["auth", "validation"]);
  const {
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
  } = useAuthResetPasswordForm(t);

  if (done) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h6" color="success.main">
          {t("auth:reset.success")}
        </Typography>

        <Typography variant="body2" sx={{ mt: 1 }}>
          {t("auth:forgot.backToLogin")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      sx={{ maxWidth: 400, mx: "auto", mt: 6 }}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Typography variant="h5" gutterBottom>
        {t("auth:reset.title")}
      </Typography>

      <TextField
        fullWidth
        margin="normal"
        label={t("auth:reset.email")}
        type="email"
        value={form.email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={t("auth:reset.emailPlaceholder")}
        error={!!errors.email}
        helperText={errors.email}
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
        label={t("auth:reset.newPassword")}
        type={showPassword ? "text" : "password"}
        value={form.newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        placeholder={t("auth:reset.newPasswordPlaceholder")}
        error={!!errors.newPassword}
        helperText={errors.newPassword}
        InputProps={{
          sx: textFieldStyle,
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={togglePassword} edge="end">
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

      <TextField
        fullWidth
        margin="normal"
        label={t("auth:reset.confirmPassword")}
        type={showPassword ? "text" : "password"}
        value={form.confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder={t("auth:reset.confirmPasswordPlaceholder")}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        InputProps={{ sx: textFieldStyle }}
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
        sx={{ mt: 3 }}
        disabled={loading}
      >
        {loading ? (
          <>
            <CircularProgress size={18} sx={{ mr: 1, color: "inherit" }} />
            {t("auth:reset.sending")}
          </>
        ) : (
          t("auth:reset.submit")
        )}
      </Button>
    </Box>
  );
}