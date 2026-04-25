// src/modules/users/services/userAddressManager.service.ts

import type {
  AddressTypeValue,
  GetUserAddressLinksParams,
  UserAddressLinksResponse,
} from "../types/UserAddress.types";
import type { AddressCreateForm } from "../components/detail/cards/address-manager/dialogs/AddressCreateDialog";

type ApiEnvelope<T> = {
  ok?: boolean;
  message?: string | null;
  userMessage?: string | null;
  data?: T | null;
  Data?: T | null;
};

type CreatedAddressResponse = {
  addressId?: string;
  AddressId?: string;
  id?: string;
  Id?: string;
};

type CreateAddressLinkRequest = {
  ownerId: string;
  ownerKind: "Kisisel";
  addressId: string;
  addressType: number;
  isPrimary: boolean;
  validFrom: string;
  validTo: string | null;
};

type SetPrimaryAddressLinkResponse = {
  ok?: boolean;
};

type UpdateAddressRequest = {
  addressId: string;
  countryCode: string;
  country: string;
  city: string;
  district: string;
  neighborhood: string;
  provinceId: string;
  districtId: string;
  neighborhoodId: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string;
  postalCode: string;
  description: string;
  formattedAddress: string;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
};

type UpdateAddressLinkRequest = {
  linkId: string;
  addressType: AddressTypeValue;
  isPrimary: boolean;
  validFrom: string;
  validTo: string | null;
};

function buildOwnerLinksUrl(params: GetUserAddressLinksParams) {
  const search = new URLSearchParams();
  search.set("ownerId", params.ownerId);
  search.set("ownerKind", params.ownerKind);

  return `/api/v1.0/profile/address-links/owner-links?${search.toString()}`;
}

function unwrapArrayResponse(json: unknown): UserAddressLinksResponse {
  if (Array.isArray(json)) {
    return json as UserAddressLinksResponse;
  }

  if (json && typeof json === "object") {
    const env = json as ApiEnvelope<UserAddressLinksResponse>;

    if (Array.isArray(env.data)) {
      return env.data;
    }

    if (Array.isArray(env.Data)) {
      return env.Data;
    }
  }

  return [];
}

function extractErrorMessage(json: unknown, fallback: string) {
  if (json && typeof json === "object") {
    const env = json as ApiEnvelope<unknown>;
    return env.userMessage || env.message || fallback;
  }

  if (typeof json === "string" && json.trim()) {
    return json;
  }

  return fallback;
}

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

function buildFormattedAddress(form: AddressCreateForm): string {
  return [
    form.neighborhood,
    form.street,
    form.buildingNumber,
    form.apartmentNumber,
    form.postalCode,
    form.district,
    form.city,
    form.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function mapCreateAddressPayload(form: AddressCreateForm) {
  return {
    countryCode: form.countryCode,
    country: form.country,
    city: form.city,
    district: form.district,
    neighborhood: form.neighborhood,
    provinceId: form.provinceId,
    districtId: form.districtId,
    neighborhoodId: form.neighborhoodId,
    street: form.street,
    buildingNumber: form.buildingNumber,
    apartmentNumber: form.apartmentNumber,
    postalCode: form.postalCode,
    description: form.description,
    formattedAddress: buildFormattedAddress(form),
    latitude: form.latitude,
    longitude: form.longitude,
    altitude: null,
  };
}

function mapUpdateAddressPayload(
  addressId: string,
  form: AddressCreateForm
): UpdateAddressRequest {
  return {
    addressId,
    countryCode: form.countryCode,
    country: form.country,
    city: form.city,
    district: form.district,
    neighborhood: form.neighborhood,
    provinceId: form.provinceId,
    districtId: form.districtId,
    neighborhoodId: form.neighborhoodId,
    street: form.street,
    buildingNumber: form.buildingNumber,
    apartmentNumber: form.apartmentNumber,
    postalCode: form.postalCode,
    description: form.description,
    formattedAddress: buildFormattedAddress(form),
    latitude: form.latitude,
    longitude: form.longitude,
    altitude: null,
  };
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

  const env = json as ApiEnvelope<CreatedAddressResponse>;
  const data = env.data ?? env.Data ?? null;

  if (!data) {
    return null;
  }

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

function mapAddressTypeToApiValue(value: number | string): AddressTypeValue {
  switch (value) {
    case 1:
    case "Home":
      return "Home";
    case 2:
    case "Work":
      return "Work";
    case 3:
    case "Billing":
      return "Billing";
    case 4:
    case "Other":
      return "Other";
    default:
      return "Other";
  }
}

export async function getUserAddressLinks(
  params: GetUserAddressLinksParams
): Promise<UserAddressLinksResponse> {
  const url = buildOwnerLinksUrl(params);

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      accept: "application/json",
    },
    cache: "no-store",
  });

  const json = await readJsonSafe(response);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        json,
        `Adres bağlantıları isteği başarısız oldu: ${response.status}`
      )
    );
  }

  return unwrapArrayResponse(json);
}

