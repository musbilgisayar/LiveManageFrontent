//src/utils/fetchers.client.ts
// ⚠️ LEGACY - kullanma (web için)
// Yeni: fetchers.web.client.ts
"use client";

/**
 * ✅ Client fetchers
 * - access token ekler
 * - 401 → refresh → retry
 * - accept-language + correlation-id ekler
 * - tenant key ekler
 * - istemci tarafı log üretir
 */
/*
import { getTenantKey } from "@/utils/tenant.client";

const ACCESS_TOKEN_KEY = "accessToken";
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
  if (typeof globalThis !== "undefined" && (globalThis as any).crypto?.randomUUID) {
    return (globalThis as any).crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random()}`;
};

const maskAuth = (auth?: string | null): string => {
  if (!auth) return "(yok)";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (token.length <= 14) return `Bearer ${token}`;
  return `Bearer ${token.slice(0, 6)}…${token.slice(-6)}`;
};

const getaccessToken = (): string | null =>
  isBrowser() ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;

const setaccessToken = (token: string): void => {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
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

const refreshaccessToken = async (reqId: string): Promise<string | null> => {
  const tenantKey = getTenantKey();

  try {
    if (CLIENT_LOG_ON()) {
      console.info("🟡 [FETCH][REFRESH][REQ] Access token yenileniyor", {
        reqId,
        tenantKey,
        endpoint: REFRESH_ENDPOINT,
      });
    }

    const res = await fetch(REFRESH_ENDPOINT, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Key": tenantKey,
      },
    });

    if (!res.ok) {
      if (CLIENT_LOG_ON()) {
        console.warn("🟠 [FETCH][REFRESH][RES] Refresh başarısız", {
          reqId,
          tenantKey,
          status: res.status,
        });
      }
      return null;
    }

    const json: any = await safeJson(res);
    const newToken = json?.accessToken ?? json?.data?.accessToken ?? null;

    if (typeof newToken === "string" && newToken.length > 0) {
      setaccessToken(newToken);

      if (CLIENT_LOG_ON()) {
        console.info("🟢 [FETCH][REFRESH][RES] Refresh başarılı", {
          reqId,
          tenantKey,
        });
      }

      return newToken;
    }

    if (CLIENT_LOG_ON()) {
      console.warn("🟠 [FETCH][REFRESH][RES] Refresh cevabında access token bulunamadı", {
        reqId,
        tenantKey,
        keys: Object.keys(json ?? {}),
      });
    }

    return null;
  } catch (error: any) {
    if (CLIENT_LOG_ON()) {
      console.error("🔴 [FETCH][REFRESH][EX] Refresh sırasında hata oluştu", {
        reqId,
        tenantKey,
        message: error?.message ?? String(error),
      });
    }

    return null;
  }
};

type FetchJsonOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

const fetchJsonWithAuth = async (url: string, options: FetchJsonOptions = {}) => {
  const reqId = createRequestId();
  const startedAt = nowMs();
  const method = (options.method ?? "GET").toUpperCase();

  const headers = new Headers(options.headers);
  const tenantKey = getTenantKey();
  const token = getaccessToken();

  if (!headers.has("Content-Type") && method !== "GET") {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("x-correlation-id")) {
    headers.set("x-correlation-id", reqId);
  }

  if (!headers.has("accept-language")) {
    headers.set("accept-language", getCurrentLanguage());
  }

  if (!headers.has("X-Tenant-Key")) {
    headers.set("X-Tenant-Key", tenantKey);
  }

  if (CLIENT_LOG_ON()) {
    console.info("🔵 [FETCH][REQ] İstek gönderiliyor", {
      reqId,
      method,
      url,
      tenantKey,
      acceptLanguage: headers.get("accept-language"),
      authorization: maskAuth(headers.get("Authorization")),
      hasBody: Boolean(options.body),
    });
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    if (CLIENT_LOG_ON()) {
      console.warn("🟠 [FETCH][401] 401 alındı, refresh denenecek", {
        reqId,
        method,
        url,
        tenantKey,
      });
    }

    const newToken = await refreshaccessToken(reqId);

    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      headers.set("X-Tenant-Key", getTenantKey());

      res = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });
    }
  }

  const json = await safeJson(res);
  const elapsedMs = Math.round(nowMs() - startedAt);

  if (CLIENT_LOG_ON()) {
    console.info("🟣 [FETCH][RES] Yanıt alındı", {
      reqId,
      method,
      url,
      status: res.status,
      ok: res.ok,
      elapsedMs,
      tenantKey: headers.get("X-Tenant-Key"),
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
      console.error("🔴 [FETCH][ERR] Başarısız yanıt", {
        reqId,
        method,
        url,
        status: res.status,
        tenantKey: headers.get("X-Tenant-Key"),
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
  fetchJsonWithAuth(url, { method: "GET" });

export const postWebFetcher = (url: string, arg: any) =>
  fetchJsonWithAuth(url, { method: "POST", body: JSON.stringify(arg) });

export const putFetcher = (url: string, arg: any) =>
  fetchJsonWithAuth(url, { method: "PUT", body: JSON.stringify(arg) });

export const patchFetcher = (url: string, arg: any) =>
  fetchJsonWithAuth(url, { method: "PATCH", body: JSON.stringify(arg) });

export const deleteFetcher = (url: string, arg?: any) =>
  fetchJsonWithAuth(url, {
    method: "DELETE",
    ...(arg ? { body: JSON.stringify(arg) } : {}),
  });*/