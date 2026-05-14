export interface PermissionUserLookupItemDto {
  id: string;
  fullName: string;
  email?: string | null;
  userName?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean;
  phoneNumber?: string | null;
}

export interface PermissionUserLookupResponseDto {
  items: PermissionUserLookupItemDto[];
}