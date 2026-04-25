export type SocialMediaOwnerType = "User" | "UserProfile" | "Organization" | "Company";

export type SocialMediaPlatform =
  | "LinkedIn"
  | "Instagram"
  | "Facebook"
  | "X"
  | "YouTube"
  | "TikTok"
  | "Website"
  | "Other";

export interface CreateSocialMediaAccountRequestDto {
  ownerType: SocialMediaOwnerType | string;
  ownerId: string;
  platform: SocialMediaPlatform | string;
  url: string;
  userNameOrHandle?: string | null;
  displayName?: string | null;
  isPrimary: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface UpdateSocialMediaAccountRequestDto {
  ownerType: SocialMediaOwnerType | string;
  ownerId: string;
  platform: SocialMediaPlatform | string;
  url: string;
  userNameOrHandle?: string | null;
  displayName?: string | null;
  isPrimary: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface GetSocialMediaAccountsByOwnerRequestDto {
  ownerType: SocialMediaOwnerType | string;
  ownerId: string;
}

export interface SocialMediaAccountDto {
  id: string;
  ownerType: string;
  ownerId: string;
  platform: string;
  url: string;
  userNameOrHandle?: string | null;
  displayName?: string | null;
  isPrimary: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface SocialMediaAccountListItemDto {
  id: string;
  platform: string;
  url: string;
  userNameOrHandle?: string | null;
  displayName?: string | null;
  isPrimary: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface GenericResponseDto<T = unknown> {
  isSuccess?: boolean;
  success?: boolean;
  message?: string | null;
  code?: string | null;
  data?: T | null;
  errors?: string[] | null;
}

export interface SocialMediaListResponseDto
  extends GenericResponseDto<SocialMediaAccountListItemDto[]> {}

export interface SocialMediaDetailResponseDto
  extends GenericResponseDto<SocialMediaAccountDto> {}

export interface SocialMediaMutationResponseDto
  extends GenericResponseDto<boolean> {}

export interface SocialMediaFormValues {
  platform: string;
  url: string;
  userNameOrHandle: string;
  displayName: string;
  isPrimary: boolean;
  isActive: boolean;
  sortOrder: number;
}

export const SOCIAL_MEDIA_PLATFORM_OPTIONS: Array<{
  value: SocialMediaPlatform;
  label: string;
}> = [
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Instagram", label: "Instagram" },
  { value: "Facebook", label: "Facebook" },
  { value: "X", label: "X" },
  { value: "YouTube", label: "YouTube" },
  { value: "TikTok", label: "TikTok" },
  { value: "Website", label: "Website" },
  { value: "Other", label: "Other" },
];

export function buildCreateSocialMediaPayload(
  ownerType: string,
  ownerId: string,
  values: SocialMediaFormValues,
): CreateSocialMediaAccountRequestDto {
  return {
    ownerType,
    ownerId,
    platform: values.platform,
    url: values.url,
    userNameOrHandle: values.userNameOrHandle || null,
    displayName: values.displayName || null,
    isPrimary: values.isPrimary,
    isActive: values.isActive,
    sortOrder: values.sortOrder,
  };
}

export function buildUpdateSocialMediaPayload(
  ownerType: string,
  ownerId: string,
  values: SocialMediaFormValues,
): UpdateSocialMediaAccountRequestDto {
  return {
    ownerType,
    ownerId,
    platform: values.platform,
    url: values.url,
    userNameOrHandle: values.userNameOrHandle || null,
    displayName: values.displayName || null,
    isPrimary: values.isPrimary,
    isActive: values.isActive,
    sortOrder: values.sortOrder,
  };
}