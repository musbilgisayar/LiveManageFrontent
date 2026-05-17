//src/modules/users/services/selfUserDetail.service.ts
import type { AdminUserDetailDto } from "../types/UserDetail.types";
import { normalizeUserDetailResponse } from "../mappers/userResponse.mapper";

export async function getSelfUserDetail(): Promise<AdminUserDetailDto> {
  const response = await fetch("/api/v1.0/userprofile/me", {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("users:detail.errors.selfProfileLoadFailed");//kullanıcı profili yüklenirken hata oluştu
  }

  const json = await response.json();
  const normalized = normalizeUserDetailResponse(json?.data?.data ?? json?.data ?? json);

  if (!normalized) {
    throw new Error("users:detail.errors.selfProfileLoadFailed");
  }

  return normalized;
}
