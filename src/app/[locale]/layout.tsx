// src/app/[locale]/layout.tsx
import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { I18nProvider } from "@/app/context/i18nContext";
import MyApp from "@/app/app";
import { CustomizerContextProvider } from "@/app/context/customizerContext";
import MuiProviders from "@/app/providers/MuiProviders";
import MuiAndIntlProvider from "@/app/providers/MuiAndIntl";
import { ReactQueryProvider } from "@/app/providers/ReactQueryProvider";
import { AuthProvider } from "@/app/context/AuthContext";
import { CultureProvider } from "@/app/context/CultureContext";
import {
  normalizeCultures,
  type CultureUiItem,
} from "@/lib/i18n/normalizeCultures";

export const metadata: Metadata = {
  title: "LiveManage",
};

const DEFAULT_NS =
  "common,auth,header,footer,errors,sidebar,dashboard,banner,roles,userRoleManager";

const RTL = new Set(["ar", "fa", "he"]);

const now = () =>
  new Date().toLocaleString("tr-TR", {
    hour12: false,
  });

/* 🔥 LOG KONTROL FLAG */
const DEBUG_LOCALE =
  process.env.NEXT_PUBLIC_DEBUG_LOCALE_LAYOUT === "true";

/* 🔥 LOG HELPER */
const log = (...args: any[]) => {
  if (!DEBUG_LOCALE) return;

};

function normalizeLocale(locale?: string) {
  const value = (locale ?? "tr").trim().toLowerCase();
  return value || "tr";
}

function ensureDict(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    result[key] = typeof value === "string" ? value : String(value ?? "");
  }

  return result;
}

function buildCookieHeader(store: Awaited<ReturnType<typeof cookies>>) {
  const values = store.getAll();
  if (!values.length) return undefined;

  return values.map(({ name, value }) => `${name}=${value}`).join("; ");
}

async function readJsonIfPossible(res: Response): Promise<unknown | null> {
  const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  const text = await res.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = normalizeLocale(locale);

  const h = await headers();
  const c = await cookies();

  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.HTTPS === "true" ? "https" : "http");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;

  const dir = RTL.has(lang) ? "rtl" : "ltr";
  const themeMode = (c.get("theme")?.value ?? "light") as "light" | "dark";
  const colorTheme = c.get("colorTheme")?.value ?? "BLUE_THEME";
  const layout = c.get("layout")?.value ?? "vertical";
  const boxed = c.get("boxed")?.value ?? "boxed";
  const sidebar = c.get("sidebar")?.value ?? "full-sidebar";

  const customizerInitial = {
    activeDir: dir,
    activeMode: themeMode,
    activeTheme: colorTheme,
    activeLayout: layout,
    isLayout: boxed,
    isCollapse: sidebar,
    isLanguage: lang,
  };

  log(`📦 Başlatıldı. locale='${lang}', host='${host}'`);

  let dict: Record<string, string> = {};

  const url = `${baseUrl}/api/i18n/${encodeURIComponent(
    lang
  )}/dict?ns=${encodeURIComponent(DEFAULT_NS)}`;

  try {
    log(`🌐 Fetch → ${url}`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "accept-language": lang,
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });

    const json = await readJsonIfPossible(res) as any;

    if (!res.ok) {
      console.warn(
        `⚠️ [LocaleLayout] Çeviri isteği başarısız. status=${res.status}`
      );
      dict = {};
    } else {
      dict = res.ok && json?.ok ? ensureDict(json?.data) : {};

      log(
        `✅ dict loaded | nsCount=${DEFAULT_NS.split(",").length} | keyCount=${Object.keys(dict).length}`
      );
    }
  } catch (err: any) {
    console.error(
      `❌ [LocaleLayout] Çeviri fetch hatası → ${err?.message ?? err}`
    );
    dict = {};
  }

  log(`🚀 Render | lang='${lang}' | keys=${Object.keys(dict).length}`);

  let initialLanguages: CultureUiItem[] = [];

  try {
    const languageUrl = `${baseUrl}/api/v1.0/localization/languages`;
    const cookieHeader = buildCookieHeader(c);
    const languageRes = await fetch(languageUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        "accept-language": lang,
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
        ...(h.get("x-tenant-key")
          ? { "x-tenant-key": h.get("x-tenant-key")! }
          : {}),
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });

    const languageJson = await readJsonIfPossible(languageRes);
    initialLanguages = languageRes.ok ? normalizeCultures(languageJson) : [];
  } catch (err: any) {
    DEBUG_LOCALE &&
      console.warn(
        `[LocaleLayout] Culture preload hatasi -> ${err?.message ?? err}`
      );
    initialLanguages = [];
  }

  return (
    <I18nProvider lang={lang} dict={dict}>
      <AuthProvider>
        <CultureProvider locale={lang} initialLanguages={initialLanguages}>
          <MuiProviders dir={dir} mode={themeMode}>
            <MuiAndIntlProvider locale={lang}>
              <CustomizerContextProvider initialSettings={customizerInitial}>
                <ReactQueryProvider>
                  <MyApp>{children}</MyApp>
                </ReactQueryProvider>
              </CustomizerContextProvider>
            </MuiAndIntlProvider>
          </MuiProviders>
        </CultureProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
