import type { GenericResponseDto } from "./RoleManager.types";

export type AppRoleListItemDto = {
  id: string;

  name: string;

  description: string | null;

  priority: number;

  category: number;

  isSensitive: boolean;

  complianceTag?: string | null;

  expirationDate?: string | null;

  permissions: string[];

  isSystem: boolean;

  userCount: number;

  createdAt: string;

  updatedAt: string;

  isDeleted: boolean;

  isActive: boolean;

  auditSummary: string | null;
};

export type AppRoleListResponse =
  GenericResponseDto<AppRoleListItemDto[]>;

export type RoleCategoryType =
  | 1
  | 2
  | 3
  | 4
  | 99;

export const ROLE_CATEGORY_LABELS: Record<
  RoleCategoryType,
  string
> = {
  1: "roles:category.system",
  2: "roles:category.tenant",
  3: "roles:category.business",
  4: "roles:category.compliance",
  99: "roles:category.custom",
};

export type AppRoleOption = {
  value: string;
  label: string;
  isSensitive: boolean;
  isSystem: boolean;
  category: number;
};

export type AppRoleFilterOption = {
  id: string;
  name: string;
  category: number;
};
