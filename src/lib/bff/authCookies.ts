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
  names: readonly string[]
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

function readString(record: Record<string, unknown> | null, key: string): string | null {
  const value = record?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
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
      readString(data, "accessToken") ??
      readString(innerData, "accessToken") ??
      readString(tokens, "accessToken") ??
      readString(innerTokens, "accessToken") ??
      readString(auth, "accessToken") ??
      readString(innerAuth, "accessToken") ??
      readString(root, "accessToken"),
    refreshToken:
      readString(data, "refreshToken") ??
      readString(innerData, "refreshToken") ??
      readString(tokens, "refreshToken") ??
      readString(innerTokens, "refreshToken") ??
      readString(auth, "refreshToken") ??
      readString(innerAuth, "refreshToken") ??
      readString(root, "refreshToken"),
    accessTokenExpiresAt:
      readString(data, "accessTokenExpiresAt") ??
      readString(innerData, "accessTokenExpiresAt") ??
      readString(tokens, "accessTokenExpiresAt") ??
      readString(innerTokens, "accessTokenExpiresAt") ??
      readString(auth, "accessTokenExpiresAt") ??
      readString(innerAuth, "accessTokenExpiresAt") ??
      readString(root, "accessTokenExpiresAt"),
    refreshTokenExpiresAt:
      readString(data, "refreshTokenExpiresAt") ??
      readString(innerData, "refreshTokenExpiresAt") ??
      readString(tokens, "refreshTokenExpiresAt") ??
      readString(innerTokens, "refreshTokenExpiresAt") ??
      readString(auth, "refreshTokenExpiresAt") ??
      readString(innerAuth, "refreshTokenExpiresAt") ??
      readString(root, "refreshTokenExpiresAt"),
  };
}

export function createHttpOnlyCookie(
  name: string,
  value: string,
  expiresAt?: string | null
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

export function appendExpiredAuthCookies(headers: Headers): number {
  const names = new Set<string>([
    ...ACCESS_TOKEN_COOKIE_NAMES,
    ...REFRESH_TOKEN_COOKIE_NAMES,
  ]);

  for (const name of names) {
    headers.append("set-cookie", createExpiredHttpOnlyCookie(name));
  }

  return names.size;
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
  headers: Headers
): number {
  const tokens = extractAuthTokenPayload(payload);
  let count = 0;

  if (tokens.accessToken) {
    headers.append(
      "set-cookie",
      createHttpOnlyCookie(
        ACCESS_TOKEN_COOKIE_NAMES[0],
        tokens.accessToken,
        null
      )
    );
    count += 1;
  }

  if (tokens.refreshToken) {
    headers.append(
      "set-cookie",
      createHttpOnlyCookie(
        REFRESH_TOKEN_COOKIE_NAMES[0],
        tokens.refreshToken,
        tokens.refreshTokenExpiresAt
      )
    );
    count += 1;
  }

  return count;
}
