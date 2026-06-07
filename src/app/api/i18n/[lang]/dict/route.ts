// src/app/api/i18n/[lang]/dict/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  newCorrelationId,
  normalizeLang,
  resolveTenantKey,
  fetchWithTimeout,
} from "@/app/api/_shared/bff";

const DEBUG =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_DEBUG_I18N === "true";

function log(msg: string, data?: unknown) {
  if (!DEBUG) return;
  console.log("🌍 [DICT]", msg, data ?? "");
}

function warn(msg: string, data?: unknown) {
  if (!DEBUG) return;
  console.warn("⚠️ [DICT]", msg, data ?? "");
}

function normalizeNamespaces(nsRaw: string): string[] {
  return Array.from(
    new Set(
      nsRaw
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    )
  );
}

/**
 * bundle payload normalize
 */
function unwrapBundle(raw: any): Record<string, string> {
  if (!raw) return {};

  const level1 = raw?.data ?? raw;
  const level2 = level1?.data ?? level1;

  if (!level2 || typeof level2 !== "object") {
    return {};
  }

  const out: Record<string, string> = {};

  for (const [k, v] of Object.entries(level2)) {
    if (v != null) {
      out[String(k)] = String(v);
    }
  }

  return out;
}

function isSessionExpiredPayload(payload: any, status: number): boolean {
  const code =
    payload?.code ??
    payload?.error ??
    payload?.data?.code ??
    payload?.data?.error ??
    payload?.data?.reason;

  return (
    status === 401 &&
    (code === "SESSION_EXPIRED" ||
      code === "SessionExpired" ||
      payload?.message === "auth.sessionExpired")
  );
}

/**
 * TEK namespace bundle fetch
 */
async function fetchNamespaceBundle(params: {
  ns: string;
  lang: string;
  corrId: string;
  tenantKey: string;
  acceptLanguage: string;
  baseUrl: string;
  cookieHeader: string;
}) {
  const { ns, lang, corrId, tenantKey, acceptLanguage, baseUrl, cookieHeader } = params;

  const url =
    `${baseUrl}/api/v1.0/localization/bundle` +
    `?ns=${encodeURIComponent(ns)}` +
    `&format=full` +
    `&culture=${encodeURIComponent(acceptLanguage)}`;

  log("➡️ NS FETCH", {
    ns,
    lang,
    acceptLanguage,
    url,
  });

  const res = await fetchWithTimeout(
    url,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-correlation-id": corrId,
        "accept-language": acceptLanguage,
        "x-tenant-key": tenantKey,
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
      cache: "no-store",
    },
    10_000
  );

  const json = await res.json().catch(() => null);
  const setCookie = res.headers.get("set-cookie");

  if (!res.ok) {
    warn("NS FAIL", { ns, status: res.status });
    return {
      ok: false,
      ns,
      data: {},
      status: res.status,
      payload: json,
      setCookie,
    };
  }

  const normalized = unwrapBundle(json);

  log("✅ NS OK", {
    ns,
    keyCount: Object.keys(normalized).length,
  });

  return {
    ok: true,
    ns,
    data: normalized,
    status: res.status,
    payload: json,
    setCookie,
  };
}

type Ctx = {
  params: Promise<{ lang?: string }>;
};

export async function GET(req: NextRequest, ctx: Ctx) {
  const { lang: rawLang } = await ctx.params;

  const { short: lang, culture } = normalizeLang(rawLang);

  const url = new URL(req.url);
  const nsParam = url.searchParams.get("ns") || "common";
  const nsList = normalizeNamespaces(nsParam);

  const corrId = newCorrelationId(req.headers);
  const { tenantKey } = resolveTenantKey(req);

  /**
   * LFOS:
   * Route locale authoritative.
   *
   * /api/i18n/de/dict çağrıldıysa culture kesin de-DE olmalıdır.
   * Cookie veya Accept-Language route locale'i override etmemelidir.
   */
  const acceptLanguage = culture;

  const cookieHeader = req.headers.get("cookie") || "";

  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    "localhost:3000";

  const proto =
    req.headers.get("x-forwarded-proto") ??
    (process.env.HTTPS === "true" ? "https" : "http");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;

  log("🚀 DICT START", {
    rawLang,
    lang,
    culture,
    acceptLanguage,
    nsList,
    tenantKey,
    corrId,
  });

  try {
    const results = await Promise.all(
      nsList.map((ns) =>
        fetchNamespaceBundle({
          ns,
          lang,
          corrId,
          tenantKey,
          acceptLanguage,
          baseUrl,
          cookieHeader,
        })
      )
    );

    const merged = Object.assign(
      {},
      ...results.map((r) => r.data ?? {})
    );

    const failed = results.filter((r) => !r.ok);

    if (failed.length > 0) {
      warn("⚠️ PARTIAL FAIL", failed);
    }

    const sessionExpired = failed.find((item) =>
      isSessionExpiredPayload((item as any).payload, item.status)
    );

    if (sessionExpired) {
      const headers = new Headers({
        "x-correlation-id": corrId,
      });

      for (const result of results) {
        const cookie = (result as any).setCookie;
        if (cookie) {
          headers.append("set-cookie", cookie);
        }
      }

      return NextResponse.json(
        {
          ok: false,
          status: 401,
          code: "SESSION_EXPIRED",
          error: "SESSION_EXPIRED",
          message: "auth.sessionExpired",
          lang,
          ns: nsList,
          data: merged,
          failed,
        },
        {
          status: 401,
          headers,
        }
      );
    }

    log("📦 DICT READY", {
      nsCount: nsList.length,
      keyCount: Object.keys(merged).length,
    });

    return NextResponse.json(
      {
        ok: failed.length === 0,
        lang,
        ns: nsList,
        data: merged,
        failed,
      },
      {
        status: 200,
        headers: {
          "x-correlation-id": corrId,
        },
      }
    );
  } catch (err: any) {
    warn("💥 DICT ERROR", err?.message);

    return NextResponse.json(
      {
        ok: false,
        lang,
        ns: nsList,
        data: {},
        error: "DICT_FETCH_FAILED",
      },
      {
        status: 200,
        headers: {
          "x-correlation-id": corrId,
        },
      }
    );
  }
}
