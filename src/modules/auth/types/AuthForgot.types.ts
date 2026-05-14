// src/modules/auth/types/AuthForgot.types.ts

export type ForgotPasswordRequestDto = {
  email: string;
};

export type ForgotPasswordResponseDto = {
  ok: boolean;
  message?: string;
  userMessage?: string;
  error?: string;
  title?: string;
};

export type ForgotPasswordFormState = {
  email: string;
};

export type ForgotPasswordFormErrors = {
  email?: string;
  general?: string;
};