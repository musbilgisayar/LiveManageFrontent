// src/modules/monitoring/types/SecurityTimeline.types.ts

export type SecurityRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type SecurityEventType =
  | "login_failed"
  | "login_success"
  | "user_locked"
  | "ip_locked"
  | "lockout_decision"
  | "password_changed"
  | "suspicious_activity";

export type SecurityEventStatus =
  | "success"
  | "failed"
  | "blocked"
  | "allowed";

export type SecurityTimelineItemDto = {
  id: string;
  timestamp: string;

  eventType: SecurityEventType;
  riskLevel: SecurityRiskLevel;

  userId?: string | null;
  userName?: string | null;

  ipAddress?: string | null;
  device?: string | null;

  reason?: string | null;
  status?: SecurityEventStatus | null;

  correlationId?: string | null;

  metadata?: Record<string, unknown> | null;
};

export type SecurityTimelineFilter = {
  from?: string;
  to?: string;
  riskLevels?: SecurityRiskLevel[];
  eventTypes?: SecurityEventType[];
  search?: string;
};

export type PagedResultDto<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type SecurityTimelineResponse =
  PagedResultDto<SecurityTimelineItemDto>;