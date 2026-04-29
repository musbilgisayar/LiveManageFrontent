// src/modules/monitoring/types/LockoutOperation.types.ts

import type { LockoutTargetType } from "./LockoutMonitoring.types";

export type UnlockUserRequestDto = {
  reason: string;
};

export type UnlockIpRequestDto = {
  ipAddress: string;
  reason: string;
};

export type ExtendLockoutRequestDto = {
  extendMinutes: number;
  reason: string;
};

export type MarkManualReviewRequestDto = {
  targetType: LockoutTargetType;
  userId?: string | null;
  ipAddress?: string | null;
  reason: string;
  reviewerNote?: string | null;
};

export type LockoutOperationResultDto = {
  success: boolean;
  operation: string;
  message: string;

  targetType?: LockoutTargetType | null;
  targetValueMasked?: string | null;

  performedAtUtc: string;
  correlationId?: string | null;

  remainingSeconds?: number | null;
  newExpiresAtUtc?: string | null;
};