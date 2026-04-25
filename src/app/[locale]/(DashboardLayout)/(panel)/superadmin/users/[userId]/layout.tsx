import { headers, cookies } from "next/headers";
import { I18nProvider } from "@/app/context/i18nContext";

type Props = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
    userId: string;
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

const ROUTE_NS = ["users", "common", "header"] as const;

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

async function fetchRouteDict(locale: string): Promise<Dict> {
  const h = await headers();
  const c = await cookies();

  const host =
    h.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    h.get("host")?.trim();

  const proto =
    h.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (process.env.HTTPS === "true" ? "https" : "http");

  if (!host) {
    throw new Error("Cannot resolve host for route i18n preload.");
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;
  const url = new URL(`/api/i18n/${encodeURIComponent(locale)}/dict`, baseUrl);
  url.searchParams.set("ns", ROUTE_NS.join(","));

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

  const json = (await response.json().catch(() => null)) as I18nDictResponse | null;

  if (!response.ok || !json?.ok) {
    console.error("[UserDetailRouteLayout] i18n preload failed", {
      locale,
      namespaces: ROUTE_NS,
      status: response.status,
      error: json?.error,
      detail: json?.detail,
    });
    return {};
  }

  return ensureDict(json.data);
}

export default async function UserDetailRouteLayout({ children, params }: Props) {
  const { locale } = await params;
  const lang = normalizeLocale(locale);

  try {
    const dict = await fetchRouteDict(lang);

    if (Object.keys(dict).length === 0) {
      return <>{children}</>;
    }

    return (
      <I18nProvider lang={lang} dict={dict}>
        {children}
      </I18nProvider>
    );
  } catch (error) {
    console.error("[UserDetailRouteLayout] i18n preload exception", {
      lang,
      error: error instanceof Error ? error.message : String(error),
    });

    return <>{children}</>;
  }
}