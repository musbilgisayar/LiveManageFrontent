// src/app/api/v1.0/[lang]/localization/strings/route.ts
export const runtime = "nodejs";

/**
 * localization/strings BFF route
 * --------------------------------------------------------------------------
 * Bu route artık i18n için ana/public giriş noktası değildir.
 *
 * Ana kapı:
 * - /api/i18n/[lang]/dict
 *
 * Bu route'un rolü:
 * - istemciden gelen keys ve/veya ns bilgisini almak
 * - gerekirse keys içinden namespace üretmek
 * - ana kapı olan /api/i18n/[lang]/dict route'una yönlendirmek
 * - adapter/facade gibi davranmak
 *
 * Özet:
 * - dict = ana kapı
 * - bundle = iç veri kaynağı
 * - strings = yardımcı adapter
 */

import { NextRequest, NextResponse } from "next/server";
import {
  fetchWithTimeout,
  newCorrelationId,
  normalizeLang,
  pickClientAuth,
  resolveAcceptLanguage,
  resolveTenantKey,
} from "@/app/api/_shared/bff";

type Ctx = {
  params: Promise<{ lang: string }>;
};

/**
 * keys içinden namespace çıkarır.
 *
 * Örnek:
 * - users:list.title  -> users
 * - users.list.title  -> users
 * - common:buttons.ok -> common
 */
function extractNamespacesFromKeys(keys: string): string[] {
  const nsSet = new Set<string>();

  for (const raw of keys.split(",")) {
    const key = raw.trim();
    if (!key) continue;

    const colonIndex = key.indexOf(":");
    const dotIndex = key.indexOf(".");

    if (colonIndex > 0 && (dotIndex < 0 || colonIndex < dotIndex)) {
      nsSet.add(key.slice(0, colonIndex));
      continue;
    }

    if (dotIndex > 0) {
      nsSet.add(key.slice(0, dotIndex));
    }
  }

  return Array.from(nsSet).sort();
}

/**
 * Mevcut ns ile keys'ten türeyen namespace'leri birleştirir.
 */
function mergeNamespaces(currentNs: string, derivedNamespaces: string[]): string {
  const all = new Set<string>();

  for (const value of currentNs.split(",")) {
    const clean = value.trim();
    if (clean) {
      all.add(clean);
    }
  }

  for (const ns of derivedNamespaces) {
    const clean = ns.trim();
    if (clean) {
      all.add(clean);
    }
  }

  return Array.from(all).sort().join(",");
}

/**
 * Request host/proto bilgisinden mevcut uygulamanın base URL'sini üretir.
 *
 * Amaç:
 * Bu adapter route, ana kapı olan /api/i18n/[lang]/dict route'unu çağırırken
 * doğru origin'i kullanabilsin.
 */
function resolveAppBaseUrl(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    "localhost:3000";

  const proto =
    req.headers.get("x-forwarded-proto") ??
    (process.env.HTTPS === "true" ? "https" : "http");

  return process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const { lang: rawLang } = await ctx.params;
  const { short } = normalizeLang(rawLang);

  const keys = (req.nextUrl.searchParams.get("keys") ?? "").trim();
  const ns = (req.nextUrl.searchParams.get("ns") ?? "").trim();

  const correlationId = newCorrelationId(req.headers);
  const pickedAuth = pickClientAuth(req);
  const { tenantKey } = resolveTenantKey(req);
  const acceptLanguage = resolveAcceptLanguage(
    req,
    `${short}-${short.toUpperCase()}`
  );

  /**
   * Eğer keys geldiyse, bunlardan namespace çıkar.
   * Sonra mevcut ns ile birleştir.
   */
  const derivedNamespaces = keys ? extractNamespacesFromKeys(keys) : [];
  const mergedNamespaces = mergeNamespaces(ns, derivedNamespaces);

  /**
   * Ana/public kapı olan dict route'una yönlen.
   */
  const appBaseUrl = resolveAppBaseUrl(req);
  const targetUrl = new URL(
    `${appBaseUrl}/api/i18n/${encodeURIComponent(short)}/dict`
  );

  if (mergedNamespaces) {
    targetUrl.searchParams.set("ns", mergedNamespaces);
  }

  console.group("🟦 [BFF localization/strings]");
  console.log("➡️ Adapter başladı", {
    correlationId,
    rawLang,
    resolvedLang: short,
    keys: keys || "(yok)",
    ns: ns || "(yok)",
    derivedNamespaces,
    mergedNamespaces: mergedNamespaces || "(yok)",
    targetUrl: targetUrl.toString(),
    tenantKey,
    acceptLanguage,
    authSource: pickedAuth?.source ?? "none",
    hasAuth: !!pickedAuth,
  });

  const upstreamHeaders: Record<string, string> = {
    accept: "application/json",
    "x-correlation-id": correlationId,
    "accept-language": acceptLanguage,
    "x-tenant-key": tenantKey,
  };

  if (pickedAuth) {
    upstreamHeaders.authorization = pickedAuth.header;
  }

  const upstream = await fetchWithTimeout(
    targetUrl.toString(),
    {
      method: "GET",
      headers: upstreamHeaders,
      cache: "no-store",
    },
    10_000
  );

  const body = await upstream.text().catch(() => "");

  console.log("⬅️ Adapter response", {
    correlationId,
    status: upstream.status,
    ok: upstream.ok,
    authSource: pickedAuth?.source ?? "none",
  });
  console.groupEnd();

  /**
   * Bu adapter route, ana kapı olan dict route'unun gövdesini geçirir.
   *
   * Not:
   * Şimdilik mevcut davranışla uyumlu kalmak için response status 200 dönüyoruz.
   * Daha sonra sistem genelinde error semantics standardı netleşirse
   * upstream status koruma kararı ayrıca uygulanabilir.
   */
  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-correlation-id": correlationId,
      "x-audit-log": upstream.headers.get("x-audit-log") ?? "adapter",
      ETag: upstream.headers.get("etag") ?? "",
      "Cache-Control":
        upstream.headers.get("cache-control") ?? "public, max-age=300",
      Vary:
        upstream.headers.get("vary") ??
        "Accept-Language, Authorization, X-Tenant-Key",
    },
  });
}