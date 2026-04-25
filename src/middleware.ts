// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const LOCALE_RE = /^[a-z]{2}(?:-[A-Za-z]{2})?$/i;
const toPrefix = (seg: string) => seg.split("-")[0].toLowerCase();

const AUTH_ROUTES = [
  "/auth",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const PROTECTED_ROOTS = [
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
];

const shouldBypass = (pathname: string) =>
  pathname.startsWith("/api") ||
  pathname.startsWith("/_api") ||
  pathname.startsWith("/_next") ||
  pathname.startsWith("/images") ||
  pathname.startsWith("/favicon.ico");

function stripGroupSegments(pathname: string): string {
  return pathname.replace(/\(\w+\)\//g, "");
}

function now() {
  return new Date().toISOString();
}

function makeCorrId(req: NextRequest) {
  return (
    req.headers.get("x-correlation-id") ||
    req.cookies.get("x-correlation-id")?.value ||
    `cid-${Math.random().toString(36).slice(2, 9)}`
  );
}

function withCommonHeaders(res: NextResponse, corrId: string) {
  res.headers.set("x-correlation-id", corrId);
  res.cookies.set("x-correlation-id", corrId, { path: "/" });
  return res;
}

function redirectWithCommonHeaders(
  request: NextRequest,
  pathname: string,
  corrId: string
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const res = NextResponse.redirect(url);
  return withCommonHeaders(res, corrId);
}

function getPathWithoutLocale(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);

  if (!parts.length) return "/";

  if (LOCALE_RE.test(parts[0])) {
    const rest = parts.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }

  return pathname;
}

function isAuthRoute(pathWithoutLocale: string) {
  return (
    pathWithoutLocale === "/auth" ||
    pathWithoutLocale.startsWith("/auth/") ||
    AUTH_ROUTES.includes(pathWithoutLocale)
  );
}

function isProtectedRoute(pathWithoutLocale: string) {
  if (pathWithoutLocale === "/") return false;

  return PROTECTED_ROOTS.some(
    (root) =>
      pathWithoutLocale === `/${root}` ||
      pathWithoutLocale.startsWith(`/${root}/`)
  );
}

function getAuthSignals(request: NextRequest) {
  const accessToken =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("lm.at")?.value ||
    "";

  const refreshToken =
    request.cookies.get("refreshToken")?.value ||
    request.cookies.get("RefreshToken")?.value ||
    request.cookies.get("lm.rt")?.value ||
    "";

  const sessionMarker =
    request.cookies.get("lm.sid")?.value ||
    request.cookies.get("logged_in")?.value ||
    "";

  const deviceId = request.cookies.get("lm.did")?.value || "";

  return {
    accessToken,
    refreshToken,
    sessionMarker,
    deviceId,
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    hasSessionMarker: !!sessionMarker,
    hasDeviceId: !!deviceId,
  };
}

function isAuthenticatedLike(request: NextRequest) {
  const s = getAuthSignals(request);
  return s.hasAccessToken || (s.hasSessionMarker && s.hasDeviceId);
}

function tryDecodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );

    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function extractRoleFromToken(token: string): string {
  const decoded = tryDecodeJwtPayload(token);
  if (!decoded) return "user";

  const roleClaim =
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ||
    decoded["role"] ||
    decoded["roles"]?.[0] ||
    "User";

  return String(roleClaim).toLowerCase();
}

function getDashboardPathByRole(locale: string, role?: string | null) {
  const lower = String(role || "").toLowerCase();

  switch (lower) {
    case "superadmin":
      return `/${locale}/superadmin/dashboard`;
    case "admin":
      return `/${locale}/admin/dashboard`;
    case "manager":
      return `/${locale}/manager/dashboard`;
    case "staff":
      return `/${locale}/staff/dashboard`;
    case "employee":
      return `/${locale}/employee/dashboard`;
    case "auditor":
      return `/${locale}/auditor/dashboard`;
    case "member":
      return `/${locale}/member/dashboard`;
    case "user":
      return `/${locale}/user/dashboard`;
    default:
      return `/${locale}/dashboard`;
  }
}

