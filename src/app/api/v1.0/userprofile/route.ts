// src/app/api/v1.0/userprofile/route.ts

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { cacheGet, cacheSet } from "@/app/api/_shared/bff";
import { resolveCorrelationId } from "@/lib/bff/webAuthProxyCore";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1.0";

const BFF_LOG =
  process.env.LM_BFF_LOG === "1" ||
  process.env.NEXT_PUBLIC_LM_BFF_LOG === "1";

function log(...args: any[]) {
  if (!BFF_LOG) return;
  console.log(...args);
}

function authHashFromRequest(req: NextRequest): string {
  const authHeader =
    req.headers.get("authorization") ||
    req.headers.get("Authorization") ||
    req.cookies.get("accessToken")?.value ||
    req.cookies.get("access_token")?.value ||
    req.cookies.get("lm_at")?.value ||
    req.headers.get("cookie") ||
    "";

  const key = String(authHeader ?? "").trim();
  if (!key) return "noauth";

  return crypto.createHash("sha1").update(key).digest("hex").slice(0, 12);
}

function buildCacheKeyFromReq(req: NextRequest): string {
  const lang = (req.headers.get("accept-language") ?? "none").trim();
  return `account:me:${authHashFromRequest(req)}:lang:${lang}`;
}

function extractUser(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const obj = payload as Record<string, any>;
  return obj.data?.data ?? obj.data ?? obj;
}

export async function GET(req: NextRequest) {
  const correlationId = resolveCorrelationId(req);
  const cacheKey = buildCacheKeyFromReq(req);

  const cached = cacheGet<any>(cacheKey);
  if (cached) {
    log("🟨 [BFF account/me] CACHE HIT", { correlationId, cacheKey });

    return NextResponse.json(
      {
        ok: true,
        status: 200,
        data: cached,
        error: null,
      },
      {
        status: 200,
        headers: {
          "x-correlation-id": correlationId,
          "x-audit-log": "cache-hit",
        },
      }
    );
  }

  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/Account/me`,
    method: "GET",
    timeoutMs: 15_000,
    logLabel: "AccountMeGet",
    transformResponse: (payload, context) => {
      if (context.upstreamStatus >= 200 && context.upstreamStatus < 300) {
        const user = extractUser(payload);
        cacheSet(cacheKey, user, 10);

        log("🟦 [BFF account/me] CACHE SET", {
          correlationId: context.correlationId,
          cacheKey,
          ttl: 10,
        });

        const headers = new Headers();
        headers.set("x-correlation-id", context.correlationId);
        headers.set("x-audit-log", "success");

        return {
          body: {
            ok: true,
            status: context.upstreamStatus,
            data: user,
            error: null,
          },
          status: 200,
          headers,
        };
      }

      const safePayload =
        payload && typeof payload === "object"
          ? (payload as Record<string, any>)
          : {};

      const headers = new Headers();
      headers.set("x-correlation-id", context.correlationId);

      return {
        body: {
          ok: false,
          status: context.upstreamStatus,
          data: null,
          error: safePayload.error ?? safePayload.message ?? "UPSTREAM_ERROR",
        },
        status: context.upstreamStatus,
        headers,
      };
    },
  });
}

export async function PATCH(req: NextRequest) {
  const cacheKey = buildCacheKeyFromReq(req);
  const bodyText = await req.text().catch(() => "");

  return proxyJsonWithWebAuth(req, {
    url: `/api/v${API_VERSION}/Account/me`,
    method: "PATCH",
    body: bodyText,
    timeoutMs: 15_000,
    logLabel: "AccountMePatch",
    extraHeaders: {
      "content-type": req.headers.get("content-type") ?? "application/json",
    },
    transformResponse: (payload, context) => {
      if (context.upstreamStatus >= 200 && context.upstreamStatus < 300) {
        cacheSet(cacheKey, null as any, 0);

        log("🧹 [BFF account/me] CACHE INVALIDATE", {
          correlationId: context.correlationId,
          cacheKey,
        });
      }

      const headers = new Headers();
      headers.set("x-correlation-id", context.correlationId);

      return {
        body:
          payload && typeof payload === "object"
            ? payload
            : { ok: false, error: "NO_PAYLOAD" },
        status: context.upstreamStatus,
        headers,
      };
    },
  });
}