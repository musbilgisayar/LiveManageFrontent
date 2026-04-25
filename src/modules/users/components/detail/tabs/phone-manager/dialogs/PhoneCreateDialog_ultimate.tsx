// src/modules/users/components/detail/tabs/phone-manager/dialogs/PhoneCreateDialog_ultimate.tsx

"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  MuiTelInput,
  matchIsValidTel,
  type MuiTelInputCountry,
  type MuiTelInputInfo,
} from "mui-tel-input";
import { useI18nNs } from "@/app/context/i18nContext";
import { useCreateUserPhoneNumberUltimate } from "@/modules/users/hooks/useCreateUserPhoneNumber_ultimate";
import type {
  UiUserPhoneErrorUltimate,
  UserPhoneFormValuesUltimate,
  UserPhoneNumberCreateRequestUltimate,
  UserPhoneTypeUltimate,
} from "@/modules/users/types/UserPhone.types_ultimate";

interface PropsUltimate {
  open: boolean;
  userId: string;
  onClose: () => void;
  onCreated?: () => Promise<void> | void;
  onSuccessMessage?: (message: string) => void;
}

type FormErrorsUltimate = Partial<
  Record<keyof UserPhoneFormValuesUltimate | "phone", string>
>;

type PhoneTypeOptionUltimate = {
  value: UserPhoneTypeUltimate;
  label: string;
  icon: React.ReactNode;
};

type PhoneTypeMenuSelectPropsUltimate = {
  value: UserPhoneTypeUltimate | "";
  onChange: (value: UserPhoneTypeUltimate) => void;
  onBlur?: () => void;
  disabled?: boolean;
  label: string;
  helperText?: string;
  error?: boolean;
  options: PhoneTypeOptionUltimate[];
};

const FORM_ID_ULTIMATE = "phone-create-form-ultimate";

const PHONE_COUNTRIES_ULTIMATE: MuiTelInputCountry[] = [
  "TR",
  "CH",
  "DE",
  "FR",
  "IT",
  "AT",
  "NL",
  "BE",
  "GB",
  "US",
];

function normalizeDigitsUltimate(value: string): string {
  return value.replace(/\D/g, "");
}

function getPhoneErrorMessageUltimate(error: unknown): string {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object") {
    const typedError = error as UiUserPhoneErrorUltimate;

    if (typedError.message?.trim()) {
      return typedError.message;
    }

    if (typedError.fieldErrors) {
      const firstFieldError = Object.values(typedError.fieldErrors)
        .flat()
        .find((item) => Boolean(item?.trim()));

      if (firstFieldError) {
        return firstFieldError;
      }
    }
  }

  return "An error occurred while creating the phone record.";
}

function buildCreatePayloadUltimate(
  userId: string,
  values: UserPhoneFormValuesUltimate,
  phoneInfo: MuiTelInputInfo | null
): UserPhoneNumberCreateRequestUltimate {
  const countryCallingCode = phoneInfo?.countryCallingCode?.trim() ?? "";
  const nationalNumber = normalizeDigitsUltimate(
    phoneInfo?.nationalNumber ?? values.phoneNumber
  );

  return {
    userId,
    phoneType: values.phoneType as UserPhoneTypeUltimate,
    countryCode: countryCallingCode ? `+${countryCallingCode}` : values.countryCode,
    phoneNumber: nationalNumber,
    label: values.label.trim() || null,
    isPrimary: values.isPrimary,
  };
}

function validateFormUltimate(
  values: UserPhoneFormValuesUltimate,
  phoneValue: string,
  phoneInfo: MuiTelInputInfo | null
): FormErrorsUltimate {
  const errors: FormErrorsUltimate = {};
  const nationalNumber = normalizeDigitsUltimate(
    phoneInfo?.nationalNumber ?? values.phoneNumber
  );

  if (!values.phoneType) {
    errors.phoneType = "Phone type is required.";
  }

  if (!phoneValue.trim()) {
    errors.phone = "Phone number is required.";
  } else if (
    !matchIsValidTel(phoneValue, {
      onlyCountries: PHONE_COUNTRIES_ULTIMATE,
    })
  ) {
    errors.phone = "Please enter a valid international phone number.";
  }

  if (!phoneInfo?.countryCallingCode && !values.countryCode) {
    errors.countryCode = "Country code is required.";
  }

  if (!nationalNumber) {
    errors.phoneNumber = "Phone number is required.";
  }

  if (values.label.trim().length > 50) {
    errors.label = "Label can be at most 50 characters.";
  }

  return errors;
}

