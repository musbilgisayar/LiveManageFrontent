// src/modules/auth/components/AuthRegisterForm.tsx

"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { textFieldStyle } from "@/app/components/shared/styles";
import { useI18nNs } from "@/app/context/i18nContext";
import IntlPhoneField from "@/app/components/input/IntlPhoneField";
import { asText } from "../utils/authRegisterApi.utils";
import { useAuthRegisterForm } from "../hooks/useAuthRegisterForm";

type AuthRegisterFormProps = {
  subtext?: React.ReactNode;
  subtitle?: React.ReactNode;
};

export default function AuthRegisterForm({
  subtext,
  subtitle,
}: AuthRegisterFormProps) {
  const { t } = useI18nNs(["auth", "validation"]);
  const router = useRouter();
  const params = useParams() as { locale?: string };

  const activeLocale = (params?.locale || "tr").split("-")[0].toLowerCase();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { form, errors, loading, setField, submit } = useAuthRegisterForm({
    t,
    onSuccess: () => {
      router.push(`/${activeLocale}/email/verify-email`);
    },
  });

  const fieldProps = (name: keyof typeof form) => {
    const key = name.toLowerCase();

    return {
      error: !!errors[key]?.length,
      helperText: errors[key]?.[0] ? asText(errors[key][0]) : undefined,
      required: name !== "phoneNumber",
      InputProps: { sx: textFieldStyle },
    };
  };

  const rules = [
    { test: /.{8,}/, label: t("auth:passwordRules.minLength") },
    { test: /[A-Z]/, label: t("auth:passwordRules.uppercase") },
    { test: /[a-z]/, label: t("auth:passwordRules.lowercase") },
    { test: /\d/, label: t("auth:passwordRules.number") },
  ];

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {t("auth:register.title")}
      </Typography>

      {!!errors.general?.length && (
        <Typography color="error" sx={{ mb: 2 }}>
          {asText(errors.general[0])}
        </Typography>
      )}

      {subtext}

      <TextField
        fullWidth
        margin="normal"
        name="firstName"
        value={form.firstName}
        onChange={(event) => setField("firstName", event.target.value)}
        label={t("auth:register.firstName")}
        placeholder={t("auth:register.firstNamePlaceholder")}
        {...fieldProps("firstName")}
        InputProps={{
          ...fieldProps("firstName").InputProps,
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        margin="normal"
        name="lastName"
        value={form.lastName}
        onChange={(event) => setField("lastName", event.target.value)}
        label={t("auth:register.lastName")}
        placeholder={t("auth:register.lastNamePlaceholder")}
        {...fieldProps("lastName")}
        InputProps={{
          ...fieldProps("lastName").InputProps,
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        margin="normal"
        name="email"
        type="email"
        value={form.email}
        onChange={(event) => setField("email", event.target.value)}
        label={t("auth:register.email")}
        placeholder={t("auth:register.emailPlaceholder")}
        {...fieldProps("email")}
        InputProps={{
          ...fieldProps("email").InputProps,
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ mt: 2 }}>
        <IntlPhoneField
          label={t("auth:register.phone")}
          value={form.phoneNumber}
          onChange={(value) => setField("phoneNumber", value || "")}
          error={!!errors.phonenumber?.length}
          helperText={
            errors.phonenumber?.[0] ? asText(errors.phonenumber[0]) : undefined
          }
          defaultCountry={
            (typeof navigator !== "undefined"
              ? navigator.language?.split("-")[1] || "TR"
              : "TR") as any
          }
        />
      </Box>

      <Tooltip
        placement="right"
        arrow
        title={
          <Stack spacing={0.5}>
            {rules.map((rule, index) => {
              const valid = rule.test.test(form.password);

              return (
                <Stack
                  key={index}
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                >
                  {valid ? (
                    <CheckCircleIcon fontSize="small" />
                  ) : (
                    <CancelIcon fontSize="small" />
                  )}

                  <Typography
                    variant="caption"
                    sx={{ color: valid ? "success.dark" : "error.dark" }}
                  >
                    {rule.label}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        }
      >
        <TextField
          fullWidth
          margin="normal"
          name="password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(event) => setField("password", event.target.value)}
          label={t("auth:register.password")}
          placeholder={t("auth:register.passwordPlaceholder")}
          {...fieldProps("password")}
          InputProps={{
            ...fieldProps("password").InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
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
      </Tooltip>

      <TextField
        fullWidth
        margin="normal"
        name="confirmPassword"
        type={showConfirmPassword ? "text" : "password"}
        value={form.confirmPassword}
        onChange={(event) => setField("confirmPassword", event.target.value)}
        label={t("auth:register.confirmPassword")}
        placeholder={t("auth:register.confirmPasswordPlaceholder")}
        error={!!errors.confirmpassword?.length}
        helperText={
          errors.confirmpassword?.[0]
            ? asText(errors.confirmpassword[0])
            : undefined
        }
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
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                edge="end"
              >
                {showConfirmPassword ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        fullWidth
        type="submit"
        variant="contained"
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? t("auth:register.sending") : t("auth:register.submit")}
      </Button>

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        {t("auth:register.alreadyUser")}
      </Typography>

      {subtitle}
    </Box>
  );
}