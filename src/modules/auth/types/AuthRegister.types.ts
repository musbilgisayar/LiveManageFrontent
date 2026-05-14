// src/modules/auth/types/AuthRegister.types.ts

export type RegisterFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

export type RegisterFormErrors = Record<string, string[]>;

export type RegisterPayloadDto = {
  email: string;
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  displayName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  cultureCode: string;
  timeZone: string;
  password: string;
  requireEmailConfirmation: boolean;
  twoFactorEnabled: boolean;
};

export type RegisterApiError = {
  ok: false;
  data?: null;
  error: string;
  userMessage?: string;
  details?: Record<string, unknown> | string;
};

export type RegisterApiSuccess = {
  ok: true;
  data: unknown;
  userMessage?: string;
};

export type RegisterApiResponse = RegisterApiError | RegisterApiSuccess;

export type SplitPhoneResult = {
  phoneCountryCode: string;
  phoneNumber: string;
};