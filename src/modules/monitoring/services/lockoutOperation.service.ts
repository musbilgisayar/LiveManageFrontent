// src/modules/monitoring/services/lockoutOperation.service.ts
"use client";

import { postWebFetcher } from "@/utils/fetchers.web.client";

import type { GenericResponseDto } from "../types/LockoutMonitoring.types";

import type {
  LockoutOperationResultDto,
  UnlockUserRequestDto,
  UnlockIpRequestDto,
  ExtendLockoutRequestDto,
  MarkManualReviewRequestDto,
} from "../types/LockoutOperation.types";

const BASE_URL = "/api/v1.0/admin/monitoring/lockouts";

async function postOperation<TBody>(
  url: string,
  body: TBody
): Promise<LockoutOperationResultDto> {
  const json = (await postWebFetcher(
    url,
    body
  )) as GenericResponseDto<LockoutOperationResultDto>;

  if (!json.ok) {
    throw new Error(json.userMessage || json.message || "Request failed");
  }

  return json.data;
}

export function unlockUser(
  userId: string,
  request: UnlockUserRequestDto
): Promise<LockoutOperationResultDto> {
  return postOperation(
    `${BASE_URL}/users/${encodeURIComponent(userId)}/unlock`,
    request
  );
}

export function unlockIp(
  request: UnlockIpRequestDto
): Promise<LockoutOperationResultDto> {
  return postOperation(`${BASE_URL}/ips/unlock`, request);
}

export function extendLockout(
  lockoutId: string,
  request: ExtendLockoutRequestDto
): Promise<LockoutOperationResultDto> {
  return postOperation(
    `${BASE_URL}/${encodeURIComponent(lockoutId)}/extend`,
    request
  );
}

export function markManualReview(
  lockoutId: string,
  request: MarkManualReviewRequestDto
): Promise<LockoutOperationResultDto> {
  return postOperation(
    `${BASE_URL}/${encodeURIComponent(lockoutId)}/manual-review`,
    request
  );
}