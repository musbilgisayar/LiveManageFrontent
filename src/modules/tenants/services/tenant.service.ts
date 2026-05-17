// src/modules/tenants/services/tenant.service.ts

import type {
  TenantCreateRequestDto,
  TenantDetailDto,
  TenantListItemDto,
  TenantListQuery,
  TenantOptionDto,
  TenantOptionsQuery,
  TenantStatusUpdateRequestDto,
  TenantUpdateRequestDto,
} from "../types/Tenant.types";

type ApiEnvelope<T> = {
  ok: boolean;
  message: string;
  userMessage?: string;
  data: T;
};

function buildQuery(params?: Record<string, string | boolean | number | null | undefined>) {
  if (!params) return "";

  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function readJson<T>(res: Response): Promise<ApiEnvelope<T>> {
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      payload?.userMessage ||
        payload?.message ||
        `İstek başarısız oldu. Status: ${res.status}`
    );
  }

  return payload as ApiEnvelope<T>;
}

export async function getTenantOptions(
  query: TenantOptionsQuery = {}
): Promise<TenantOptionDto[]> {
  const qs = buildQuery({
    includeInactive: query.includeInactive ?? false,
  });

  const res = await fetch(`/api/v1.0/admin/tenants/options${qs}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const json = await readJson<TenantOptionDto[]>(res);
  return json.data;
}

export async function getTenants(
  query: TenantListQuery = {}
): Promise<TenantListItemDto[]> {
  const qs = buildQuery({
    includeInactive: query.includeInactive ?? true,
  });

  const res = await fetch(`/api/v1.0/admin/tenants${qs}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const json = await readJson<TenantListItemDto[]>(res);
  return json.data;
}

export async function getTenantById(id: string): Promise<TenantDetailDto> {
  const res = await fetch(`/api/v1.0/admin/tenants/${id}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const json = await readJson<TenantDetailDto>(res);
  return json.data;
}

export async function createTenant(
  input: TenantCreateRequestDto
): Promise<TenantDetailDto> {
  const res = await fetch(`/api/v1.0/admin/tenants`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const json = await readJson<TenantDetailDto>(res);
  return json.data;
}

export async function updateTenant(
  id: string,
  input: TenantUpdateRequestDto
): Promise<TenantDetailDto> {
  const res = await fetch(`/api/v1.0/admin/tenants/${id}`, {
    method: "PUT",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const json = await readJson<TenantDetailDto>(res);
  return json.data;
}

export async function updateTenantStatus(
  id: string,
  input: TenantStatusUpdateRequestDto
): Promise<TenantDetailDto> {
  const res = await fetch(`/api/v1.0/admin/tenants/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const json = await readJson<TenantDetailDto>(res);
  return json.data;
}