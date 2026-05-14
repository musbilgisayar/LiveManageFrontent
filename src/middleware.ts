// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const LOCALE_RE = /^[a-z]{2}(?:-[A-Za-z]{2})?$/i;

const toPrefix = (seg: string) =>
  (seg || "tr").split("-")[0].toLowerCase();

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
  "dashboard",
  "muhasebe",
  "my-spaces",
  "pending-actions",
  "property-management",
  "operation-management",
  "listings-management",
  "management-applications",
  "account",
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
  res.cookies.set("x-correlation-id", corrId, {
    path: "/",
    sameSite: "lax",
  });
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

function hasRenewableWebSession(request: NextRequest) {
  const s = getAuthSignals(request);

  return s.hasRefreshToken;
}

export function middleware(request: NextRequest) {
  const corrId = makeCorrId(request);
  const originalPath = request.nextUrl.pathname;

  console.log(
    `[MW][${now()}][${corrId}] middleware start — url=${request.url} path=${originalPath}`
  );

  if (shouldBypass(originalPath)) {
    console.log(
      `[MW][${now()}][${corrId}] bypassed by shouldBypass`
    );

    return NextResponse.next();
  }

  const cleanedFromGroups = stripGroupSegments(originalPath);

  console.log(
    `[MW][${now()}][${corrId}] stripGroupSegments → original='${originalPath}' cleaned='${cleanedFromGroups}'`
  );

  if (cleanedFromGroups !== originalPath) {
    console.log(
      `[MW][${now()}][${corrId}] redirect group-cleaned path '${originalPath}' -> '${cleanedFromGroups}'`
    );

    return redirectWithCommonHeaders(request, cleanedFromGroups, corrId);
  }

  const cleanPath = cleanedFromGroups;
  const parts = cleanPath.split("/").filter(Boolean);
  const first = parts[0] || "";
  const second = parts[1] || "";
  const hasLocale = LOCALE_RE.test(first);

  console.log(
    `[MW][${now()}][${corrId}] path parts=${JSON.stringify(
      parts
    )} hasLocale=${hasLocale}`
  );

  if (hasLocale && LOCALE_RE.test(second)) {
    const normalized =
      toPrefix(second) !== toPrefix(first)
        ? toPrefix(second)
        : toPrefix(first);

    const targetPath =
      `/${normalized}/${parts.slice(2).join("/")}`.replace(/\/+$/, "") ||
      `/${normalized}`;

    console.log(
      `[MW][${now()}][${corrId}] double-locale detected -> ${targetPath}`
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
      `[MW][${now()}][${corrId}] no-locale -> redirect to '${targetPath}'`
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
  const renewableWebSession = hasRenewableWebSession(request);

  console.log(
    `[MW][${now()}][${corrId}] locale='${normalizedLocale}' pathWithoutLocale='${pathWithoutLocale}' authRoute=${isAuthRoute(
      pathWithoutLocale
    )} protected=${isProtectedRoute(
      pathWithoutLocale
    )} renewableWebSession=${renewableWebSession}`
  );

  console.log(
    `[MW][${now()}][${corrId}] auth signals => access=${authSignals.hasAccessToken}, refresh=${authSignals.hasRefreshToken}, sessionMarker=${authSignals.hasSessionMarker}, deviceId=${authSignals.hasDeviceId}`
  );

  const loginUrl = `/${normalizedLocale}/auth/login`;
  const dashboardUrl = `/${normalizedLocale}/dashboard`;

  const res = NextResponse.next();

  res.cookies.set("lm.lang", normalizedLocale, {
    path: "/",
    sameSite: "lax",
  });

  withCommonHeaders(res, corrId);

  if (renewableWebSession && isAuthRoute(pathWithoutLocale)) {
    console.log(
      `[MW][${now()}][${corrId}] authenticated user requested auth route -> redirect to ${dashboardUrl}`
    );

    return redirectWithCommonHeaders(request, dashboardUrl, corrId);
  }

  if (!renewableWebSession && isProtectedRoute(pathWithoutLocale)) {
    console.warn(
      `[MW][${now()}][${corrId}] guest access to protected route '${pathWithoutLocale}' -> redirect to ${loginUrl}`
    );

    return redirectWithCommonHeaders(request, loginUrl, corrId);
  }

  console.log(
    `[MW][${now()}][${corrId}] middleware end — permission guard will be handled in app layer.`
  );

  return res;
}

export const config = {
  matcher: ["/((?!_next|api|_api|images|favicon.ico).*)"],
};
