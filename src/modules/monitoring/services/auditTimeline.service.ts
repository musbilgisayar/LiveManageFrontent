import type {
  AuditTimelineDetailDto,
  AuditTimelineFilterOptionsDto,
  AuditTimelineListResultDto,
  AuditTimelineQueryDto,
  AuditTimelineSummaryDto,
  AuditTimelineActivityDto,
  AuditTimelineExportPrepareResultDto,
} from "../types/AuditTimeline.types";

type GenericResponseDto<T> = {
  ok?: boolean;
  success?: boolean;
  message?: string;
  userMessage?: string;
  data?: T;
};

const BASE_URL = "/api/v1.0/admin/monitoring/audit-timeline";

function buildQueryString(query?: AuditTimelineQueryDto): string {
  if (!query) return "";

  const params = new URLSearchParams();

  if (query.search) params.set("search", query.search);
  if (query.eventType && query.eventType !== "all") params.set("eventType", query.eventType);
  if (query.source && query.source !== "all") params.set("source", query.source);
  if (query.riskLevel && query.riskLevel !== "all") params.set("riskLevel", query.riskLevel);
  if (query.targetType && query.targetType !== "all") params.set("targetType", query.targetType);
  if (query.fromUtc) params.set("fromUtc", query.fromUtc);
  if (query.toUtc) params.set("toUtc", query.toUtc);

  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 20));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const json = (await response.json().catch(() => null)) as GenericResponseDto<T> | null;

  if (!response.ok || !json) {
    throw new Error(`AuditTimeline request failed. Status=${response.status}`);
  }

  if (json.ok === false || json.success === false) {
    throw new Error(json.userMessage || json.message || "AuditTimeline request failed.");
  }

  return json.data as T;
}

export async function getAuditTimelineSummary(): Promise<AuditTimelineSummaryDto> {
  return fetchJson<AuditTimelineSummaryDto>(`${BASE_URL}/summary`);
}

export async function getAuditTimelineList(
  query?: AuditTimelineQueryDto
): Promise<AuditTimelineListResultDto> {
  return fetchJson<AuditTimelineListResultDto>(
    `${BASE_URL}${buildQueryString(query)}`
  );
}

export async function getAuditTimelineDetail(
  id: string
): Promise<AuditTimelineDetailDto> {
  return fetchJson<AuditTimelineDetailDto>(
    `${BASE_URL}/${encodeURIComponent(id)}`
  );
}

export async function getAuditTimelineRecent(): Promise<AuditTimelineActivityDto[]> {
  return fetchJson<AuditTimelineActivityDto[]>(`${BASE_URL}/recent`);
}

export async function getAuditTimelineFilterOptions(): Promise<AuditTimelineFilterOptionsDto> {
  return fetchJson<AuditTimelineFilterOptionsDto>(`${BASE_URL}/filter-options`);
}

export async function prepareAuditTimelineExport(
  query?: AuditTimelineQueryDto
): Promise<AuditTimelineExportPrepareResultDto> {
  return fetchJson<AuditTimelineExportPrepareResultDto>(
    `${BASE_URL}/export/prepare`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(query ?? {}),
    }
  );
}