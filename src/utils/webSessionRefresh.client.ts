"use client";

import { getTenantKey } from "@/utils/tenant.client";

const REFRESH_ENDPOINT = "/api/v1.0/account/refresh";

type RefreshResult = {
  ok: boolean;
  payload?: any;
  status?: number;
};

let refreshInFlight: Promise<RefreshResult> | null = null;

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

const getCurrentLanguage = (): string => {
  if (!isBrowser()) return "tr-TR";

  const firstSegment = window.location.pathname.split("/").filter(Boolean)[0];
  const pathLocale = firstSegment?.split("-")[0]?.toLowerCase();

  if (pathLocale && LOCALE_TO_CULTURE[pathLocale]) {
    return LOCALE_TO_CULTURE[pathLocale];
  }

  const stored =
    localStorage.getItem("lang") || localStorage.getItem("i18nextLng");
  const storedLocale = stored?.split("-")[0]?.toLowerCase();

  if (storedLocale && LOCALE_TO_CULTURE[storedLocale]) {
    return LOCALE_TO_CULTURE[storedLocale];
  }

  return "tr-TR";
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

async function executeRefreshWebSession(reqId?: string): Promise<RefreshResult> {
  const tenantKey = getTenantKey();

  try {
    if (CLIENT_LOG_ON()) {
      console.info("[WEB REFRESH][REQ] Oturum yenileniyor", {
        reqId,
        tenantKey,
        endpoint: REFRESH_ENDPOINT,
      });
    }

    const headers: Record<string, string> = {
      accept: "application/json",
      "accept-language": getCurrentLanguage(),
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
        console.warn("[WEB REFRESH][RES] Refresh basarisiz", {
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
      console.info("[WEB REFRESH][RES] Refresh basarili", {
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
      console.error("[WEB REFRESH][EX] Refresh hatasi", {
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
}

export function refreshWebSession(reqId?: string): Promise<RefreshResult> {
  if (!refreshInFlight) {
    refreshInFlight = executeRefreshWebSession(reqId).finally(() => {
      refreshInFlight = null;
    });
  } else if (CLIENT_LOG_ON()) {
    console.info("[WEB REFRESH][JOIN] Devam eden refresh bekleniyor", {
      reqId,
    });
  }

  return refreshInFlight;
}
