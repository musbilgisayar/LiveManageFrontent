// src/app/[locale]/(DashboardLayout)/(panel)/management-applications/layout.tsx

import { headers, cookies } from "next/headers";
import { I18nProvider } from "@/app/context/i18nContext";
import PermissionGuard from "@/modules/auth/components/PermissionGuard";

type Props = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

type Dict = Record<string, string>;

type I18nDictResponse = {
  ok?: boolean;
  data?: Dict;
  error?: string;
};

const MODULE_NS = ["management-applications", "common"] as const;

const DEBUG =
  process.env.NEXT_PUBLIC_DEBUG_MANAGEMENT_APPLICATIONS_PRELOAD === "true" ||
  process.env.DEBUG_MANAGEMENT_APPLICATIONS_PRELOAD === "true";

const REQUIRED_PERMISSIONS = [
  "property.applications.create.self",
  "property.applications.view_own.self",
  "admin.property.applications.view_pending.tenant",
];

function normalizeLocale(locale?: string): string {
  return (locale ?? "tr").trim().toLowerCase() || "tr";
}

function ensureDict(input: unknown): Dict {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const result: Dict = {};

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    result[key] = typeof value === "string" ? value : String(value ?? "");
  }

  return result;
}

function buildCookieHeader(
  store: Awaited<ReturnType<typeof cookies>>
): string | undefined {
  const all = store.getAll();
  if (!all.length) return undefined;

  return all.map(({ name, value }) => `${name}=${value}`).join("; ");
}

async function fetchModuleDict(locale: string): Promise<Dict> {
  const h = await headers();
  const c = await cookies();

  const host =
    h.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    h.get("host")?.trim();

  const proto =
    h.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (process.env.HTTPS === "true" ? "https" : "http");

  if (!host) {
    throw new Error("Host could not be resolved.");
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;
  const cookieHeader = buildCookieHeader(c);
  const url = new URL(`/api/i18n/${encodeURIComponent(locale)}/dict`, baseUrl);
  url.searchParams.set("ns", MODULE_NS.join(","));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
      "accept-language": locale,
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(h.get("x-tenant-key")
        ? { "x-tenant-key": h.get("x-tenant-key")! }
        : {}),
      ...(h.get("x-correlation-id")
        ? { "x-correlation-id": h.get("x-correlation-id")! }
        : {}),
    },
    cache: "no-store",
  });

  const json = (await response.json().catch(
    () => null
  )) as I18nDictResponse | null;
  const dict = ensureDict(json?.data);

  DEBUG &&
    console.log("[i18n][management-applications] preload response", {
      status: response.status,
      ok: response.ok,
      bodyOk: json?.ok,
      error: json?.error,
      keyCount: Object.keys(dict).length,
      hasManagementApplicationsKeys: Object.keys(dict).some(
        (key) =>
          key.startsWith("management-applications:") ||
          key.startsWith("management-applications.")
      ),
    });

  return dict;
}

export default async function ManagementApplicationsLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;
  const lang = normalizeLocale(locale);

  try {
    const dict = await fetchModuleDict(lang);

    return (
      <PermissionGuard requiredAnyPermissions={REQUIRED_PERMISSIONS}>
        <I18nProvider lang={lang} dict={dict}>
          {children}
        </I18nProvider>
      </PermissionGuard>
    );
  } catch (error) {
    DEBUG &&
      console.warn("[i18n] preload error", {
        lang,
        error: error instanceof Error ? error.message : String(error),
      });

    return (
      <PermissionGuard requiredAnyPermissions={REQUIRED_PERMISSIONS}>
        <I18nProvider lang={lang} dict={{}}>
          {children}
        </I18nProvider>
      </PermissionGuard>
    );
  }
}
