// src/lib/bff/userScopedCache.ts

import "server-only";
import crypto from "node:crypto";

type RequestLike = {
  headers: Headers;
  cookies?: {
    get(name: string): { value: string } | undefined;
  };
};

export type UserScopedCacheKeyOptions = {
  namespace: string;
  req: RequestLike;
  languageSegment?: string | null;
  includeCookieHeader?: boolean;
};

export function normalizeLanguageSegment(value?: string | null): string {
  const raw = value?.trim();
  if (!raw) {
    return "none";
  }

  return raw.split(",")[0]?.trim().toLowerCase() || "none";
}

export function pickAuthMaterial(
  req: RequestLike,
  options?: {
    includeCookieHeader?: boolean;
  }
): string {
  const authorization =
    req.headers.get("authorization") ?? req.headers.get("Authorization");

  if (authorization?.trim()) {
    return authorization.trim();
  }

  const cookieAccessToken =
    req.cookies?.get("accessToken")?.value ??
    req.cookies?.get("access_token")?.value ??
    req.cookies?.get("lm_at")?.value;

  if (cookieAccessToken?.trim()) {
    return cookieAccessToken.trim();
  }

  if (options?.includeCookieHeader) {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader?.trim()) {
      return cookieHeader.trim();
    }
  }

  return "";
}

export function buildAuthHash(material?: string | null): string {
  const key = material?.trim();
  if (!key) {
    return "noauth";
  }

  return crypto.createHash("sha1").update(key).digest("hex").slice(0, 12);
}

export function buildUserScopedCacheKey(
  options: UserScopedCacheKeyOptions
): string {
  const authMaterial = pickAuthMaterial(options.req, {
    includeCookieHeader: options.includeCookieHeader ?? true,
  });

  const lang = normalizeLanguageSegment(
    options.languageSegment ?? options.req.headers.get("accept-language")
  );

  return `${options.namespace}:${buildAuthHash(authMaterial)}:lang:${lang}`;
}