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
  lang?: string;
  ns?: string[];
  data?: Dict;
  error?: string;
  detail?: string;
};

const MODULE_NS = ["management-applications", "common", "detailPage"] as const;
const DEBUG_MANAGEMENT_APPLICATIONS_PRELOAD =
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
    throw new Error(
      "Management Applications modülü için host bilgisi çözümlenemedi."
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;
  const url = new URL(`/api/i18n/${encodeURIComponent(locale)}/dict`, baseUrl);

  url.searchParams.set("ns", MODULE_NS.join(","));

  const cookieHeader = buildCookieHeader(c);

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
    next: { revalidate: 0 },
  });

  const json = (await response.json().catch(
    () => null
  )) as I18nDictResponse | null;
  const dict = ensureDict(json?.data);

  if (!response.ok || (!json?.ok && Object.keys(dict).length === 0)) {
    DEBUG_MANAGEMENT_APPLICATIONS_PRELOAD && console.warn(
      "[ManagementApplicationsLayout] Çeviri preload isteği başarısız",
      {
        locale,
        namespaces: MODULE_NS,
        status: response.status,
        error: json?.error,
        detail: json?.detail,
      }
    );

    return {};
  }

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

    const content =
      Object.keys(dict).length === 0 ? (
        <>{children}</>
      ) : (
        <I18nProvider lang={lang} dict={dict}>
          {children}
        </I18nProvider>
      );

    return (
      <PermissionGuard requiredAnyPermissions={REQUIRED_PERMISSIONS}>
        {content}
      </PermissionGuard>
    );
  } catch (error) {
    DEBUG_MANAGEMENT_APPLICATIONS_PRELOAD && console.warn(
      "[ManagementApplicationsLayout] Çeviri preload sırasında hata oluştu",
      {
        lang,
        error: error instanceof Error ? error.message : String(error),
      }
    );

    return (
      <PermissionGuard requiredAnyPermissions={REQUIRED_PERMISSIONS}>
        {children}
      </PermissionGuard>
    );
  }
}
