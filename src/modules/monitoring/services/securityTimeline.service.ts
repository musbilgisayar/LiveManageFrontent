// src/modules/monitoring/services/securityTimeline.service.ts

"use client";

import { getWebFetcher } from "@/utils/fetchers.web.client";
import type {
  SecurityTimelineFilter,
  SecurityTimelineResponse,
} from "../types/SecurityTimeline.types";

type GenericResponseDto<T> = {
  ok?: boolean;
  success?: boolean;
  message?: string | null;
  userMessage?: string | null;
  data: T | null;
  errors?: string[] | null;
};

const SECURITY_TIMELINE_URL =
  "/api/v1.0/admin/monitoring/security-timeline";

type GetSecurityTimelineParams = {
  pageNumber?: number;
  pageSize?: number;
  filter?: SecurityTimelineFilter;
};

function buildQuery(params?: GetSecurityTimelineParams) {
  const query = new URLSearchParams();

  query.set("pageNumber", String(params?.pageNumber ?? 1));
  query.set("pageSize", String(params?.pageSize ?? 20));

  if (params?.filter?.from) {
    query.set("from", params.filter.from);
  }

  if (params?.filter?.to) {
    query.set("to", params.filter.to);
  }

  if (params?.filter?.search) {
    query.set("search", params.filter.search);
  }

  if (params?.filter?.riskLevels?.length) {
    query.set("riskLevels", params.filter.riskLevels.join(","));
  }

  if (params?.filter?.eventTypes?.length) {
    query.set("eventTypes", params.filter.eventTypes.join(","));
  }

  return query.toString();
}

export async function getSecurityTimeline(
  params?: GetSecurityTimelineParams
): Promise<SecurityTimelineResponse> {
  const query = buildQuery(params);
  const url = `${SECURITY_TIMELINE_URL}?${query}`;

  const response = (await getWebFetcher(
    url
  )) as GenericResponseDto<SecurityTimelineResponse>;

  const isSuccess = response?.ok === true || response?.success === true;

  if (!isSuccess || !response.data) {
    throw new Error(
      response?.userMessage ||
        response?.message ||
        "Security timeline alınamadı."
    );
  }

  return response.data;
}