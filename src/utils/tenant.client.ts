// ============================================================
// File: src/utils/tenant.client.ts
// ============================================================

"use client";

import {
  DEFAULT_TENANT_KEY,
  coerceTenantKey,
  isAllowedTenantKey,
} from "@/lib/tenantKeys";

const TENANT_STORAGE_KEY = "tenantKey";
const TENANT_COOKIE_KEYS = ["tenantKey", "lm.tenant"] as const;
const TENANT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

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

const TENANT_LOG_ON = (): boolean => {
  const a = envFlag("NEXT_PUBLIC_LM_FETCH_LOG");
  const b = envFlag("LM_FETCH_LOG");
  return a === "1" || b === "1";
};

const buildCookieAttributes = (maxAgeSeconds: number): string => {
  const attributes = [
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (window.location.protocol === "https:") {
    attributes.push("Secure");
  }

  return attributes.join("; ");
};

const writeTenantCookies = (tenantKey: string): void => {
  const encoded = encodeURIComponent(tenantKey);
  const attributes = buildCookieAttributes(TENANT_COOKIE_MAX_AGE_SECONDS);

  for (const key of TENANT_COOKIE_KEYS) {
    document.cookie = `${key}=${encoded}; ${attributes}`;
  }
};

const clearTenantCookies = (): void => {
  const attributes = buildCookieAttributes(0);

  for (const key of TENANT_COOKIE_KEYS) {
    document.cookie = `${key}=; ${attributes}`;
  }
};

const readCookieTenant = (): string => {
  if (!isBrowser()) return "";

  const cookieMap = new Map<string, string>();

  for (const part of document.cookie.split("; ")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;

    const key = part.slice(0, index);
    const value = part.slice(index + 1);

    if (TENANT_COOKIE_KEYS.includes(key as (typeof TENANT_COOKIE_KEYS)[number])) {
      cookieMap.set(key, decodeURIComponent(value || ""));
    }
  }

  const candidates = TENANT_COOKIE_KEYS
    .map((key) => cookieMap.get(key))
    .filter(Boolean) as string[];

  const rawTenant = candidates.find(isAllowedTenantKey) ?? candidates[0] ?? "";
  return rawTenant ? coerceTenantKey(rawTenant) : "";
};

export const getTenantKey = (): string => {
  if (!isBrowser()) return "";

  const fromCookie = readCookieTenant();
  if (fromCookie) {
    if (TENANT_LOG_ON()) {
      console.info("🏷️ [TENANT][GET] Tenant key çözümlendi", {
        source: "cookie",
        tenantKey: fromCookie,
      });
    }
    return fromCookie;
  }

  const rawStored = localStorage.getItem(TENANT_STORAGE_KEY);
  if (rawStored) {
    const stored = coerceTenantKey(rawStored);
    if (TENANT_LOG_ON()) {
      console.info("🏷️ [TENANT][GET] Tenant key çözümlendi", {
        source: "localStorage",
        tenantKey: stored,
      });
    }
    return stored;
  }

  const envDefault = coerceTenantKey(envFlag("NEXT_PUBLIC_DEFAULT_TENANT"));
  if (envDefault) {
    if (TENANT_LOG_ON()) {
      console.info("🏷️ [TENANT][GET] Tenant key çözümlendi", {
        source: "env",
        tenantKey: envDefault,
      });
    }
    return envDefault;
  }

  if (TENANT_LOG_ON()) {
    console.info("🏷️ [TENANT][GET] Tenant key bulunamadı", {
      source: "none",
      tenantKey: "",
    });
  }

  return DEFAULT_TENANT_KEY;
};

export const setTenantKey = (tenantKey: string): void => {
  if (!isBrowser()) return;

  const normalized = coerceTenantKey(tenantKey);
  if (!normalized) return;

  localStorage.setItem(TENANT_STORAGE_KEY, normalized);
  writeTenantCookies(normalized);

  if (TENANT_LOG_ON()) {
    console.info("🏷️ [TENANT][SET] Tenant key kaydedildi", {
      tenantKey: normalized,
      persistedTo: ["localStorage", "cookie"],
    });
  }
};

export const clearTenantKey = (): void => {
  if (!isBrowser()) return;

  localStorage.removeItem(TENANT_STORAGE_KEY);
  clearTenantCookies();

  if (TENANT_LOG_ON()) {
    console.info("🏷️ [TENANT][CLEAR] Tenant key temizlendi", {
      clearedFrom: ["localStorage", "cookie"],
    });
  }
};
