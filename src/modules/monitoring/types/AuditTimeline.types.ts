// src/modules/monitoring/types/AuditTimeline.types.ts

export type AuditTimelineEventType =
  | "lock"
  | "unlock"
  | "extend"
  | "review"
  | "audit"
  | "security"
  | "login"
  | "update"
  | "sensitive"
  | "system"
  | string;

export type AuditTimelineSource =
  | "audit"
  | "security"
  | "lockout"
  | "system"
  | string;

export type AuditTimelineTargetType =
  | "user"
  | "ip"
  | "entity"
  | "system"
  | string;

export type AuditTimelineRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | string;

export type AuditTimelineStatus =
  | "success"
  | "failed"
  | "pending"
  | "warning"
  | "info"
  | string;

export type AuditTimelineQueryDto = {
  search?: string;
  eventType?: string;
  source?: string;
  riskLevel?: string;
  targetType?: string;
  fromUtc?: string;
  toUtc?: string;
  page?: number;
  pageSize?: number;
};

export type AuditTimelineItemDto = {
  id: string;
  eventType: string;
  source: string;

  titleKey: string;
  descriptionKey?: string | null;
  description?: string | null;

  targetType: string;
  targetValueMasked: string;

  riskLevel?: string | null;
  status?: string | null;

  actorDisplayName?: string | null;
  actorUserId?: string | null;

  ipAddressMasked?: string | null;
  deviceInfoMasked?: string | null;
  locationSummary?: string | null;

  correlationId?: string | null;

  occurredAtUtc: string;
};

export type AuditTimelineListResultDto = {
  items: AuditTimelineItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type AuditTimelineDetailDto = AuditTimelineItemDto & {
  detailsJson?: string | null;
};

export type AuditTimelineFilterOptionsDto = {
  eventTypes: string[];
  sources: string[];
  riskLevels: string[];
  targetTypes: string[];
};

export type AuditTimelineSummaryDto = {
  totalEvents: number;
  criticalEvents: number;
  highRiskEvents: number;
  securityEvents: number;
  sensitiveEvents: number;
  failedEvents: number;
};

export type AuditTimelineActivityDto = {
  id: string;
  type: string;
  titleKey: string;
  description?: string | null;
  occurredAtUtc: string;
};

export type AuditTimelineExportPrepareResultDto = {
  isAllowed: boolean;
  messageKey: string;
  estimatedRecordCount: number;
  exportToken?: string | null;
};

export type AuditTimelineItem = {
  id: string;
  type: string;
  source: string;
  titleKey: string;
  title: string;
  description?: string;
  at: string;
  targetType: string;
  targetValueMasked: string;
  riskLevel?: string | null;
  status?: string | null;
  actorDisplayName?: string | null;
  actorUserId?: string | null;
  ipAddressMasked?: string | null;
  deviceInfoMasked?: string | null;
  locationSummary?: string | null;
  correlationId?: string | null;
  raw: AuditTimelineItemDto;
};

export type AuditTimelineListResult = {
  items: AuditTimelineItem[];
  totalCount: number;
  page: number;
  pageSize: number;
};