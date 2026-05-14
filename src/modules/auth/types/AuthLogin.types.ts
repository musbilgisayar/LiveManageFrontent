//src/modules/auth/types/AuthLogin.types.ts

export type LoginRequestDto = {
  identifier: string;
  password: string;
  rememberMe: boolean;
};

export type AuthenticatedUserDto = {
  id: string;
  roles: string[];
  role?: string;
  primaryRole?: string;
};

export type LoginResponseDto = {
  ok: boolean;
  message?: string;
  error?: string;
  title?: string;
  data?: {
    redirectTo?: string;
    cultureCode?: string;
    user?: AuthenticatedUserDto;
  };
};

export type LoginFormState = {
  identifier: string;
  password: string;
  rememberMe: boolean;
  tenantKey: string;
};

export type LoginFormErrors = {
  identifier?: string;
  password?: string;
  tenantKey?: string;
  general?: string;
};