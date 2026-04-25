//src/utils/fetchers.web.client.ts
"use client";

/**
 * Web fetchers
 * - HttpOnly cookie tabanlı çalışır
 * - access token localStorage'dan okunmaz
 * - 401 → BFF refresh → retry
 * - accept-language + correlation-id ekler
 * - tenant key sadece varsa eklenir
 */

import { getTenantKey } from "@/utils/tenant.client";

const REFRESH_ENDPOINT = "/api/v1.0/account/refresh";

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

const getCurrentLanguage = (): string => {
  if (!isBrowser()) return "tr-TR";

  return (
    localStorage.getItem("lang") ||
    localStorage.getItem("i18nextLng") ||
    navigator.language ||
    "tr-TR"
  );
};

function isRefreshResponseSuccessful(payload: any): boolean {
  if (!payload || typeof payload !== "object") return false;

  if (payload.ok === true) return true;
  if (payload.isSuccess === true) return true;
  if (payload.success === true) return true;

  if (payload.data && typeof payload.data === "object") {
    if (payload.data.isSuccess === true) return true;
    if (payload.data.success === true) return true;
  }

  return false;
}

const refreshWebSession = async (
  reqId: string
): Promise<{ ok: boolean; payload?: any; status?: number }> => {
  const tenantKey = getTenantKey();

  try {
    if (CLIENT_LOG_ON()) {
      console.info("🟡 [WEB FETCH][REFRESH][REQ] Oturum yenileniyor", {
        reqId,
        tenantKey,
        endpoint: REFRESH_ENDPOINT,
      });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (tenantKey) {
      headers["X-Tenant-Key"] = tenantKey;
    }

    const res = await fetch(REFRESH_ENDPOINT, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers,
    });

    const payload = await safeJson(res);
    const bodyOk = isRefreshResponseSuccessful(payload);
    const finalOk = res.ok && bodyOk;

    if (!finalOk) {
      if (CLIENT_LOG_ON()) {
        console.warn("🟠 [WEB FETCH][REFRESH][RES] Refresh başarısız", {
          reqId,
          tenantKey,
          status: res.status,
          responseOk: res.ok,
          bodyOk,
          payload,
        });
      }

      return {
        ok: false,
        payload,
        status: res.status,
      };
    }

    if (CLIENT_LOG_ON()) {
      console.info("🟢 [WEB FETCH][REFRESH][RES] Refresh başarılı", {
        reqId,
        tenantKey,
        status: res.status,
      });
    }

    return {
      ok: true,
      payload,
      status: res.status,
    };
  } catch (error: any) {
    if (CLIENT_LOG_ON()) {
      console.error("🔴 [WEB FETCH][REFRESH][EX] Refresh hatası", {
        reqId,
        tenantKey,
        message: error?.message ?? String(error),
      });
    }

    return {
      ok: false,
      status: 0,
    };
  }
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
    console.info("🔵 [WEB FETCH][REQ] İstek gönderiliyor", {
      reqId,
      method,
      url,
      tenantKey,
      acceptLanguage: headers.get("accept-language"),
      hasBody: Boolean(options.body),
    });
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 401) {
    if (CLIENT_LOG_ON()) {
      console.warn("🟠 [WEB FETCH][401] 401 alındı, refresh denenecek", {
        reqId,
        method,
        url,
        tenantKey,
      });
    }

    const refreshResult = await refreshWebSession(reqId);

    if (refreshResult.ok) {
      res = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
        cache: "no-store",
      });
    } else {
      if (CLIENT_LOG_ON()) {
        console.warn("🔴 [WEB FETCH][401] Refresh başarısız, retry yapılmadı", {
          reqId,
          method,
          url,
          tenantKey,
          refreshStatus: refreshResult.status,
          refreshPayload: refreshResult.payload,
        });
      }
    }
  }

  const json = await safeJson(res);
  const elapsedMs = Math.round(nowMs() - startedAt);

  if (CLIENT_LOG_ON()) {
    console.info("🟣 [WEB FETCH][RES] Yanıt alındı", {
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
      json?.message ||
      json?.error ||
      json?.title ||
      `Request failed (${res.status})`;

    if (CLIENT_LOG_ON()) {
      console.error("🔴 [WEB FETCH][ERR] Başarısız yanıt", {
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
    };

    err.status = res.status;
    err.payload = json;
    err.reqId = reqId;
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