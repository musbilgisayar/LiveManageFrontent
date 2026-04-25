// src/modules/users/types/UserPhone.types_ultimate.ts

export type UserPhoneTypeUltimate = "Mobile" | "Home" | "Work" | "Other";

export type UserPhoneFormPhoneTypeUltimate = 0 | 1 | 2 | 3;

export interface UserPhoneNumberDtoUltimate {
  phoneId: string;
  userId: string;
  phoneType: UserPhoneTypeUltimate;
  countryCode: string;
  phoneNumber: string;
  label?: string | null;
  isPrimary: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPhoneNumberCreateRequestUltimate {
  userId: string;
  phoneType: UserPhoneTypeUltimate;
  countryCode: string;
  phoneNumber: string;
  label?: string | null;
  isPrimary: boolean;
}

export interface UserPhoneNumberUpdateRequestUltimate {
  phoneId: string;
  userId: string;
  phoneType: UserPhoneTypeUltimate;
  countryCode: string;
  phoneNumber: string;
  label?: string | null;
  isPrimary: boolean;
}

export interface UserPhoneFormValuesUltimate {
  countryCode: string;
  phoneNumber: string;
  phoneType: UserPhoneFormPhoneTypeUltimate | "";
  label: string;
  isPrimary: boolean;
}

export interface UserPhoneListResponseUltimate {
  items: UserPhoneNumberDtoUltimate[];
}

export interface UiUserPhoneErrorUltimate {
  code?: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  status?: number;
}

export interface UserPhoneOptionUltimate {
  value: UserPhoneTypeUltimate;
  label: string;
}

export interface GenericApiEnvelopeUltimate<T> {
  success?: boolean;
  succeeded?: boolean;
  message?: string;
  userMessage?: string;
  errorCode?: string;
  errors?: Record<string, string[]>;
  data?: T;
}