//src/modules/users/components/detail/tabs/phone-manager/forms/phoneForm.schema_ultimate.ts

import {
  USER_PHONE_COUNTRY_CODE_MAX_LENGTH_ULTIMATE,
  USER_PHONE_LABEL_MAX_LENGTH_ULTIMATE,
  USER_PHONE_MAX_LENGTH_ULTIMATE,
  USER_PHONE_MIN_LENGTH_ULTIMATE,
} from "@/modules/users/constants/userPhone.constants_ultimate";
import type {
  UiUserPhoneErrorUltimate,
  UserPhoneFormValuesUltimate,
} from "@/modules/users/types/UserPhone.types_ultimate";

export interface PhoneFormValidationResultUltimate {
  isValid: boolean;
  fieldErrors: Record<string, string[]>;
}

export function validatePhoneFormUltimate(
  values: UserPhoneFormValuesUltimate,
  t: (key: string, vars?: Record<string, string | number>) => string
): PhoneFormValidationResultUltimate {
  const errors: Record<string, string[]> = {};

  const countryCode = (values.countryCode ?? "").trim();
  const phoneNumber = (values.phoneNumber ?? "").trim();
  const label = (values.label ?? "").trim();

  if (!countryCode) {
    errors.countryCode = [
      t("users:detail.phone.validation.countryCodeRequired"),
    ];
  } else {
    if (!countryCode.startsWith("+")) {
      errors.countryCode = [
        t("users:detail.phone.validation.invalidCountryCode"),
      ];
    }

    if (countryCode.length > USER_PHONE_COUNTRY_CODE_MAX_LENGTH_ULTIMATE) {
      errors.countryCode = [
        t("users:detail.phone.validation.invalidCountryCode"),
      ];
    }

    if (!/^\+\d+$/.test(countryCode)) {
      errors.countryCode = [
        t("users:detail.phone.validation.invalidCountryCode"),
      ];
    }
  }

  if (!phoneNumber) {
    errors.phoneNumber = [
      t("users:detail.phone.validation.phoneNumberRequired"),
    ];
  } else {
    const normalized = phoneNumber.replace(/[^\d]/g, "");
    if (
      normalized.length < USER_PHONE_MIN_LENGTH_ULTIMATE ||
      normalized.length > USER_PHONE_MAX_LENGTH_ULTIMATE
    ) {
      errors.phoneNumber = [
        t("users:detail.phone.validation.invalidPhoneNumber"),
      ];
    }
  }

  if (!values.phoneType) {
    errors.phoneType = [t("users:detail.phone.validation.phoneTypeRequired")];
  }

  if (label.length > USER_PHONE_LABEL_MAX_LENGTH_ULTIMATE) {
    errors.label = [
      t("users:detail.phone.validation.labelTooLong", {
        max: USER_PHONE_LABEL_MAX_LENGTH_ULTIMATE,
      }),
    ];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    fieldErrors: errors,
  };
}

export function mergeServerErrorsIntoFormUltimate(
  uiError: UiUserPhoneErrorUltimate | null | undefined
): Record<string, string[]> {
  return uiError?.fieldErrors ?? {};
}