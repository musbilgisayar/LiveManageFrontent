export type RegisterDto = {
  userName?: string;
  email: string;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  cultureCode?: string | null;
  timeZone?: string | null;
  password: string;
  requireEmailConfirmation?: boolean;
  twoFactorEnabled?: boolean;
};
