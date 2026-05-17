//src/modules/auth/types/AuthLogin.types.ts

export type LoginRequestDto = {
  identifier: string;
  password: string;
  rememberMe: boolean;
};

export type AuthenticatedUserDto = {
  id: string;

  email?: string;
  fullName?: string;

  tenantId?: string;
  tenantKey?: string;

  cultureCode?: string;

  roles: string[];
  role?: string;
  primaryRole?: string;
};

export type LoginResponseDto = {
  ok: boolean;
  message?: string;
  userMessage?: string;
  error?: string;
  title?: string;
  data?: {
    redirectTo?: string;
    cultureCode?: string;
    user?: AuthenticatedUserDto;
  };
};

export type GoogleLoginRequestDto = {
  idToken: string;
  clientType: "web";
  deviceId?: string | null;
  rememberMe: boolean;
  cultureCode?: string;
  timeZone?: string;
};

export type GoogleLoginResponseDto = LoginResponseDto & {
  data?: {
    isSuccess?: boolean;
    provider?: "Google" | string;
    userCreated?: boolean;
    accountLinked?: boolean;
    redirectTo?: string;
    cultureCode?: string;
    user?: AuthenticatedUserDto & {
      userId?: string;
      email?: string;
      fullName?: string;
      tenantId?: string;
      cultureCode?: string;
    };
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
