"use client";

import { getWebFetcher } from "@/utils/fetchers.web.client";

import type {
  AppRoleListItemDto,
} from "../types/AppRole.types";

type GenericResponseDto<T> = {
  ok?: boolean;
  success?: boolean;
  message?: string | null;
  userMessage?: string | null;
  data: T | null;
  errors?: string[] | null;
};

const APP_ROLES_URL =
  "/api/v1.0/admin/role-manager/app-roles";

export async function getAppRoles(): Promise<
  AppRoleListItemDto[]
> {
  const response = (await getWebFetcher(
    APP_ROLES_URL,
  )) as GenericResponseDto<AppRoleListItemDto[]>;

  const isSuccess =
    response?.ok === true ||
    response?.success === true;

  if (!isSuccess || !response.data) {
    throw new Error(
      response?.userMessage ||
        response?.message ||
        "Rol listesi alınamadı.",
    );
  }

  return response.data;
}