//src/lib/bff/authCookies.ts
export const ACCESS_TOKEN_COOKIE_NAMES = [
  process.env.BFF_ACCESS_TOKEN_COOKIE_NAME || "accessToken",
  "accessToken",
  "access_token",
  "lm_at",
  "lm.at",
] as const;

export const REFRESH_TOKEN_COOKIE_NAMES = [
  process.env.BFF_REFRESH_TOKEN_COOKIE_NAME || "RefreshToken",
  "RefreshToken",
  "refreshToken",
  "refresh_token",
  "lm.rt",
] as const;

export const SESSION_MARKER_COOKIE_NAMES = [
  process.env.BFF_SESSION_MARKER_COOKIE_NAME || "lm.sid",
  "lm.sid",
  "logged_in",
] as const;

export const AUTH_STATE_COOKIE_NAMES = [
  process.env.BFF_AUTH_STATE_COOKIE_NAME || "lm.auth",
  "lm.auth",
  "auth_state",
] as const;

export const DEVICE_ID_COOKIE_NAMES = ["lm.did"] as const;

export type AuthTokenPayload = {
  accessToken?: string | null;
  refreshToken?: string | null;
  accessTokenExpiresAt?: string | null;
  refreshTokenExpiresAt?: string | null;
};

type CookieRequestLike = {
  cookies: {
    get(name: string): { value?: string } | undefined;
  };
};

