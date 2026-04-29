"use client";

import type {
  GenericResponseDto,
  LockoutActivityItemDto,
  LockoutCenterSummaryDto,
  LockoutDetailDto,
  LockoutListResultDto,
  LockoutSearchRequestDto,
} from "../types/LockoutMonitoring.types";

const BASE_URL = "/api/v1.0/admin/monitoring/lockouts";

function buildQuery(params: LockoutSearchRequestDto = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.type) searchParams.set("type", params.type);
  if (params.status) searchParams.set("status", params.status);
  if (params.risk) searchParams.set("risk", params.risk);

  if (params.fromUtc) searchParams.set("fromUtc", params.fromUtc);
  if (params.toUtc) searchParams.set("toUtc", params.toUtc);

  if (typeof params.includeReleased === "boolean") {
    searchParams.set("includeReleased", String(params.includeReleased));
  }

  if (typeof params.onlyManualReview === "boolean") {
    searchParams.set("onlyManualReview", String(params.onlyManualReview));
  }

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("pageSize", String(params.pageSize ?? 20));

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  const json = (await response.json()) as GenericResponseDto<T>;

  if (!response.ok || !json.ok) {
    throw new Error(json.userMessage || json.message || "Request failed");
  }

  return json.data;
}

export async function getLockoutSummary(): Promise<LockoutCenterSummaryDto> {
  return requestJson<LockoutCenterSummaryDto>(`${BASE_URL}/summary`);
}

export async function searchLockouts(
  params: LockoutSearchRequestDto = {}
): Promise<LockoutListResultDto> {
  return requestJson<LockoutListResultDto>(`${BASE_URL}${buildQuery(params)}`);
}

export async function getLockoutDetail(id: string): Promise<LockoutDetailDto> {
  return requestJson<LockoutDetailDto>(`${BASE_URL}/${encodeURIComponent(id)}`);
}

export async function getLockoutRecentActivity(
  take = 20
): Promise<LockoutActivityItemDto[]> {
  return requestJson<LockoutActivityItemDto[]>(
    `${BASE_URL}/recent-activity?take=${take}`
  );
}