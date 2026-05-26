"use client";

import { getWebFetcher } from "@/utils/fetchers.web.client";

import type {
  RoleDistributionDto,
  RoleManagerSummaryDto,
  RoleManagerUserListItemDto,
  RoleManagerUserQueryDto,
  PagedResult,
} from "../types/RoleManager.types";

type GenericResponseDto<T> = {
  ok?: boolean;
  success?: boolean;
  message?: string | null;
  userMessage?: string | null;
  data: T | null;
  errors?: string[] | null;
};

const ROLE_MANAGER_SUMMARY_URL =
  "/api/v1.0/admin/role-manager/summary";

const ROLE_DISTRIBUTION_URL =
  "/api/v1.0/admin/role-manager/roles/distribution";

const ROLE_MANAGER_USERS_URL =
  "/api/v1.0/admin/role-manager/users";

function buildQuery(
  params?: Record<string, unknown>,
): string {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export async function getRoleManagerSummary(params?: {
  tenantId?: string | null;
  allTenants?: boolean;
}): Promise<RoleManagerSummaryDto> {
  const query = buildQuery(params);

  const response = (await getWebFetcher(
    `${ROLE_MANAGER_SUMMARY_URL}${query}`,
  )) as GenericResponseDto<RoleManagerSummaryDto>;

  const isSuccess =
    response?.ok === true ||
    response?.success === true;

  if (!isSuccess || !response.data) {
    throw new Error(
      response?.userMessage ||
        response?.message ||
        "userRoleManager:errors.summaryLoadFailed",
    );
  }

  return response.data;
}

export async function getRoleDistribution(params?: {
  tenantId?: string | null;
  allTenants?: boolean;
}): Promise<RoleDistributionDto[]> {
  const query = buildQuery(params);

  const response = (await getWebFetcher(
    `${ROLE_DISTRIBUTION_URL}${query}`,
  )) as GenericResponseDto<RoleDistributionDto[]>;

  const isSuccess =
    response?.ok === true ||
    response?.success === true;

  if (!isSuccess || !response.data) {
    throw new Error(
      response?.userMessage ||
        response?.message ||
        "userRoleManager:errors.distributionLoadFailed",
    );
  }

  return response.data;
}

export async function getRoleManagerUsers(
  params: RoleManagerUserQueryDto,
): Promise<
  PagedResult<RoleManagerUserListItemDto>
> {
  const query = buildQuery(params);

  const response = (await getWebFetcher(
    `${ROLE_MANAGER_USERS_URL}${query}`,
  )) as GenericResponseDto<
    PagedResult<RoleManagerUserListItemDto>
  >;

  const isSuccess =
    response?.ok === true ||
    response?.success === true;

  if (!isSuccess || !response.data) {
    throw new Error(
      response?.userMessage ||
        response?.message ||
        "userRoleManager:errors.usersLoadFailed",
    );
  }

  return response.data;
}
