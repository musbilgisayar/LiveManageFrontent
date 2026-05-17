// src/modules/tenants/types/Tenant.types.ts

export type TenantListItemDto = {
  id: string;
  key: string;
  name: string;
  defaultCulture: string | null;
  timeZone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type TenantOptionDto = {
  id: string;
  key: string;
  name: string;
  defaultCulture: string | null;
  timeZone: string | null;
  isActive: boolean;
};

export type TenantDetailDto = {
  id: string;
  key: string;
  name: string;
  defaultCulture: string | null;
  timeZone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdById: string | null;
  updatedById: string | null;
};

export type TenantCreateRequestDto = {
  key: string;
  name: string;
  defaultCulture?: string | null;
  timeZone?: string | null;
};

export type TenantUpdateRequestDto = {
  name: string;
  defaultCulture?: string | null;
  timeZone?: string | null;
};

export type TenantStatusUpdateRequestDto = {
  isActive: boolean;
};

export type TenantOptionsQuery = {
  includeInactive?: boolean;
};

export type TenantListQuery = {
  includeInactive?: boolean;
};