function PhoneTypeMenuSelect_ultimate({
  value,
  onChange,
  onBlur,
  disabled = false,
  label,
  helperText,
  error = false,
  options,
}: PhoneTypeMenuSelectPropsUltimate) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const selectedOption =
    options.find((item) => item.value === value) ?? options[0] ?? null;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      return;
    }

    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    onBlur?.();
  };

  const handleSelect = (nextValue: UserPhoneTypeUltimate) => {
    onChange(nextValue);
    setAnchorEl(null);
    onBlur?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setAnchorEl(event.currentTarget as HTMLElement);
    }
  };

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.75, fontWeight: 700 }}
      >
        {label}
      </Typography>

      <Box
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open ? "true" : undefined}
        sx={{
          minHeight: 40,
          px: 1.5,
          py: 1,
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: error ? "error.main" : "divider",
          bgcolor: disabled ? "action.disabledBackground" : "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "120ms ease",
          "&:hover": {
            borderColor: disabled ? "divider" : "text.primary",
          },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontSize={14}>
            {selectedOption?.icon ?? "•"}
          </Typography>
          <Typography fontSize={14} fontWeight={500}>
            {selectedOption?.label ?? ""}
          </Typography>
        </Stack>

        <Typography fontSize={12} color="text.secondary">
          ▼
        </Typography>
      </Box>

      {helperText ? (
        <Typography
          variant="caption"
          color={error ? "error.main" : "text.secondary"}
          sx={{ display: "block", mt: 0.75 }}
        >
          {helperText}
        </Typography>
      ) : null}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        keepMounted
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: anchorEl?.clientWidth ?? 220,
            borderRadius: 2.5,
            boxShadow: 3,
            p: 0.5,
            "& .MuiMenuItem-root": {
              minHeight: 36,
              px: 1.25,
              py: 0.75,
              borderRadius: 1.5,
            },
          },
        }}
      >
        {options.map((item) => (
          <MenuItem
            key={item.value}
            selected={item.value === value}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => handleSelect(item.value)}
          >
            <Stack direction="row" spacing={1} alignItems="center" width="100%">
              <Typography fontSize={14}>{item.icon}</Typography>
              <Typography fontSize={14}>{item.label}</Typography>
              {item.value === value ? (
                <Typography sx={{ ml: "auto" }} fontSize={13}>
                  ✅
                </Typography>
              ) : null}
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default function PhoneCreateDialog_ultimate({
  open,
  userId,
  onClose,
  onCreated,
  onSuccessMessage,
}: PropsUltimate) {
  const { t } = useI18nNs(["users", "common"]);

  const tt = useCallback(
    (key: string, fallback: string) => {
      const translated = t(key);
      return translated && translated !== key ? translated : fallback;
    },
    [t]
  );

  const phoneTypeOptions = useMemo<PhoneTypeOptionUltimate[]>(
    () => [
      {
        value: "Mobile",
        label: tt("users:detail.phone.types.mobile", "Mobil"),
        icon: "📱",
      },
      {
        value: "Home",
        label: tt("users:detail.phone.types.home", "Ev"),
        icon: "🏠",
      },
      {
        value: "Work",
        label: tt("users:detail.phone.types.work", "İş"),
        icon: "💼",
      },
      {
        value: "Other",
        label: tt("users:detail.phone.types.other", "Diğer"),
        icon: "🔹",
      },
    ],
    [tt]
  );

  const { createPhone, isSubmitting, error, resetError } =
    useCreateUserPhoneNumberUltimate({
      onSuccess: async () => {
        await onCreated?.();
      },
    });

  const [values, setValues] = useState<UserPhoneFormValuesUltimate>({
    countryCode: "",
    phoneNumber: "",
    phoneType: "Mobile",
    label: "",
    isPrimary: false,
  });

  const [phoneValue, setPhoneValue] = useState("");
  const [phoneInfo, setPhoneInfo] = useState<MuiTelInputInfo | null>(null);
  const [errors, setErrors] = useState<FormErrorsUltimate>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof UserPhoneFormValuesUltimate | "phone", boolean>>
  >({});

  const submitErrorMessage = useMemo(
    () => getPhoneErrorMessageUltimate(error),
    [error]
  );

  const isPhoneValid = useMemo(() => {
    if (!phoneValue.trim()) {
      return false;
    }

    return matchIsValidTel(phoneValue, {
      onlyCountries: PHONE_COUNTRIES_ULTIMATE,
    });
  }, [phoneValue]);

  const resetFormUltimate = useCallback(() => {
    setValues({
      countryCode: "",
      phoneNumber: "",
      phoneType: "Mobile",
      label: "",
      isPrimary: false,
    });
    setPhoneValue("");
    setPhoneInfo(null);
    setErrors({});
    setTouched({});
  }, []);

  const handleClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    resetError();
    resetFormUltimate();
    onClose();
  }, [isSubmitting, onClose, resetError, resetFormUltimate]);

  const validateAndSetErrorsUltimate = useCallback(
    (
      nextValues: UserPhoneFormValuesUltimate,
      nextPhoneValue: string,
      nextPhoneInfo: MuiTelInputInfo | null
    ) => {
      const nextErrors = validateFormUltimate(
        nextValues,
        nextPhoneValue,
        nextPhoneInfo
      );
      setErrors(nextErrors);
      return nextErrors;
    },
    []
  );

  const handlePhoneChange = useCallback(
    (nextPhoneValue: string, info: MuiTelInputInfo) => {
      const nextCountryCode = info.countryCallingCode
        ? `+${info.countryCallingCode}`
        : "";
      const nextPhoneNumber = normalizeDigitsUltimate(
        info.nationalNumber ?? ""
      );

      const nextValues: UserPhoneFormValuesUltimate = {
        ...values,
        countryCode: nextCountryCode,
        phoneNumber: nextPhoneNumber,
      };

      setPhoneValue(nextPhoneValue);
      setPhoneInfo(info);
      setValues(nextValues);

      if (touched.phone || touched.countryCode || touched.phoneNumber) {
        validateAndSetErrorsUltimate(nextValues, nextPhoneValue, info);
      }
    },
    [
      touched.phone,
      touched.countryCode,
      touched.phoneNumber,
      validateAndSetErrorsUltimate,
      values,
    ]
  );

  const handleBlurFieldUltimate = useCallback(
    (field: keyof UserPhoneFormValuesUltimate | "phone") => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateAndSetErrorsUltimate(values, phoneValue, phoneInfo);
    },
    [phoneInfo, phoneValue, validateAndSetErrorsUltimate, values]
  );

  const handlePhoneTypeChange = useCallback(
    (nextValue: UserPhoneTypeUltimate) => {
      const nextValues: UserPhoneFormValuesUltimate = {
        ...values,
        phoneType: nextValue,
      };

      setValues(nextValues);

      if (touched.phoneType) {
        validateAndSetErrorsUltimate(nextValues, phoneValue, phoneInfo);
      }
    },
    [phoneInfo, phoneValue, touched.phoneType, validateAndSetErrorsUltimate, values]
  );

  const handleLabelChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValues: UserPhoneFormValuesUltimate = {
        ...values,
        label: event.target.value,
      };

      setValues(nextValues);

      if (touched.label) {
        validateAndSetErrorsUltimate(nextValues, phoneValue, phoneInfo);
      }
    },
    [phoneInfo, phoneValue, touched.label, validateAndSetErrorsUltimate, values]
  );

  const handlePrimaryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({
        ...prev,
        isPrimary: event.target.checked,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setTouched({
        phone: true,
        countryCode: true,
        phoneNumber: true,
        phoneType: true,
        label: true,
        isPrimary: true,
      });

      const nextErrors = validateAndSetErrorsUltimate(
        values,
        phoneValue,
        phoneInfo
      );

      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      const payload = buildCreatePayloadUltimate(userId, values, phoneInfo);
      await createPhone(payload);

      onSuccessMessage?.(
        tt("users:detail.phone.createSuccess", "Telefonnummer erfolgreich hinzugefügt.")
      );
      handleClose();
    },
    [
      createPhone,
      handleClose,
      onSuccessMessage,
      phoneInfo,
      phoneValue,
      tt,
      userId,
      validateAndSetErrorsUltimate,
      values,
    ]
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {tt("users:detail.phone.addTitle", "Neue Telefonnummer hinzufügen")}
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Box
          component="form"
          id={FORM_ID_ULTIMATE}
          onSubmit={handleSubmit}
          noValidate
        >
          <Stack spacing={2}>
            {submitErrorMessage ? (
              <Alert severity="error">{submitErrorMessage}</Alert>
            ) : null}

            <Typography variant="body2" color="text.secondary">
              {tt("users:detail.phone.quickHint", "Telefoninformation schnell hinzufügen.")}
            </Typography>

            <MuiTelInput
              value={phoneValue}
              onChange={handlePhoneChange}
              onBlur={() => handleBlurFieldUltimate("phone")}
              defaultCountry="CH"
              forceCallingCode
              focusOnSelectCountry
              onlyCountries={PHONE_COUNTRIES_ULTIMATE}
              preferredCountries={["CH", "DE", "TR"]}
              langOfCountryName="de"
              disableDropdown={false}
              disabled={isSubmitting}
              label={tt("users:detail.phone.phoneNumber", "Telefonnummer")}
              placeholder="+41 77 950 69 73"
              fullWidth
              error={Boolean(
                (touched.phone || touched.countryCode || touched.phoneNumber) &&
                  (errors.phone || errors.countryCode || errors.phoneNumber)
              )}
              helperText={
                (touched.phone || touched.countryCode || touched.phoneNumber) &&
                (errors.phone || errors.countryCode || errors.phoneNumber)
                  ? errors.phone || errors.countryCode || errors.phoneNumber
                  : tt(
                      "users:detail.phone.phoneHelp",
                      "Flagge, Ländervorwahl und Format werden automatisch geprüft."
                    )
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                },
              }}
            />

            <PhoneTypeMenuSelect_ultimate
              value={values.phoneType}
              onChange={handlePhoneTypeChange}
              onBlur={() => handleBlurFieldUltimate("phoneType")}
              disabled={isSubmitting}
              label={tt("users:detail.phone.phoneType", "Telefontyp")}
              error={Boolean(touched.phoneType && errors.phoneType)}
              helperText={
                touched.phoneType && errors.phoneType
                  ? errors.phoneType
                  : tt(
                      "users:detail.phone.phoneTypeHelp",
                      "Wählen Sie den passenden Typ für diese Nummer."
                    )
              }
              options={phoneTypeOptions}
            />

            <TextField
              fullWidth
              size="small"
              label={tt("users:detail.phone.label", "Bezeichnung")}
              value={values.label}
              onChange={handleLabelChange}
              onBlur={() => handleBlurFieldUltimate("label")}
              disabled={isSubmitting}
              error={Boolean(touched.label && errors.label)}
              helperText={
                touched.label && errors.label
                  ? errors.label
                  : tt(
                      "users:detail.phone.labelHelp",
                      "Z. B.: Privat, Büro, Notfall"
                    )
              }
              placeholder={tt("users:detail.phone.labelPlaceholder", "Privat")}
              inputProps={{ maxLength: 50 }}
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
                bgcolor: values.isPrimary ? "action.selected" : "transparent",
                transition: "150ms ease",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {tt("users:detail.phone.isPrimary", "Primäre Telefonnummer")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {tt(
                      "users:detail.phone.isPrimaryHelp",
                      "Wird als Standard-Telefonnummer verwendet."
                    )}
                  </Typography>
                </Box>

                <Switch
                  checked={values.isPrimary}
                  onChange={handlePrimaryChange}
                  disabled={isSubmitting}
                />
              </Stack>
            </Box>

            <Box sx={{ display: "none" }}>
              <TextField name="countryCode" value={values.countryCode} />
              <TextField name="phoneNumber" value={values.phoneNumber} />
            </Box>

            {!isPhoneValid && phoneValue.trim() ? (
              <Typography variant="caption" color="warning.main">
                {tt(
                  "users:detail.phone.invalidHint",
                  "Die Nummer ist für das gewählte Land noch unvollständig oder ungültig."
                )}
              </Typography>
            ) : null}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          {tt("common:cancel", "Abbrechen")}
        </Button>

        <Button
          type="submit"
          form={FORM_ID_ULTIMATE}
          variant="contained"
          disabled={isSubmitting}
        >
          {tt("common:save", "Speichern")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}