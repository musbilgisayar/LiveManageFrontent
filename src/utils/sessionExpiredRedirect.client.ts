// src/utils/sessionExpiredRedirect.client.ts

export const SESSION_EXPIRED_CODE = "SESSION_EXPIRED";

type SessionExpiredLike = {
  status?: number;
  ok?: unknown;
  code?: unknown;
  error?: unknown;
  message?: unknown;
  reason?: unknown;
  userMessageKey?: unknown;
  redirectTo?: unknown;
  data?: {
    code?: unknown;
    error?: unknown;
    reason?: unknown;
    messageKey?: unknown;
    redirectTo?: unknown;
  } | null;
};

const LOCALE_RE = /^[a-z]{2}(?:-[A-Za-z]{2})?$/i;

const SESSION_EXPIRED_MESSAGE_KEY = "auth.sessionExpired";

const SESSION_EXPIRED_REASONS = new Set([
  "SESSION_EXPIRED",
  "REFRESH_FAILED",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "INVALID_REFRESH_TOKEN",
  "REFRESH_TOKEN_REUSED",
  "TOKEN_REUSE_DETECTED",
  "BLACKLISTED_REFRESH_TOKEN",
  "REFRESH_JTI_BLACKLISTED",
  "USER_BLACKLISTED",
  "USER_TOKEN_BLACKLISTED",
  "DEVICE_MISMATCH",
]);

const PROTECTED_ROOTS = new Set([
  "admin",
  "manager",
  "employee",
  "member",
  "staff",
  "auditor",
  "superadmin",
  "user",
  "profile",
  "settings",
  "dashboard",
  "muhasebe",
  "my-spaces",
  "pending-actions",
  "property-management",
  "operation-management",
  "listings-management",
  "management-applications",
  "account",
  "users",
  "roles",
  "permissions",
  "monitoring",
  "tenants",
  "role-manager",
  "localization",
]);

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizeLocale(value?: string | null): string {
  const raw = value?.trim();
  if (!raw) return "tr";

  return raw.split("-")[0].toLowerCase();
}

function normalizeToken(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isSessionExpiredToken(value: unknown): boolean {
  const token = normalizeToken(value);

  if (!token) return false;

  return (
    token === SESSION_EXPIRED_CODE ||
    token === "SessionExpired" ||
    token === SESSION_EXPIRED_MESSAGE_KEY ||
    SESSION_EXPIRED_REASONS.has(token.toUpperCase())
  );
}

export function isSessionExpiredPayload(
  payload: unknown,
  status?: number,
): boolean {
  if (status !== 401) return false;

  const body = payload as SessionExpiredLike | null;

  if (!body || typeof body !== "object") return false;

  return (
    isSessionExpiredToken(body.code) ||
    isSessionExpiredToken(body.error) ||
    isSessionExpiredToken(body.message) ||
    isSessionExpiredToken(body.reason) ||
    isSessionExpiredToken(body.userMessageKey) ||
    isSessionExpiredToken(body.data?.code) ||
    isSessionExpiredToken(body.data?.error) ||
    isSessionExpiredToken(body.data?.reason) ||
    isSessionExpiredToken(body.data?.messageKey)
  );
}

export function buildLoginUrlWithReturnUrl(
  locale?: string | null,
  returnUrl?: string | null,
): string {
  const safeLocale = normalizeLocale(locale);
  const loginPath = `/${safeLocale}/login`;
  const safeReturnUrl =
    returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")
      ? returnUrl
      : `/${safeLocale}/dashboard`;

  const encodedReturnUrl = encodeURIComponent(safeReturnUrl).replace(
    /%2F/g,
    "/",
  );

  return `${loginPath}?returnUrl=${encodedReturnUrl}`;
}

export function getCurrentReturnUrl(): string {
  if (!isBrowser()) return "/tr/dashboard";

  const { pathname, search, hash } = window.location;

  return `${pathname}${search}${hash}`;
}

export function isOnLoginRoute(): boolean {
  if (!isBrowser()) return false;

  const parts = window.location.pathname.split("/").filter(Boolean);
  const withoutLocale = LOCALE_RE.test(parts[0] ?? "")
    ? `/${parts.slice(1).join("/")}`
    : window.location.pathname;

  return (
    withoutLocale === "/login" ||
    withoutLocale === "/auth/login" ||
    withoutLocale.startsWith("/auth/")
  );
}

export function isOnProtectedRoute(): boolean {
  if (!isBrowser()) return false;

  const parts = window.location.pathname.split("/").filter(Boolean);
  const pathParts = LOCALE_RE.test(parts[0] ?? "") ? parts.slice(1) : parts;
  const root = pathParts[0];

  return !!root && PROTECTED_ROOTS.has(root);
}

export function redirectToLoginForSessionExpired(): void {
  if (!isBrowser() || isOnLoginRoute() || !isOnProtectedRoute()) return;

  const parts = window.location.pathname.split("/").filter(Boolean);
  const locale = LOCALE_RE.test(parts[0] ?? "") ? parts[0] : "tr";
  const target = buildLoginUrlWithReturnUrl(locale, getCurrentReturnUrl());

  window.location.replace(target);
}