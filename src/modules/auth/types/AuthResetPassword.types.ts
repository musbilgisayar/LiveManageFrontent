// src/modules/auth/types/AuthResetPassword.types.ts

export type ResetPasswordFormState = {
  email: string;
  newPassword: string;
  confirmPassword: string;
};

export type ResetPasswordFormErrors = {
  email?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
};

export type ResetPasswordRequestDto = {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
};

export type ResetPasswordResponseDto = {
  ok: boolean;
  message?: string;
  userMessage?: string;
  error?: string;
  title?: string;
};