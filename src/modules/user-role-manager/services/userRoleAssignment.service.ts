"use client";

import {
  getWebFetcher,
  postWebFetcher,
} from "@/utils/fetchers.web.client";

import type {
  AppUserRoleDto,
  AppUserRoleHistoryDto,
  UserRoleChangeReasonDto,
  UserRoleSyncRequestDto,
} from "../types/UserRoleAssignment.types";

type GenericResponseDto<T> = {
  ok?: boolean;
  success?: boolean;
  message?: string | null;
  userMessage?: string | null;
  data: T | null;
  errors?: string[] | null;
};

function buildBaseUrl(userId: string): string {
  return `/api/v1.0/admin/role-manager/users/${userId}/roles`;
}

export async function getUserActiveRoles(
  userId: string,
): Promise<AppUserRoleDto[]> {
  const response = (await getWebFetcher(
    buildBaseUrl(userId),
  )) as AppUserRoleDto[];

  return Array.isArray(response)
    ? response
    : [];
}

export async function getUserRoleHistory(
  userId: string,
): Promise<AppUserRoleHistoryDto[]> {
  const response = (await getWebFetcher(
    `${buildBaseUrl(userId)}/history`,
  )) as AppUserRoleHistoryDto[];

  return Array.isArray(response)
    ? response
    : [];
}

export async function assignRole(
  userId: string,
  roleId: string,
  payload?: UserRoleChangeReasonDto,
): Promise<string> {
  const response = (await postWebFetcher(
    `${buildBaseUrl(userId)}/assign/${roleId}`,
    payload ?? {},
  )) as GenericResponseDto<string>;

  const isSuccess =
    response?.ok === true ||
    response?.success === true;

  if (!isSuccess) {
    throw new Error(
      response?.userMessage ||
        response?.message ||
        "Rol atama işlemi başarısız oldu.",
    );
  }

  return response?.data ?? "";
}

export async function revokeRole(
  userId: string,
  roleId: string,
  payload?: UserRoleChangeReasonDto,
): Promise<string> {
  const response = (await postWebFetcher(
    `${buildBaseUrl(userId)}/revoke/${roleId}`,
    payload ?? {},
  )) as GenericResponseDto<string>;

  const isSuccess =
    response?.ok === true ||
    response?.success === true;

  if (!isSuccess) {
    throw new Error(
      response?.userMessage ||
        response?.message ||
        "Rol kaldırma işlemi başarısız oldu.",
    );
  }

  return response?.data ?? "";
}

export async function syncUserRoles(
  userId: string,
  payload: UserRoleSyncRequestDto,
): Promise<string> {
  const response = (await postWebFetcher(
    `${buildBaseUrl(userId)}/sync`,
    payload,
  )) as GenericResponseDto<string>;

  const isSuccess =
    response?.ok === true ||
    response?.success === true;

  if (!isSuccess) {
    throw new Error(
      response?.userMessage ||
        response?.message ||
        "Rol senkronizasyonu başarısız oldu.",
    );
  }

  return response?.data ?? "";
}

export async function revokeAllRoles(
  userId: string,
  payload?: UserRoleChangeReasonDto,
): Promise<string> {
  const response = (await postWebFetcher(
    `${buildBaseUrl(userId)}/revoke-all`,
    payload ?? {},
  )) as GenericResponseDto<string>;

  const isSuccess =
    response?.ok === true ||
    response?.success === true;

  if (!isSuccess) {
    throw new Error(
      response?.userMessage ||
        response?.message ||
        "Tüm roller kaldırılamadı.",
    );
  }

  return response?.data ?? "";
}