// src/utils/fetchers.web.client.ts
"use client";

/**
 * Web fetchers
 * - Uses HttpOnly cookie auth through the BFF.
 * - Does not read access tokens from localStorage.
 * - Leaves 401 refresh/retry decisions to BFF proxy helpers.
 * - Adds accept-language, correlation-id and tenant headers.
 */

import { getTenantKey } from "@/utils/tenant.client";
import {
  isSessionExpiredPayload,
  redirectToLoginForSessionExpired,
} from "@/utils/sessionExpiredRedirect.client";

const isBrowser = (): boolean => typeof window !== "undefined";

const envFlag = (key: string): string => {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key] ?? "";
  }

  if (isBrowser() && (window as any)?.[key]) {
    return String((window as any)[key]);
  }

  return "";
};

const CLIENT_LOG_ON = (): boolean => {
  const a = envFlag("NEXT_PUBLIC_LM_FETCH_LOG");
  const b = envFlag("LM_FETCH_LOG");
  return a === "1" || b === "1";
};

const nowMs = (): number =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

const createRequestId = (): string => {
  if (
    typeof globalThis !== "undefined" &&
    (globalThis as any).crypto?.randomUUID
  ) {
    return (globalThis as any).crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
};

const safeJson = async (res: Response) => {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { ok: false, raw: text };
  }
};

const LOCALE_TO_CULTURE: Record<string, string> = {
  ar: "ar-SA",
  de: "de-DE",
  en: "en-US",
  fr: "fr-FR",
  it: "it-IT",
  tr: "tr-TR",
};

const getLocaleFromPathname = (): string | null => {
  if (!isBrowser()) return null;

  const firstSegment = window.location.pathname.split("/").filter(Boolean)[0];
  const locale = firstSegment?.split("-")[0]?.toLowerCase();

  return locale && LOCALE_TO_CULTURE[locale] ? locale : null;
};

const getCurrentLanguage = (): string => {
  if (!isBrowser()) return "tr-TR";

  const pathLocale = getLocaleFromPathname();
  if (pathLocale) return LOCALE_TO_CULTURE[pathLocale];

  const stored =
    localStorage.getItem("lang") || localStorage.getItem("i18nextLng");
  const storedLocale = stored?.split("-")[0]?.toLowerCase();
  if (storedLocale && LOCALE_TO_CULTURE[storedLocale]) {
    return LOCALE_TO_CULTURE[storedLocale];
  }

  return "tr-TR";
};

type FetchJsonOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

const fetchJsonWithWebAuth = async (
  url: string,
  options: FetchJsonOptions = {}
) => {
  const reqId = createRequestId();
  const startedAt = nowMs();
  const method = (options.method ?? "GET").toUpperCase();

  const headers = new Headers(options.headers);
  const tenantKey = getTenantKey();

  if (!headers.has("Content-Type") && method !== "GET") {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("x-correlation-id")) {
    headers.set("x-correlation-id", reqId);
  }

  if (!headers.has("accept-language")) {
    headers.set("accept-language", getCurrentLanguage());
  }

  if (tenantKey && !headers.has("X-Tenant-Key")) {
    headers.set("X-Tenant-Key", tenantKey);
  }

  if (CLIENT_LOG_ON()) {
    console.info("[WEB FETCH][REQ] Sending request", {
      reqId,
      method,
      url,
      tenantKey,
      acceptLanguage: headers.get("accept-language"),
      hasBody: Boolean(options.body),
    });
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  const json = await safeJson(res);
  const elapsedMs = Math.round(nowMs() - startedAt);

const sessionExpired = isSessionExpiredPayload(json, res.status);

if (sessionExpired) {
  if (isBrowser()) {
    window.dispatchEvent(
      new CustomEvent("livemanage:session-expired", {
        detail: {
          source: "fetchers.web.client",
          url,
          status: res.status,
          payload: json,
        },
      }),
    );
  }

  redirectToLoginForSessionExpired();
}

  if (CLIENT_LOG_ON()) {
    console.info("[WEB FETCH][RES] Response received", {
      reqId,
      method,
      url,
      status: res.status,
      ok: res.ok,
      elapsedMs,
      tenantKey: headers.get("X-Tenant-Key") || "(none)",
      envelopeOk: json?.ok,
      keys: Object.keys(json ?? {}),
    });
  }

  if (!res.ok) {
    const message =
      json?.userMessage ||
      json?.message ||
      json?.error ||
      json?.title ||
      `Request failed (${res.status})`;

    if (CLIENT_LOG_ON()) {
      console.error("[WEB FETCH][ERR] Failed response", {
        reqId,
        method,
        url,
        status: res.status,
        tenantKey: headers.get("X-Tenant-Key") || "(none)",
        payload: json,
      });
    }

    const err = new Error(message) as Error & {
      status?: number;
      payload?: any;
      reqId?: string;
      code?: string;
    };

    err.status = res.status;
    err.payload = json;
    err.reqId = reqId;
    err.code = sessionExpired ? "SESSION_EXPIRED" : undefined;
    throw err;
  }

  return json;
};

export const getWebFetcher = (url: string) =>
  fetchJsonWithWebAuth(url, { method: "GET" });

export const postWebFetcher = (url: string, arg: any) =>
  fetchJsonWithWebAuth(url, {
    method: "POST",
    body: JSON.stringify(arg),
  });

export const putWebFetcher = (url: string, arg: any) =>
  fetchJsonWithWebAuth(url, {
    method: "PUT",
    body: JSON.stringify(arg),
  });

export const patchWebFetcher = (url: string, arg: any) =>
  fetchJsonWithWebAuth(url, {
    method: "PATCH",
    body: JSON.stringify(arg),
  });

export const deleteWebFetcher = (url: string, arg?: any) =>
  fetchJsonWithWebAuth(url, {
    method: "DELETE",
    ...(arg ? { body: JSON.stringify(arg) } : {}),
  });

export const putFetcher = putWebFetcher;
export const patchFetcher = patchWebFetcher;
export const deleteFetcher = deleteWebFetcher;
