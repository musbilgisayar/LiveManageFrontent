// src/modules/monitoring/types/MonitoringSummary.types.ts

export type MonitoringRiskLevel = "low" | "medium" | "high" | "critical";

export type MonitoringCardTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "danger";

export type RiskDistributionItemDto = {
  level: MonitoringRiskLevel;
  count: number;
};

export type MonitoringSummaryLast24HoursDto = {
  failedLoginCount: number;
  successfulLoginCount: number;
  lockoutDecisionCount: number;
  sensitiveAuditCount: number;
  notFoundCount: number;
};

export type MonitoringSummaryActiveDto = {
  userLockoutCount: number;
  ipLockoutCount: number;
};

export type MonitoringSummaryDto = {
  last24Hours: MonitoringSummaryLast24HoursDto;
  active: MonitoringSummaryActiveDto;
  riskDistribution: RiskDistributionItemDto[];
  generatedAtUtc: string;
};

export type MonitoringSummaryCardViewModel = {
  key: string;
  title: string;
  value: number;
  tone: MonitoringCardTone;
  description?: string;
  href?: string;
};