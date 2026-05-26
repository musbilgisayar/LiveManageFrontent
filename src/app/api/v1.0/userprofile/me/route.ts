// src/app/api/v1.0/userprofile/me/route.ts

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { cacheSet } from "@/app/api/_shared/bff";
import { resolveCorrelationId } from "@/lib/bff/webAuthProxyCore";
import {
  normalizeLanguageSegment,
  buildUserScopedCacheKey,
} from "@/lib/bff/userScopedCache";
import { proxyJsonWithWebAuthCached } from "@/lib/bff/proxyJsonWithWebAuthCached";

function toPrefix(value?: string | null): string {
  return (value ?? "tr").split("-")[0].toLowerCase();
}

function resolveLangSeg(req: NextRequest, routeLang?: string): string {
  if (routeLang) return toPrefix(routeLang);

  const cookieLang = req.cookies.get("lm.lang")?.value;
  if (cookieLang) return toPrefix(cookieLang);

  const acceptLanguage = req.headers.get("accept-language");
  if (acceptLanguage) {
    return toPrefix(acceptLanguage.split(",")[0]?.trim());
  }

  return "tr";
}

function extractProfile(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const obj = payload as Record<string, any>;
  return obj.data?.data ?? obj.data ?? obj;
}

export async function GET(req: NextRequest) {
  const langSeg = resolveLangSeg(req);

  const cacheKey = buildUserScopedCacheKey({
    namespace: `userprofile:me:${langSeg}`,
    req,
    languageSegment: normalizeLanguageSegment(langSeg),
    includeCookieHeader: false,
  });

  return proxyJsonWithWebAuthCached(req, {
    url: "/api/v1.0/account/me",
    method: "GET",
    logLabel: "UserProfile.Me.GET",
    authMode: "client-or-service-token",
    cache: {
      key: cacheKey,
      ttlSeconds: 10,
      requestIfNoneMatch: req.headers.get("if-none-match"),
      cacheControl: "private, max-age=10",
      vary: "Accept-Language, Authorization",
      use304: true,
    },
    transformResponse: (payload, context) => {
      if (context.upstreamStatus >= 200 && context.upstreamStatus < 300) {
        const profile = extractProfile(payload);

        const headers = new Headers();
        headers.set("x-correlation-id", context.correlationId);

        return {
          body: {
            ok: true,
            status: context.upstreamStatus,
            data: profile,
            error: null,
          },
          status: 200,
          headers,
          cache: {
            enabled: true,
            value: profile,
            ttlSeconds: 10,
            auditLog: "success",
            etagSource: profile,
            cacheControl: "private, max-age=10",
            vary: "Accept-Language, Authorization",
          },
        };
      }

      const headers = new Headers();
      headers.set("x-correlation-id", context.correlationId);
      headers.set("x-audit-log", "failed");
      headers.set("vary", "Accept-Language, Authorization");

      return {
        body: {
          ok: false,
          status: context.upstreamStatus,
          data: null,
          error: "UPSTREAM_NOT_OK",
          payload,
        },
        status: 200,
        headers,
        cache: {
          enabled: false,
        },
      };
    },
  });
}

export async function PATCH(req: NextRequest) {
  const langSeg = resolveLangSeg(req);
  const bodyText = await req.text().catch(() => "");

  const cacheKey = buildUserScopedCacheKey({
    namespace: `userprofile:me:${langSeg}`,
    req,
    languageSegment: normalizeLanguageSegment(langSeg),
    includeCookieHeader: false,
  });

  return proxyJsonWithWebAuthCached(req, {
    url: "/api/v1.0/account/me",
    method: "PATCH",
    body: bodyText,
    logLabel: "UserProfile.Me.PATCH",
    authMode: "client-or-service-token",
    cache: false,
    extraHeaders: {
      "content-type": req.headers.get("content-type") ?? "application/json",
    },
    transformResponse: (payload, context) => {
      if (context.upstreamStatus >= 200 && context.upstreamStatus < 300) {
        cacheSet(cacheKey, null as any, 0);
      }

      const headers = new Headers();
      headers.set("x-correlation-id", context.correlationId);
      headers.set("vary", "Accept-Language, Authorization");

      return {
        body: payload,
        status: 200,
        headers,
      };
    },
  });
}
