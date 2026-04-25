//src/modules/localization/services/localizationService.ts
"use client";

import { API_BASE as CONFIG_API_BASE } from "@/lib/config";

export const API_VERSION = "1.0";
export const API_BASE = CONFIG_API_BASE || "";
export const ENABLE_NET_LOG = true;

export interface LanguageItem {
  cultureCode: string;
  name: string;
  flagEmoji: string;
  isDefault: boolean;
}

export interface TranslationDto {
  id: number;
  key: string;
  value: string | null;
  version: string | null;
  cultureCode?: string;
}

type ValueMap = Record<string, string>;

function createCorrelationId() {
  try {
    return (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export function commonHeaders(extra?: HeadersInit): HeadersInit {
  return {
    accept: "application/json",
    "Content-Type": "application/json",
    "x-correlation-id": createCorrelationId(),
    "x-client-version": "lm-frontend/locmgr-1.3.0",
    "x-audit-action": "Localization",
    "x-audit-entity": "LocalizationKey",
    "x-audit-sensitive": "none",
    ...(extra || {}),
  };
}

export async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const startedAt = performance.now();

  const res = await fetch(input, {
    ...init,
    headers: commonHeaders(init?.headers || {}),
    cache: "no-store",
  });

  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    if (res.status === 204) {
      ENABLE_NET_LOG && console.info("[net] 204 No Content", input);
      return {} as T;
    }

    const err = new Error(`HTTP ${res.status} (non-JSON)`) as Error & {
      response?: Response;
    };
    err.response = res;
    throw err;
  } finally {
    const ms = (performance.now() - startedAt).toFixed(0);
    ENABLE_NET_LOG &&
      console.debug("[net] response", {
        url: String(input),
        status: res.status,
        ms,
      });
  }

  if (payload && typeof payload === "object" && "ok" in payload) {
    if ((payload as any).ok) return (payload as any).data as T;

    const err = new Error("API_ERROR") as Error & {
      response?: Response;
      body?: any;
    };
    err.response = res;
    err.body = (payload as any).error ?? payload;
    throw err;
  }

  if (Array.isArray(payload)) return payload as T;
  if ((payload as any)?.data && Array.isArray((payload as any).data)) {
    return (payload as any).data as T;
  }

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`) as Error & {
      response?: Response;
      body?: any;
    };
    err.response = res;
    err.body = payload;
    throw err;
  }

  return payload as T;
}

export function prettyApiError(e: any): string {
  const status = e?.body?.status ?? e?.response?.status;
  const upstreamMsg =
    e?.body?.data?.message ??
    e?.body?.data?.title ??
    e?.body?.data?.detail ??
    e?.body?.message ??
    e?.message;

  const validationErrors = e?.body?.data?.errors || e?.body?.errors;
  if (validationErrors && typeof validationErrors === "object") {
    const parts = Object.entries(validationErrors).flatMap(([k, v]) =>
      Array.isArray(v) ? v.map((m) => `${k}: ${m}`) : [`${k}: ${String(v)}`],
    );

    if (parts.length) return `Doğrulama hatası:\n• ${parts.join("\n• ")}`;
  }

  if (e?.body?.message === "UPSTREAM_NETWORK_ERROR") {
    return "Sunucuya bağlanırken ağ/TLS hatası oluştu. Backend’in ayakta olduğundan emin olun.";
  }

  switch (status) {
    case 400:
      return `Geçersiz istek. ${upstreamMsg ?? ""}`.trim();
    case 401:
      return "Yetkisiz istek. Lütfen oturum açın veya token’ınızı kontrol edin.";
    case 403:
      return "Bu işlemi yapma yetkiniz yok (403).";
    case 404:
      return "Kaynak bulunamadı (404).";
    case 409:
      return "Çakışma / eşzamanlı güncelleme (409).";
    case 422:
      return `İş kuralı hatası (422). ${upstreamMsg ?? ""}`.trim();
    case 500:
      return "Sunucu hatası (500).";
    default:
      return upstreamMsg ? String(upstreamMsg) : "Beklenmeyen bir hata oluştu.";
  }
}

/* ---------- Domain fonksiyonları ---------- */

export async function getLanguages(): Promise<LanguageItem[]> {
  const url = `${API_BASE}/api/v${API_VERSION}/culture/list`;
  const response = await fetchJson<any>(url);

  let languagesData: LanguageItem[] = [];
  if (Array.isArray(response)) languagesData = response;
  else if (response?.data && Array.isArray(response.data)) languagesData = response.data;
  else if (response?.items && Array.isArray(response.items)) languagesData = response.items;
  else if (response?.success && Array.isArray(response.data)) languagesData = response.data;

  return languagesData;
}

export async function getTranslationDetail(
  ns: string,
  fullKey: string,
  cultureCode: string,
): Promise<TranslationDto | null> {
 const url = `${API_BASE}/api/v${API_VERSION}/localization/manager/search?culture=${encodeURIComponent(
  cultureCode,
)}&ns=${encodeURIComponent(ns)}&contains=${encodeURIComponent(fullKey)}`;

  const list = await fetchJson<TranslationDto[]>(url, {
    headers: {
      "Accept-Language": cultureCode,
    },
  });

  const arr = Array.isArray(list) ? list : [];
  const item = arr.find((x) => x.key === fullKey) || null;

  if (item && !item.cultureCode) {
    item.cultureCode = cultureCode;
  }

  return item;
}

export async function upsertTranslation(
  fullKey: string,
  cultureCode: string,
  value: string,
  expectedRowVersion: string | null,
  nsForCacheInvalidate: string,
): Promise<void> {
 
  const url = `${API_BASE}/api/v${API_VERSION}/localization/manager/upsert`;
  const body = {
    key: fullKey,
    culture: cultureCode,
    value,
    expectedRowVersion,
    audit: {
      modifiedBy: "admin",
      reason: "Localization detail save",
      sourceIp: "127.0.0.1",
    },
  };

  await fetchJson(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Accept-Language": cultureCode,
      "x-cache-invalidate": nsForCacheInvalidate,
      "x-audit-sensitive": "none",
    },
  });
}

export async function createNewKeyForAllLanguages(
  ns: string,
  shortKey: string,
  values: ValueMap,
  languages: LanguageItem[],
): Promise<void> {
  const composedKey = `${ns}:${shortKey}`;

  for (const lang of languages) {
    const culture = lang.cultureCode;
    const value = values[culture] ?? "";
    await upsertTranslation(composedKey, culture, value, null, ns);
  }
}

export async function getTranslationsByNamespace(
  ns: string,
  cultures: string[],
): Promise<TranslationDto[]> {
  const results: TranslationDto[] = [];

  const promises = cultures.map(async (culture) => {
   
    const url = `${API_BASE}/api/v${API_VERSION}/localization/manager/search?culture=${encodeURIComponent(
  culture,
)}&ns=${encodeURIComponent(ns)}`;
    const list = await fetchJson<TranslationDto[]>(url, {
      headers: {
        "Accept-Language": culture,
      },
    });

    const arr = Array.isArray(list) ? list : [];
    return arr.map((t) => ({
      ...t,
      cultureCode: t.cultureCode ?? culture,
    })) as TranslationDto[];
  });

  const settled = await Promise.allSettled(promises);
  for (const r of settled) {
    if (r.status === "fulfilled") {
      results.push(...r.value);
    }
  }

  return results;
}

export async function createKeyForLanguages(
  ns: string,
  key: string,
  values: Record<string, string>,
  languages: LanguageItem[],
): Promise<void> {
  const trimmedNs = ns.trim();
  const trimmedKey = key.trim();

  if (!trimmedNs || !trimmedKey) {
    throw new Error("Namespace ve key zorunludur.");
  }

  const composedKey = `${trimmedNs}:${trimmedKey}`;

  await Promise.all(
    languages.map(async (lang) => {
      const culture = lang.cultureCode;
      const value = values[culture] ?? "";
    
      const url = `${API_BASE}/api/v${API_VERSION}/localization/manager/upsert`;

      await fetchJson(url, {
        method: "POST",
        body: JSON.stringify({
          key: composedKey,
          culture,
          value,
          expectedRowVersion: null,
          audit: {
            modifiedBy: "admin",
            reason: "Create new key",
            sourceIp: "127.0.0.1",
          },
        }),
        headers: {
          "Accept-Language": culture,
          "x-cache-invalidate": trimmedNs,
          "x-audit-sensitive": "none",
        },
      });
    }),
  );
}