export function readFirstCookieValue(
  req: CookieRequestLike,
  names: readonly string[],
): string | null {
  for (const name of names) {
    const value = req.cookies.get(name)?.value?.trim();
    if (value) return value;
  }

  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function readString(
  record: Record<string, unknown> | null,
  key: string,
): string | null {
  const value = record?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readFirstString(
  record: Record<string, unknown> | null,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = readString(record, key);
    if (value) return value;
  }

  return null;
}

export function extractAuthTokenPayload(payload: unknown): AuthTokenPayload {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const innerData = asRecord(data?.data);
  const tokens = asRecord(data?.tokens) ?? asRecord(root?.tokens);
  const innerTokens = asRecord(innerData?.tokens);
  const auth = asRecord(data?.auth) ?? asRecord(root?.auth);
  const innerAuth = asRecord(innerData?.auth);

  return {
    accessToken:
      readFirstString(data, ["accessToken", "AccessToken"]) ??
      readFirstString(innerData, ["accessToken", "AccessToken"]) ??
      readFirstString(tokens, ["accessToken", "AccessToken"]) ??
      readFirstString(innerTokens, ["accessToken", "AccessToken"]) ??
      readFirstString(auth, ["accessToken", "AccessToken"]) ??
      readFirstString(innerAuth, ["accessToken", "AccessToken"]) ??
      readFirstString(root, ["accessToken", "AccessToken"]),

    refreshToken:
      readFirstString(data, ["refreshToken", "RefreshToken"]) ??
      readFirstString(innerData, ["refreshToken", "RefreshToken"]) ??
      readFirstString(tokens, ["refreshToken", "RefreshToken"]) ??
      readFirstString(innerTokens, ["refreshToken", "RefreshToken"]) ??
      readFirstString(auth, ["refreshToken", "RefreshToken"]) ??
      readFirstString(innerAuth, ["refreshToken", "RefreshToken"]) ??
      readFirstString(root, ["refreshToken", "RefreshToken"]),

    accessTokenExpiresAt:
      readFirstString(data, ["accessTokenExpiresAt", "AccessTokenExpiresAt"]) ??
      readFirstString(innerData, ["accessTokenExpiresAt", "AccessTokenExpiresAt"]) ??
      readFirstString(tokens, ["accessTokenExpiresAt", "AccessTokenExpiresAt"]) ??
      readFirstString(innerTokens, ["accessTokenExpiresAt", "AccessTokenExpiresAt"]) ??
      readFirstString(auth, ["accessTokenExpiresAt", "AccessTokenExpiresAt"]) ??
      readFirstString(innerAuth, ["accessTokenExpiresAt", "AccessTokenExpiresAt"]) ??
      readFirstString(root, ["accessTokenExpiresAt", "AccessTokenExpiresAt"]),

    refreshTokenExpiresAt:
      readFirstString(data, ["refreshTokenExpiresAt", "RefreshTokenExpiresAt"]) ??
      readFirstString(innerData, ["refreshTokenExpiresAt", "RefreshTokenExpiresAt"]) ??
      readFirstString(tokens, ["refreshTokenExpiresAt", "RefreshTokenExpiresAt"]) ??
      readFirstString(innerTokens, ["refreshTokenExpiresAt", "RefreshTokenExpiresAt"]) ??
      readFirstString(auth, ["refreshTokenExpiresAt", "RefreshTokenExpiresAt"]) ??
      readFirstString(innerAuth, ["refreshTokenExpiresAt", "RefreshTokenExpiresAt"]) ??
      readFirstString(root, ["refreshTokenExpiresAt", "RefreshTokenExpiresAt"]),
  };
}

export function createHttpOnlyCookie(
  name: string,
  value: string,
  expiresAt?: string | null,
): string {
  const parts = [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    process.env.NODE_ENV === "production" ? "Secure" : "",
    "SameSite=Lax",
  ].filter(Boolean);

  if (expiresAt) {
    const expires = new Date(expiresAt);

    if (!Number.isNaN(expires.getTime())) {
      parts.push(`Expires=${expires.toUTCString()}`);
    }
  }

  return parts.join("; ");
}

export function createExpiredHttpOnlyCookie(name: string): string {
  return [
    `${name}=`,
    "Path=/",
    "HttpOnly",
    process.env.NODE_ENV === "production" ? "Secure" : "",
    "SameSite=Lax",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "Max-Age=0",
  ]
    .filter(Boolean)
    .join("; ");
}

function uniqueCookieNames(names: readonly string[]): string[] {
  return Array.from(new Set(names.filter(Boolean)));
}

function appendExpiredCookies(
  headers: Headers,
  names: readonly string[],
): number {
  const uniqueNames = uniqueCookieNames(names);

  for (const name of uniqueNames) {
    headers.append("set-cookie", createExpiredHttpOnlyCookie(name));
  }

  return uniqueNames.length;
}

export function appendExpiredAuthCookies(headers: Headers): number {
  return appendExpiredCookies(headers, [
    ...ACCESS_TOKEN_COOKIE_NAMES,
    ...REFRESH_TOKEN_COOKIE_NAMES,
    ...SESSION_MARKER_COOKIE_NAMES,
    ...AUTH_STATE_COOKIE_NAMES,
  ]);
}

export function appendExpiredLegacyAuthCookies(headers: Headers): number {
  const canonicalNames = new Set<string>([
    ACCESS_TOKEN_COOKIE_NAMES[0],
    REFRESH_TOKEN_COOKIE_NAMES[0],
    SESSION_MARKER_COOKIE_NAMES[0],
    AUTH_STATE_COOKIE_NAMES[0],
  ]);

  const legacyNames = [
    ...ACCESS_TOKEN_COOKIE_NAMES,
    ...REFRESH_TOKEN_COOKIE_NAMES,
    ...SESSION_MARKER_COOKIE_NAMES,
    ...AUTH_STATE_COOKIE_NAMES,
  ].filter((name) => !canonicalNames.has(name));

  return appendExpiredCookies(headers, legacyNames);
}

export function normalizeSetCookieForBrowser(cookie: string): string {
  let normalized = cookie.replace(/;\s*Domain=[^;]+/i, "");

  if (process.env.NODE_ENV === "development") {
    normalized = normalized.replace(/;\s*Secure/gi, "");
  }

  return normalized;
}

export function appendAuthCookiesFromPayload(
  payload: unknown,
  headers: Headers,
): number {
  const tokens = extractAuthTokenPayload(payload);
  let count = 0;

  if (tokens.accessToken) {
    headers.append(
      "set-cookie",
      createHttpOnlyCookie(
        ACCESS_TOKEN_COOKIE_NAMES[0],
        tokens.accessToken,
        tokens.accessTokenExpiresAt,
      ),
    );

    count += 1;
  }

  if (tokens.refreshToken) {
    headers.append(
      "set-cookie",
      createHttpOnlyCookie(
        REFRESH_TOKEN_COOKIE_NAMES[0],
        tokens.refreshToken,
        tokens.refreshTokenExpiresAt,
      ),
    );

    count += 1;
  }

  if (count > 0) {
    count += appendExpiredLegacyAuthCookies(headers);
  }

  return count;
}