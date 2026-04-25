// src/modules/users/constants/userPhone.constants_ultimate.ts

import type {
  UserPhoneFormValuesUltimate,
  UserPhoneTypeUltimate,
} from "../types/UserPhone.types_ultimate";

export const USER_PHONE_API_BASE_ULTIMATE =
  "/api/v1.0/userprofile/phone-numbers-ultimate";

export const USER_PHONE_TYPE_VALUES_ULTIMATE: readonly UserPhoneTypeUltimate[] = [
  "Mobile",
  "Home",
  "Work",
  "Other",
] as const;

export const USER_PHONE_INITIAL_FORM_VALUES_ULTIMATE: UserPhoneFormValuesUltimate =
  {
    countryCode: "",
    phoneNumber: "",
    phoneType: "",
    label: "",
    isPrimary: false,
  };

export const USER_PHONE_MIN_LENGTH_ULTIMATE = 4;
export const USER_PHONE_MAX_LENGTH_ULTIMATE = 32;
export const USER_PHONE_COUNTRY_CODE_MAX_LENGTH_ULTIMATE = 8;
export const USER_PHONE_LABEL_MAX_LENGTH_ULTIMATE = 100;