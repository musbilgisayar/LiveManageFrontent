// src/modules/users/components/detail/tabs/phone-manager/forms/PhoneForm_ultimate.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  FormControl,
  FormHelperText,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

export type UserPhoneFormValuesUltimate = {
  countryCode: string;
  phoneNumber: string;
  phoneType: number;
  label: string;
  isPrimary: boolean;
};

type PropsUltimate = {
  t: (key: string) => string;
  isSubmitting?: boolean;
  submitError?: string | null;
  initialValues?: Partial<UserPhoneFormValuesUltimate>;
  onSubmit: (values: UserPhoneFormValuesUltimate) => Promise<void> | void;
};

type FormErrorsUltimate = Partial<Record<keyof UserPhoneFormValuesUltimate, string>>;

type CountryOptionUltimate = {
  code: string;
  shortLabel: string;
  fullLabel: string;
  placeholder: string;
  maxDigits: number;
};

type PhoneTypeOptionUltimate = {
  value: number;
  icon: string;
  label: string;
};

const COUNTRY_OPTIONS_ULTIMATE: CountryOptionUltimate[] = [
  {
    code: "+90",
    shortLabel: "🇹🇷 +90",
    fullLabel: "🇹🇷 Türkiye (+90)",
    placeholder: "5XX XXX XX XX",
    maxDigits: 10,
  },
  {
    code: "+41",
    shortLabel: "🇨🇭 +41",
    fullLabel: "🇨🇭 Schweiz (+41)",
    placeholder: "7X XXX XX XX",
    maxDigits: 9,
  },
  {
    code: "+49",
    shortLabel: "🇩🇪 +49",
    fullLabel: "🇩🇪 Deutschland (+49)",
    placeholder: "15X XXXX XXXX",
    maxDigits: 12,
  },
  {
    code: "+33",
    shortLabel: "🇫🇷 +33",
    fullLabel: "🇫🇷 France (+33)",
    placeholder: "6 XX XX XX XX",
    maxDigits: 9,
  },
  {
    code: "+39",
    shortLabel: "🇮🇹 +39",
    fullLabel: "🇮🇹 Italia (+39)",
    placeholder: "3XX XXX XXXX",
    maxDigits: 10,
  },
];

const PHONE_TYPE_OPTIONS_ULTIMATE: PhoneTypeOptionUltimate[] = [
  { value: 0, icon: "📱", label: "Mobil" },
  { value: 1, icon: "🏠", label: "Ev" },
  { value: 2, icon: "💼", label: "İş" },
  { value: 3, icon: "🔹", label: "Diğer" },
];

function getCountryConfigUltimate(countryCode: string): CountryOptionUltimate {
  return (
    COUNTRY_OPTIONS_ULTIMATE.find((item) => item.code === countryCode) ??
    COUNTRY_OPTIONS_ULTIMATE[0]
  );
}

function onlyDigitsUltimate(value: string): string {
  return value.replace(/\D/g, "");
}

function formatPhoneByCountryUltimate(countryCode: string, rawValue: string): string {
  const digits = onlyDigitsUltimate(rawValue);
  const config = getCountryConfigUltimate(countryCode);
  const trimmed = digits.slice(0, config.maxDigits);

  if (countryCode === "+90") {
    const p1 = trimmed.slice(0, 3);
    const p2 = trimmed.slice(3, 6);
    const p3 = trimmed.slice(6, 8);
    const p4 = trimmed.slice(8, 10);
    return [p1, p2, p3, p4].filter(Boolean).join(" ");
  }

  if (countryCode === "+41") {
    const p1 = trimmed.slice(0, 2);
    const p2 = trimmed.slice(2, 5);
    const p3 = trimmed.slice(5, 7);
    const p4 = trimmed.slice(7, 9);
    return [p1, p2, p3, p4].filter(Boolean).join(" ");
  }

  if (countryCode === "+49") {
    const p1 = trimmed.slice(0, 3);
    const p2 = trimmed.slice(3, 7);
    const p3 = trimmed.slice(7, 12);
    return [p1, p2, p3].filter(Boolean).join(" ");
  }

  if (countryCode === "+33") {
    const p1 = trimmed.slice(0, 1);
    const p2 = trimmed.slice(1, 3);
    const p3 = trimmed.slice(3, 5);
    const p4 = trimmed.slice(5, 7);
    const p5 = trimmed.slice(7, 9);
    return [p1, p2, p3, p4, p5].filter(Boolean).join(" ");
  }

  if (countryCode === "+39") {
    const p1 = trimmed.slice(0, 3);
    const p2 = trimmed.slice(3, 6);
    const p3 = trimmed.slice(6, 10);
    return [p1, p2, p3].filter(Boolean).join(" ");
  }

  return trimmed;
}

