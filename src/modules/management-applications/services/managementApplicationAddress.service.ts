// src/modules/management-applications/services/managementApplicationAddress.service.ts
import type { ManagementApplicationAddressForm } from "../types/managementApplication.types";

type ApiResponse<T> = {
  ok?: boolean;
  message?: string | null;
  userMessage?: string | null;
  data?: T | null;
  Data?: T | null;
};

type AddressCreateResultDto = {
  addressId?: string;
  AddressId?: string;
  id?: string;
  Id?: string;
  formattedAddress?: string | null;
};

async function readJsonSafe(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      return await response.json();
    }

    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return null;
  }
}

function extractAddressId(json: unknown): string | null {
  if (typeof json === "string") {
    const trimmed = json.trim();
    return trimmed ? trimmed : null;
  }

  if (!json || typeof json !== "object") return null;

  const direct = json as Record<string, unknown>;
  const directCandidates = [
    direct.addressId,
    direct.AddressId,
    direct.id,
    direct.Id,
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  const envelope = json as ApiResponse<AddressCreateResultDto>;
  const data = envelope.data ?? envelope.Data ?? null;

  if (!data || typeof data !== "object") return null;

  const nestedCandidates = [
    data.addressId,
    data.AddressId,
    data.id,
    data.Id,
  ];

  for (const candidate of nestedCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return null;
}

export async function createManagementApplicationAddress(
  address: ManagementApplicationAddressForm,
): Promise<ApiResponse<AddressCreateResultDto>> {
  const response = await fetch("/api/v1.0/userprofile/addresses", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      country: address.country,
      countryCode: address.countryCode,
      city: address.city,
      district: address.district,
      neighborhood: address.neighborhood,
      street: address.street,
      buildingNumber: address.buildingNumber,
      apartmentNumber: address.apartmentNumber,
      postalCode: address.postalCode,
      provinceId: address.provinceId || null,
      districtId: address.districtId || null,
      neighborhoodId: address.neighborhoodId || null,
    }),
  });

  const json = await readJsonSafe(response);
  const envelope =
    json && typeof json === "object"
      ? (json as ApiResponse<AddressCreateResultDto>)
      : null;
  const addressId = extractAddressId(json);
  const data = envelope?.data ?? envelope?.Data ?? null;
  const normalizedAddressId = addressId ?? undefined;
  const normalizedData =
    data && typeof data === "object"
      ? { ...data, addressId: normalizedAddressId }
      : { addressId: normalizedAddressId };

  console.log("[createManagementApplicationAddress][response]", {
    status: response.status,
    json,
    addressId,
  });

  return {
    ok: response.ok && envelope?.ok !== false,
    message: envelope?.message ?? null,
    userMessage: envelope?.userMessage ?? null,
    data: normalizedData,
  };
}
