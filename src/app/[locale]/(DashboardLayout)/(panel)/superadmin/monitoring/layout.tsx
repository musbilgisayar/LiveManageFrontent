// src/app/[locale]/(DashboardLayout)/(panel)/superadmin/monitoring/layout.tsx

import { headers, cookies } from "next/headers";
import { I18nProvider } from "@/app/context/i18nContext";

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
  message?: string;
  userMessage?: string;
  correlationId?: string;
};

const MODULE_NS = ["monitoring", "common", "header"] as const;

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

async function readResponseDebug(response: Response): Promise<{
  contentType: string;
  rawText: string;
  parsedJson: I18nDictResponse | null;
}> {
  const contentType = response.headers.get("content-type") ?? "";
  const rawText = await response.text();

  if (!rawText) {
    return {
      contentType,
      rawText,
      parsedJson: null,
    };
  }

  try {
    return {
      contentType,
      rawText,
      parsedJson: JSON.parse(rawText) as I18nDictResponse,
    };
  } catch {
    return {
      contentType,
      rawText,
      parsedJson: null,
    };
  }
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
    throw new Error("Monitoring modülü için host bilgisi çözümlenemedi.");
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
      ...(h.get("x-tenant-key") ? { "x-tenant-key": h.get("x-tenant-key")! } : {}),
      ...(h.get("x-correlation-id")
        ? { "x-correlation-id": h.get("x-correlation-id")! }
        : {}),
    },
    cache: "no-store",
    next: { revalidate: 0 },
  });

  const debug = await readResponseDebug(response);
  const json = debug.parsedJson;

  if (!response.ok || !json?.ok) {
    console.error("[MonitoringLayout] Çeviri preload isteği başarısız", {
      locale,
      namespaces: MODULE_NS,
      url: url.toString(),
      status: response.status,
      statusText: response.statusText,
      contentType: debug.contentType,
      responseOk: response.ok,
      payloadOk: json?.ok ?? null,
      error: json?.error ?? null,
      detail: json?.detail ?? null,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      correlationId: json?.correlationId ?? null,
      rawText: debug.rawText,
    });

    return {};
  }

  return ensureDict(json.data);
}

export default async function MonitoringLayout({ children, params }: Props) {
  const { locale } = await params;
  const lang = normalizeLocale(locale);

  try {
    const dict = await fetchModuleDict(lang);

    if (Object.keys(dict).length === 0) {
      console.warn(
        "[MonitoringLayout] Çeviri sözlüğü boş geldi, alt ağaç doğrudan render ediliyor.",
        {
          lang,
          namespaces: MODULE_NS,
        }
      );
      return <>{children}</>;
    }

    console.log("[MonitoringLayout] Modül çevirileri başarıyla yüklendi.", {
      lang,
      namespaces: MODULE_NS,
      keyCount: Object.keys(dict).length,
    });

    return (
      <I18nProvider lang={lang} dict={dict}>
        {children}
      </I18nProvider>
    );
  } catch (error) {
    console.error("[MonitoringLayout] Çeviri preload sırasında hata oluştu", {
      lang,
      error: error instanceof Error ? error.message : String(error),
    });

    return <>{children}</>;
  }
}