export async function createAddress(form: AddressCreateForm): Promise<string> {
  const requestBody = mapCreateAddressPayload(form);
  console.log("CREATE ADDRESS REQUEST BODY =", requestBody);

  const response = await fetch("/api/v1.0/profile/addresses", {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(requestBody),
  });

  const json = await readJsonSafe(response);
  console.log("CREATE ADDRESS RESPONSE =", {
    status: response.status,
    contentType: response.headers.get("content-type"),
    json,
  });

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        json,
        `Adres oluşturma isteği başarısız oldu: ${response.status}`
      )
    );
  }

  const addressId = extractAddressId(json);

  if (!addressId) {
    throw new Error("Oluşturulan adres kimliği çözümlenemedi.");
  }

  return addressId;
}

export async function createAddressLink(
  payload: CreateAddressLinkRequest
): Promise<void> {
  const response = await fetch("/api/v1.0/profile/address-links", {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const json = await readJsonSafe(response);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        json,
        `Adres bağlantısı oluşturma isteği başarısız oldu: ${response.status}`
      )
    );
  }
}

export async function setPrimaryAddressLink(
  addressLinkId: string
): Promise<void> {
  const response = await fetch(
    `/api/v1.0/profile/address-links/${addressLinkId}/set-primary`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const json = await readJsonSafe(response);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        json,
        `Birincil adres ayarlama isteği başarısız oldu: ${response.status}`
      )
    );
  }

  const env = json as ApiEnvelope<SetPrimaryAddressLinkResponse> | null;

  if (env && typeof env === "object" && env.ok === false) {
    throw new Error(extractErrorMessage(json, "Birincil adres ayarlanamadı."));
  }
}

export async function deleteAddressLink(
  addressLinkId: string
): Promise<void> {
  const response = await fetch(
    `/api/v1.0/profile/address-links/${addressLinkId}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const json = await readJsonSafe(response);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        json,
        `Adres bağlantısı silme isteği başarısız oldu: ${response.status}`
      )
    );
  }

  const env = json as ApiEnvelope<unknown> | null;

  if (env && typeof env === "object" && env.ok === false) {
    throw new Error(extractErrorMessage(json, "Adres bağlantısı silinemedi."));
  }
}

export async function updateAddress(
  addressId: string,
  form: AddressCreateForm
): Promise<void> {
  const requestBody = mapUpdateAddressPayload(addressId, form);
  console.log("UPDATE ADDRESS REQUEST BODY =", requestBody);

  const response = await fetch("/api/v1.0/profile/addresses", {
    method: "PUT",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(requestBody),
  });

  const json = await readJsonSafe(response);
  console.log("UPDATE ADDRESS RESPONSE =", {
    status: response.status,
    contentType: response.headers.get("content-type"),
    json,
  });

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        json,
        `Adres güncelleme isteği başarısız oldu: ${response.status}`
      )
    );
  }

  const env = json as ApiEnvelope<unknown> | null;

  if (env && typeof env === "object" && env.ok === false) {
    throw new Error(extractErrorMessage(json, "Adres güncellenemedi."));
  }
}

export async function updateAddressLink(payload: {
  linkId: string;
  addressType: number | string;
  isPrimary: boolean;
  validFrom: string;
  validTo: string | null;
}): Promise<void> {
  const requestBody: UpdateAddressLinkRequest = {
    linkId: payload.linkId,
    addressType: mapAddressTypeToApiValue(payload.addressType),
    isPrimary: payload.isPrimary,
    validFrom: payload.validFrom,
    validTo: payload.validTo,
  };

  console.log("UPDATE ADDRESS LINK REQUEST BODY =", requestBody);

  const response = await fetch("/api/v1.0/profile/address-links", {
    method: "PUT",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(requestBody),
  });

  const json = await readJsonSafe(response);
  console.log("UPDATE ADDRESS LINK RESPONSE =", {
    status: response.status,
    contentType: response.headers.get("content-type"),
    json,
  });

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        json,
        `Adres bağlantısı güncelleme isteği başarısız oldu: ${response.status}`
      )
    );
  }

  const env = json as ApiEnvelope<unknown> | null;

  if (env && typeof env === "object" && env.ok === false) {
    throw new Error(
      extractErrorMessage(json, "Adres bağlantısı güncellenemedi.")
    );
  }
}