//src/modules/users/services/addressHierarchy.service.ts
export type AddressCountryLookupDto = {
  id: string;
  code: string;
  name: string;
  normalizedName?: string | null;
  flagEmoji?: string | null;
  isActive: boolean;
  sortOrder?: number | null;
  isSupportedForHierarchy?: boolean;
};

export type AddressCountryDto = {
  id: string;
  code: string;
  name: string;
  normalizedName?: string | null;
  flagEmoji?: string | null;
  isActive: boolean;
  isDeleted?: boolean;
  sortOrder?: number | null;
  isSupportedForHierarchy?: boolean;
};

export type AddressProvinceLookupDto = {
  id: string;
  code: string;
  name: string;
  normalizedName?: string | null;
  isActive: boolean;
  sortOrder?: number | null;
  countryCode?: string | null;
  countryName?: string | null;
};

export type AddressDistrictLookupDto = {
  id: string;
  provinceId: string;
  code: string;
  name: string;
  normalizedName?: string | null;
  isActive: boolean;
  sortOrder?: number | null;
  provinceCode?: string | null;
  provinceName?: string | null;
};

export type AddressNeighborhoodLookupDto = {
  id: string;
  districtId: string;
  provinceId: string;
  code: string;
  name: string;
  normalizedName?: string | null;
  isActive: boolean;
  sortOrder?: number | null;
  districtCode?: string | null;
  districtName?: string | null;
  provinceCode?: string | null;
  provinceName?: string | null;
  settlementType?: string | null;
  postalCode?: string | null;
};

type ApiResponse<T> = {
  ok?: boolean;
  message?: string | null;
  userMessage?: string | null;
  data?: T | null;
};

async function parseJsonSafe<T>(res: Response): Promise<ApiResponse<T> | null> {
  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

function buildErrorResult(message: string) {
  return {
    ok: false as const,
    message,
    userMessage: message,
  };
}

export async function getAddressCountries() {
  try {
    const res = await fetch("/api/v1.0/userprofile/address-hierarchy/countries", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const json = await parseJsonSafe<AddressCountryLookupDto[]>(res);

    if (!res.ok) {
      return {
        ...buildErrorResult(
          json?.userMessage || json?.message || "Ülke listesi alınamadı."
        ),
        data: [] as AddressCountryLookupDto[],
      };
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: Array.isArray(json?.data)
        ? json.data
        : ([] as AddressCountryLookupDto[]),
    };
  } catch (error) {
    console.error("[addressHierarchy.service][getAddressCountries] failed", error);

    return {
      ...buildErrorResult("Ülke listesi alınırken beklenmeyen bir hata oluştu."),
      data: [] as AddressCountryLookupDto[],
    };
  }
}

export async function getAllAddressCountries() {
  try {
    const res = await fetch("/api/v1.0/userprofile/address-hierarchy/countries/all", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const json = await parseJsonSafe<AddressCountryDto[]>(res);

    if (!res.ok) {
      return {
        ...buildErrorResult(
          json?.userMessage || json?.message || "Tüm ülkeler alınamadı."
        ),
        data: [] as AddressCountryDto[],
      };
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: Array.isArray(json?.data)
        ? json.data
        : ([] as AddressCountryDto[]),
    };
  } catch (error) {
    console.error("[addressHierarchy.service][getAllAddressCountries] failed", error);

    return {
      ...buildErrorResult("Tüm ülkeler alınırken beklenmeyen bir hata oluştu."),
      data: [] as AddressCountryDto[],
    };
  }
}

export async function getAddressProvinces(countryCode: string) {
  const normalizedCountryCode = countryCode?.trim().toUpperCase();

  if (!normalizedCountryCode) {
    return {
      ...buildErrorResult("Ülke kodu zorunludur."),
      data: [] as AddressProvinceLookupDto[],
    };
  }

  try {
    const url = `/api/v1.0/userprofile/address-hierarchy/provinces?countryCode=${encodeURIComponent(
      normalizedCountryCode
    )}`;

    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const json = await parseJsonSafe<AddressProvinceLookupDto[]>(res);

    if (!res.ok) {
      return {
        ...buildErrorResult(
          json?.userMessage || json?.message || "İl listesi alınamadı."
        ),
        data: [] as AddressProvinceLookupDto[],
      };
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: Array.isArray(json?.data)
        ? json.data
        : ([] as AddressProvinceLookupDto[]),
    };
  } catch (error) {
    console.error("[addressHierarchy.service][getAddressProvinces] failed", error);

    return {
      ...buildErrorResult("İl listesi alınırken beklenmeyen bir hata oluştu."),
      data: [] as AddressProvinceLookupDto[],
    };
  }
}

export async function getAddressDistricts(provinceId: string) {
  if (!provinceId?.trim()) {
    return {
      ...buildErrorResult("İl bilgisi zorunludur."),
      data: [] as AddressDistrictLookupDto[],
    };
  }

  try {
    const url = `/api/v1.0/userprofile/address-hierarchy/districts?provinceId=${encodeURIComponent(
      provinceId.trim()
    )}`;

    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const json = await parseJsonSafe<AddressDistrictLookupDto[]>(res);

    if (!res.ok) {
      return {
        ...buildErrorResult(
          json?.userMessage || json?.message || "İlçe listesi alınamadı."
        ),
        data: [] as AddressDistrictLookupDto[],
      };
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: Array.isArray(json?.data)
        ? json.data
        : ([] as AddressDistrictLookupDto[]),
    };
  } catch (error) {
    console.error("[addressHierarchy.service][getAddressDistricts] failed", error);

    return {
      ...buildErrorResult("İlçe listesi alınırken beklenmeyen bir hata oluştu."),
      data: [] as AddressDistrictLookupDto[],
    };
  }
}

export async function getAddressNeighborhoods(districtId: string) {
  if (!districtId?.trim()) {
    return {
      ...buildErrorResult("İlçe bilgisi zorunludur."),
      data: [] as AddressNeighborhoodLookupDto[],
    };
  }

  try {
    const url = `/api/v1.0/userprofile/address-hierarchy/neighborhoods?districtId=${encodeURIComponent(
      districtId.trim()
    )}`;

    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const json = await parseJsonSafe<AddressNeighborhoodLookupDto[]>(res);

    if (!res.ok) {
      return {
        ...buildErrorResult(
          json?.userMessage || json?.message || "Mahalle/köy listesi alınamadı."
        ),
        data: [] as AddressNeighborhoodLookupDto[],
      };
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: Array.isArray(json?.data)
        ? json.data
        : ([] as AddressNeighborhoodLookupDto[]),
    };
  } catch (error) {
    console.error(
      "[addressHierarchy.service][getAddressNeighborhoods] failed",
      error
    );

    return {
      ...buildErrorResult(
        "Mahalle/köy listesi alınırken beklenmeyen bir hata oluştu."
      ),
      data: [] as AddressNeighborhoodLookupDto[],
    };
  }
}