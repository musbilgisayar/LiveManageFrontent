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

function unwrapArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (
    value &&
    typeof value === "object" &&
    Array.isArray((value as GenericResponseDto<T[]>).data)
  ) {
    return (value as GenericResponseDto<T[]>).data ?? [];
  }

  return [];
}

function buildBaseUrl(userId: string): string {
  return `/api/v1.0/admin/role-manager/users/${userId}/roles`;
}

export async function getUserActiveRoles(
  userId: string,
): Promise<AppUserRoleDto[]> {
  const response = (await getWebFetcher(
    buildBaseUrl(userId),
  )) as unknown;

  return unwrapArray<AppUserRoleDto>(response);
}

export async function getUserRoleHistory(
  userId: string,
): Promise<AppUserRoleHistoryDto[]> {
  const response = (await getWebFetcher(
    `${buildBaseUrl(userId)}/history`,
  )) as unknown;

  return unwrapArray<AppUserRoleHistoryDto>(response);
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
        "userRoleManager:errors.assignRoleFailed",
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
        "userRoleManager:errors.revokeRoleFailed",
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
        "userRoleManager:errors.syncRolesFailed",
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
        "userRoleManager:errors.revokeAllFailed",
    );
  }

  return response?.data ?? "";
}
