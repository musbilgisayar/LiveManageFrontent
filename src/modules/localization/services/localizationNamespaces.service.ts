import {
  LocalizationNamespaceRow,
  LocalizationNamespacesResponse,
} from "../types/LocalizationNamespace.types";

const API_VERSION = "1.0";

function createCorrelationId() {
  return crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

function normalizeNamespaces(raw: LocalizationNamespacesResponse): LocalizationNamespaceRow[] {
  let list: string[] = [];

  if (Array.isArray(raw)) list = raw;
  else if (Array.isArray(raw.data)) list = raw.data;
  else if (Array.isArray(raw.items)) list = raw.items;
  else throw new Error("Namespace listesi beklenen formatta değil.");

  return list.map((name) => ({
    id: name,
    name,
  }));
}

function prettyApiError(e: any): string {
  const status = e?.body?.status ?? e?.response?.status;
  const msg =
    e?.body?.userMessage ??
    e?.body?.message ??
    e?.body?.data?.message ??
    e?.body?.title ??
    e?.body?.detail ??
    e?.message;

  return `[${status ?? "Error"}] ${msg ?? "Bilinmeyen hata"}`;
}

export const localizationNamespacesService = {
  async getNamespaces(locale: string, signal?: AbortSignal) {
    const res = await fetch(
      `/api/v${API_VERSION}/localization/manager/namespaces`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "Accept-Language": locale || "tr-TR",
          "x-correlation-id": createCorrelationId(),
          "x-client-version": "lm-frontend/namespaces-1.0.0",
        },
        cache: "no-store",
        signal,
      }
    );

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(`HTTP ${res.status}`) as Error & {
        response?: Response;
        body?: any;
      };

      error.response = res;
      error.body = json;
      throw error;
    }

    return normalizeNamespaces(json);
  },

  prettyApiError,
};