function isRoleAuthorized(pathWithoutLocale: string, role: string) {
  const guard = (segment: string, allowed: string[]) =>
    !(
      (pathWithoutLocale === `/${segment}` ||
        pathWithoutLocale.startsWith(`/${segment}/`)) &&
      !allowed.includes(role)
    );

  return (
    guard("admin", ["admin", "superadmin"]) &&
    guard("manager", ["manager", "admin", "superadmin"]) &&
    guard("staff", ["staff", "admin", "superadmin"]) &&
    guard("employee", ["employee", "admin", "superadmin"]) &&
    guard("auditor", ["auditor", "admin", "superadmin"]) &&
    guard("member", ["member", "admin", "superadmin"]) &&
    guard("superadmin", ["superadmin"]) &&
    guard("user", ["user"]) &&
    guard("profile", [
      "user",
      "member",
      "employee",
      "staff",
      "manager",
      "auditor",
      "admin",
      "superadmin",
    ]) &&
    guard("settings", [
      "user",
      "member",
      "employee",
      "staff",
      "manager",
      "auditor",
      "admin",
      "superadmin",
    ])
  );
}

export function middleware(request: NextRequest) {
  const corrId = makeCorrId(request);
  const originalPath = request.nextUrl.pathname;

  console.log(
    `[MW][${now()}][${corrId}] middleware start — url=${request.url} path=${originalPath}`
  );

  if (shouldBypass(originalPath)) {
    console.log(
      `[MW][${now()}][${corrId}] bypassed by shouldBypass (static/api/_next)`
    );
    return NextResponse.next();
  }

  const cleanedFromGroups = stripGroupSegments(originalPath);
  console.log(
    `[MW][${now()}][${corrId}] stripGroupSegments → original='${originalPath}' cleaned='${cleanedFromGroups}'`
  );

  if (cleanedFromGroups !== originalPath) {
    console.log(
      `[MW][${now()}][${corrId}] will REDIRECT from '${originalPath}' -> '${cleanedFromGroups}' for debugging.`
    );

    return redirectWithCommonHeaders(request, cleanedFromGroups, corrId);
  }

  const cleanPath = cleanedFromGroups;
  const parts = cleanPath.split("/").filter(Boolean);
  const first = parts[0] || "";
  const second = parts[1] || "";
  const hasLocale = LOCALE_RE.test(first);

  console.log(
    `[MW][${now()}][${corrId}] path parts: ${JSON.stringify(parts)} hasLocale=${hasLocale}`
  );

  if (hasLocale && LOCALE_RE.test(second)) {
    const normalized =
      toPrefix(second) !== toPrefix(first) ? toPrefix(second) : toPrefix(first);

    const targetPath = `/${normalized}/${parts.slice(2).join("/")}`.replace(
      /\/+$/,
      ""
    ) || `/${normalized}`;

    console.log(
      `[MW][${now()}][${corrId}] double-locale detected -> redirect to ${targetPath}`
    );

    return redirectWithCommonHeaders(request, targetPath, corrId);
  }

  if (!hasLocale) {
    const cookieLocale = request.cookies.get("lm.lang")?.value;
    const headerLangRaw =
      request.headers.get("accept-language")?.split(",")[0] || "tr-TR";
    const chosen = cookieLocale || headerLangRaw;
    const prefix = toPrefix(chosen) || "tr";

    const targetPath = `/${prefix}${
      cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`
    }`;

    console.log(
      `[MW][${now()}][${corrId}] no-locale -> redirect to '${targetPath}' (cookie='${cookieLocale}', accept-language='${headerLangRaw}')`
    );

    const res = redirectWithCommonHeaders(request, targetPath, corrId);
    res.cookies.set("lm.lang", prefix, {
      path: "/",
      sameSite: "lax",
    });
    return res;
  }

  const normalizedLocale = toPrefix(first);
  const pathWithoutLocale = getPathWithoutLocale(cleanPath);
  const authSignals = getAuthSignals(request);
  const authenticatedLike = isAuthenticatedLike(request);

  console.log(
    `[MW][${now()}][${corrId}] locale normalized -> ${normalizedLocale}`
  );

  console.log(
    `[MW][${now()}][${corrId}] pathWithoutLocale='${pathWithoutLocale}', isAuthRoute=${isAuthRoute(
      pathWithoutLocale
    )}, isProtectedRoute=${isProtectedRoute(
      pathWithoutLocale
    )}, authenticatedLike=${authenticatedLike}`
  );

  console.log(
    `[MW][${now()}][${corrId}] auth signals => access=${authSignals.hasAccessToken}, refresh=${authSignals.hasRefreshToken}, sessionMarker=${authSignals.hasSessionMarker}, deviceId=${authSignals.hasDeviceId}`
  );

  const loginUrl = `/${normalizedLocale}/auth/login`;
  const unauthorizedUrl = `/${normalizedLocale}/unauthorized`;

  const res = NextResponse.next();
  res.cookies.set("lm.lang", normalizedLocale, {
    path: "/",
    sameSite: "lax",
  });
  withCommonHeaders(res, corrId);

  let authRouteRedirectTarget = `/${normalizedLocale}/dashboard`;
  let resolvedRole: string | null = null;

  if (authSignals.hasAccessToken) {
    resolvedRole = extractRoleFromToken(authSignals.accessToken);
    authRouteRedirectTarget = getDashboardPathByRole(
      normalizedLocale,
      resolvedRole
    );

    console.log(
      `[MW][${now()}][${corrId}] auth-route redirect role resolved -> role='${resolvedRole}', target='${authRouteRedirectTarget}'`
    );
  } else {
    console.log(
      `[MW][${now()}][${corrId}] auth-route redirect skipped role resolution because access token is missing`
    );
  }

  // 1) Auth sayfalarına sadece access token ile gerçekten login olanları sokma.
  // session marker + device id tek başına redirect için yeterli değil.
  if (authSignals.hasAccessToken && isAuthRoute(pathWithoutLocale)) {
    console.log(
      `[MW][${now()}][${corrId}] access-token authenticated user requested auth route '${pathWithoutLocale}' -> redirect to ${authRouteRedirectTarget}`
    );
    return redirectWithCommonHeaders(request, authRouteRedirectTarget, corrId);
  }

  // 2) Guest protected sayfaya giremesin
  if (!authenticatedLike && isProtectedRoute(pathWithoutLocale)) {
    console.warn(
      `[MW][${now()}][${corrId}] unauthenticated access to protected route '${pathWithoutLocale}' -> redirect to ${loginUrl}`
    );
    return redirectWithCommonHeaders(request, loginUrl, corrId);
  }

  // 3) Access token varsa rol bazlı guard uygula
  if (authSignals.hasAccessToken && isProtectedRoute(pathWithoutLocale)) {
    const role = resolvedRole ?? extractRoleFromToken(authSignals.accessToken);

    console.log(`[MW][${now()}][${corrId}] token decoded role='${role}'`);

    const passed = isRoleAuthorized(pathWithoutLocale, role);

    if (!passed) {
      console.warn(
        `[MW][${now()}][${corrId}] authorization guard failed for role='${role}' path='${pathWithoutLocale}' -> redirect to ${unauthorizedUrl}`
      );
      return redirectWithCommonHeaders(request, unauthorizedUrl, corrId);
    }

    console.log(
      `[MW][${now()}][${corrId}] authorization passed for role='${role}'`
    );
  }

  console.log(`[MW][${now()}][${corrId}] middleware end — allowing request.`);
  return res;
}

export const config = {
  matcher: ["/((?!_next|api|_api|images|favicon.ico).*)"],
};