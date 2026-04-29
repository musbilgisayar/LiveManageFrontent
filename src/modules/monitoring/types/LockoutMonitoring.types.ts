// src/modules/monitoring/types/LockoutMonitoring.types.ts

export type LockoutRisk = "low" | "medium" | "high" | "critical";
export type LockoutStatus = "active" | "expiring" | "released";
export type LockoutTargetType = "user" | "ip";
export type LockoutActivityType =
  | "lock"
  | "unlock"
  | "decision"
  | "review"
  | "extend";

export type GenericResponseDto<T> = {
  ok: boolean;
  message: string;
  userMessage?: string | null;
  data: T;
};

export type LockoutCenterSummaryDto = {
  total: number;
  active: number;
  expiring: number;
  released: number;
  critical: number;

  userLocks: number;
  ipLocks: number;

  automatic: number;
  manual: number;
  autoRate: number;

  generatedAtUtc: string;
};

export type LockoutRiskDistributionDto = {
  low: number;
  medium: number;
  high: number;
  critical: number;
};

export type LockoutListResultDto = {
  items: LockoutListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  riskDistribution: LockoutRiskDistributionDto;
};

export type LockoutListItemDto = {
  id: string;

  targetType: LockoutTargetType;
  targetValue: string;
  targetValueMasked: string;

  userId?: string | null;
  displayName?: string | null;
  userName?: string | null;
  emailMasked?: string | null;

  reason: string;
  reasonCode?: string | null;
  sourceRule: string;

  risk: LockoutRisk;
  status: LockoutStatus;

  country?: string | null;
  region?: string | null;
  device?: string | null;
  clientFingerprintMasked?: string | null;

  attempts: number;
  uniqueIpCount?: number | null;
  uniqueDeviceCount?: number | null;

  lockedAt: string;
  expiresAt?: string | null;
  remainingSeconds?: number | null;

  correlationId?: string | null;

  automatic: boolean;
  requiresManualReview: boolean;

  notes?: string | null;
};

export type LockoutAvailableActionsDto = {
  canUnlock: boolean;
  canExtend: boolean;
  canMarkManualReview: boolean;
  canViewSensitiveDetails: boolean;
};

export type LockoutSignalDto = {
  type: string;
  label: string;
  severity: string;
  value?: string | null;
  detectedAtUtc?: string | null;
};

export type LockoutDecisionStepDto = {
  step: string;
  result: string;
  message?: string | null;
  atUtc: string;
};

export type LockoutOperationHistoryDto = {
  id: string;
  operation: string;
  actorDisplayName?: string | null;
  actorUserId?: string | null;
  reason?: string | null;
  atUtc: string;
  correlationId?: string | null;
};

export type LockoutDetailDto = LockoutListItemDto & {
  tenantId: string;

  confidenceScore?: number | null;

  ipAddressMasked?: string | null;
  userAgentMasked?: string | null;

  oldStateJson?: string | null;
  newStateJson?: string | null;
  auditMetadataJson?: string | null;
  detailsJson?: string | null;

  signals: LockoutSignalDto[];
  decisionSteps: LockoutDecisionStepDto[];
  operationHistory: LockoutOperationHistoryDto[];

  availableActions: LockoutAvailableActionsDto;
};

export type LockoutActivityItemDto = {
  id: string;
  type: LockoutActivityType;

  title: string;
  description: string;
  at: string;

  targetType?: LockoutTargetType | null;
  targetValueMasked?: string | null;
  risk?: LockoutRisk | null;
  correlationId?: string | null;
};

export type LockoutSearchRequestDto = {
  search?: string;
  type?: "all" | LockoutTargetType;
  status?: "all" | LockoutStatus;
  risk?: "all" | LockoutRisk;

  fromUtc?: string;
  toUtc?: string;

  includeReleased?: boolean;
  onlyManualReview?: boolean;

  page?: number;
  pageSize?: number;
};