function validateFormUltimate(values: UserPhoneFormValuesUltimate): FormErrorsUltimate {
  const errors: FormErrorsUltimate = {};
  const digits = onlyDigitsUltimate(values.phoneNumber);
  const config = getCountryConfigUltimate(values.countryCode);

  if (!values.countryCode) {
    errors.countryCode = "Ülke kodu zorunludur.";
  }

  if (!digits) {
    errors.phoneNumber = "Telefon numarası zorunludur.";
  } else if (digits.length < 6) {
    errors.phoneNumber = "Telefon numarası çok kısa.";
  } else if (digits.length > config.maxDigits) {
    errors.phoneNumber = "Telefon numarası çok uzun.";
  }

  if (values.label.trim().length > 50) {
    errors.label = "Etiket en fazla 50 karakter olabilir.";
  }

  return errors;
}

export default function PhoneForm_ultimate({
  t,
  isSubmitting = false,
  submitError = null,
  initialValues,
  onSubmit,
}: PropsUltimate) {
  const [values, setValues] = useState<UserPhoneFormValuesUltimate>({
    countryCode: initialValues?.countryCode ?? "+90",
    phoneNumber: formatPhoneByCountryUltimate(
      initialValues?.countryCode ?? "+90",
      initialValues?.phoneNumber ?? ""
    ),
    phoneType: initialValues?.phoneType ?? 0,
    label: initialValues?.label ?? "",
    isPrimary: initialValues?.isPrimary ?? false,
  });

  const [errors, setErrors] = useState<FormErrorsUltimate>({});
  const [touched, setTouched] = useState<Partial<Record<keyof UserPhoneFormValuesUltimate, boolean>>>(
    {}
  );

  const selectedCountry = useMemo(
    () => getCountryConfigUltimate(values.countryCode),
    [values.countryCode]
  );

  useEffect(() => {
    setValues((prev) => ({
      ...prev,
      phoneNumber: formatPhoneByCountryUltimate(prev.countryCode, prev.phoneNumber),
    }));
  }, [values.countryCode]);

  function updateFieldUltimate<K extends keyof UserPhoneFormValuesUltimate>(
    field: K,
    value: UserPhoneFormValuesUltimate[K]
  ) {
    setValues((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "countryCode") {
        next.phoneNumber = formatPhoneByCountryUltimate(
          value as string,
          prev.phoneNumber
        );
      }

      return next;
    });

    setErrors((prev) => {
      const nextValues =
        field === "countryCode"
          ? {
              ...values,
              countryCode: value as string,
              phoneNumber: formatPhoneByCountryUltimate(value as string, values.phoneNumber),
            }
          : { ...values, [field]: value };

      const nextErrors = validateFormUltimate(nextValues);
      return { ...prev, [field]: nextErrors[field] };
    });
  }

  function markTouchedUltimate(field: keyof UserPhoneFormValuesUltimate) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateFormUltimate(values));
  }

  async function handleSubmitUltimate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateFormUltimate(values);
    setErrors(nextErrors);
    setTouched({
      countryCode: true,
      phoneNumber: true,
      phoneType: true,
      label: true,
      isPrimary: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      ...values,
      phoneNumber: onlyDigitsUltimate(values.phoneNumber),
      label: values.label.trim(),
    });
  }

  const phoneTypeLabel =
    PHONE_TYPE_OPTIONS_ULTIMATE.find((item) => item.value === values.phoneType)?.label ?? "Mobil";

  return (
    <Box
      component="form"
      onSubmit={handleSubmitUltimate}
      noValidate
      sx={{ pt: 1.5 }}
    >
      <Stack spacing={2}>
        {submitError ? <Alert severity="error">{submitError}</Alert> : null}

        <Stack spacing={0.75}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {t("users:detail.phone.addTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Telefon bilgisini hızlıca ekleyin.
          </Typography>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            Telefon
          </Typography>

          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <FormControl
              size="small"
              sx={{ minWidth: 120, flexShrink: 0 }}
              error={Boolean(touched.countryCode && errors.countryCode)}
            >
              <Select
                value={values.countryCode}
                onChange={(event) =>
                  updateFieldUltimate("countryCode", event.target.value as string)
                }
                onBlur={() => markTouchedUltimate("countryCode")}
                displayEmpty
                sx={{
                  borderRadius: 2.5,
                  "& .MuiSelect-select": {
                    py: 1.15,
                    fontWeight: 600,
                  },
                }}
                renderValue={(selected) => {
                  const option = getCountryConfigUltimate(selected);
                  return option.shortLabel;
                }}
              >
                {COUNTRY_OPTIONS_ULTIMATE.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.fullLabel}
                  </MenuItem>
                ))}
              </Select>
              {touched.countryCode && errors.countryCode ? (
                <FormHelperText>{errors.countryCode}</FormHelperText>
              ) : null}
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label={t("users:detail.phone.phoneNumber")}
              value={values.phoneNumber}
              onChange={(event) =>
                updateFieldUltimate(
                  "phoneNumber",
                  formatPhoneByCountryUltimate(values.countryCode, event.target.value)
                )
              }
              onBlur={() => markTouchedUltimate("phoneNumber")}
              error={Boolean(touched.phoneNumber && errors.phoneNumber)}
              helperText={
                touched.phoneNumber && errors.phoneNumber
                  ? errors.phoneNumber
                  : selectedCountry.placeholder
              }
              placeholder={selectedCountry.placeholder}
              autoComplete="tel-national"
              inputMode="numeric"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Chip
                      size="small"
                      label={selectedCountry.shortLabel}
                      variant="outlined"
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Stack>

        <Stack spacing={0.9}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            Telefon Türü
          </Typography>

          <ToggleButtonGroup
            exclusive
            value={values.phoneType}
            onChange={(_, nextValue: number | null) => {
              if (nextValue === null) return;
              updateFieldUltimate("phoneType", nextValue);
            }}
            size="small"
            sx={{
              flexWrap: "wrap",
              gap: 1,
              "& .MuiToggleButton-root": {
                borderRadius: 999,
                px: 1.5,
                py: 0.75,
                border: "1px solid",
                borderColor: "divider",
                textTransform: "none",
                fontWeight: 600,
              },
              "& .Mui-selected": {
                fontWeight: 700,
              },
            }}
          >
            {PHONE_TYPE_OPTIONS_ULTIMATE.map((item) => (
              <ToggleButton key={item.value} value={item.value}>
                {item.icon} {item.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Typography variant="caption" color="text.secondary">
            Seçili tür: {phoneTypeLabel}
          </Typography>
        </Stack>

        <TextField
          fullWidth
          size="small"
          label={t("users:detail.phone.label")}
          value={values.label}
          onChange={(event) => updateFieldUltimate("label", event.target.value)}
          onBlur={() => markTouchedUltimate("label")}
          error={Boolean(touched.label && errors.label)}
          helperText={
            touched.label && errors.label
              ? errors.label
              : "Örn: Kişisel, Ofis, Acil"
          }
          placeholder="Kişisel"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
            },
          }}
        />

        <Box
          sx={{
            border: "1px solid",
            borderColor: values.isPrimary ? "primary.main" : "divider",
            borderRadius: 3,
            px: 1.5,
            py: 1.25,
            transition: "150ms ease",
            bgcolor: values.isPrimary ? "action.selected" : "transparent",
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {t("users:detail.phone.isPrimary")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Varsayılan telefon olarak kullanılacaktır.
              </Typography>
            </Box>

            <Switch
              checked={values.isPrimary}
              onChange={(event) =>
                updateFieldUltimate("isPrimary", event.target.checked)
              }
              disabled={isSubmitting}
            />
          </Stack>
        </Box>

        <input type="submit" hidden disabled={isSubmitting} />
      </Stack>
    </Box>
  );
}