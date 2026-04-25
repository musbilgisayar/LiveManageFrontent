// src/app/api/i18n/[lang]/dict/route.ts
export const runtime = "nodejs";

/**
 * 🌍 DICT ROUTE (ANA KAPI)
 * --------------------------------------------------------------------------
 * Bu route i18n sisteminin TEK giriş kapısıdır.
 *
 * Roller:
 * - dict   → ✅ ANA KAPI (frontend burayı çağırır)
 * - bundle → internal provider (backend proxy + cache)
 * - strings→ adapter (opsiyonel)
 *
 * Sorumluluklar:
 * - namespace yönetimi
 * - bundle çağrıları
 * - sonuçları merge etme
 * - tek sözlük döndürme
 */

import { NextRequest, NextResponse } from "next/server";
import {
  newCorrelationId,
  normalizeLang,
  resolveTenantKey,
  resolveAcceptLanguage,
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

/**
 * ns parametresini normalize eder
 */
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
}) {
  const { ns, lang, corrId, tenantKey, acceptLanguage, baseUrl } = params;

const url =
  `${baseUrl}/api/v1.0/localization/bundle` +
  `?ns=${encodeURIComponent(ns)}` +
  `&format=full` +
  `&culture=${encodeURIComponent(acceptLanguage)}`;

  log("➡️ NS FETCH", { ns, url });

  const res = await fetchWithTimeout(
    url,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-correlation-id": corrId,
        "accept-language": acceptLanguage,
        "x-tenant-key": tenantKey,
      },
      cache: "no-store",
    },
    10_000
  );

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    warn("NS FAIL", { ns, status: res.status });
    return {
      ok: false,
      ns,
      data: {},
      status: res.status,
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
  const acceptLanguage = resolveAcceptLanguage(req, culture);

  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    "localhost:3000";

  const proto =
    req.headers.get("x-forwarded-proto") ??
    (process.env.HTTPS === "true" ? "https" : "http");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;

  log("🚀 DICT START", {
    lang,
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