"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import * as React from "react";

type Props = {
  href: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href">;

const LOCALE_PREFIX_RE = /^\/([a-z]{2}(?:-[A-Za-z]{2})?)(?=\/|$)/i;
const isAbsolute = (href: string) =>
  /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(href) ||
  href.startsWith("mailto:") ||
  href.startsWith("tel:");
const isApiPath = (href: string) => href.startsWith("/api");
const toPrefix = (seg: string) => seg.split("-")[0].toLowerCase();

/**
 * 🌐 LocaleLink — Çok dilli sistemde dil bazlı yönlendirme.
 * ✅ Grup klasörlerini (ör. /(DashboardLayout), /(panel)) de otomatik olarak gizler.
 */
export default function LocaleLink({ href, children, ...props }: Props) {
  const params = useParams() as { locale?: string };
  const activePrefix = toPrefix(params?.locale || "tr");

  if (isAbsolute(href) || isApiPath(href)) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  const match = href.match(/^[^?#]*/);
  const pathOnly = (match ? match[0] : href) || "/";
  const tail = href.slice(pathOnly.length); // ?query & #hash

  let finalPath = pathOnly;

  if (LOCALE_PREFIX_RE.test(pathOnly)) {
    finalPath = pathOnly.replace(LOCALE_PREFIX_RE, `/${activePrefix}`);
  } else {
    finalPath = `/${activePrefix}${pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`}`;
  }

  // 🧼 Grup klasörlerini gizle (ör. /(DashboardLayout)/(panel)/ → /)
  const cleanedHref = `${finalPath}${tail}`
    .replaceAll(/\(\w+\)\//g, "") // (panel)/ gibi segmentleri kaldır
    .replaceAll(/\(\w+\)/g, "")   // (DashboardLayout) gibi segmentleri kaldır
    .replaceAll(/\/{2,}/g, "/")   // çift slashları düzelt
    .replace(/\/$/, "");          // trailing slash kaldır

  return (
    <Link href={cleanedHref} {...props}>
      {children}
    </Link>
  );
}

/**
 * ✅ localeHref — React bileşeni dışında (ör. router.push veya window.location.href) kullanılmak için.
 * proxy, middleware ve çok dilli sistemle tam uyumlu.
 */
export function localeHref(rawHref: string, locale?: string): string {
  const activePrefix = locale ? locale.split("-")[0].toLowerCase() : "tr";

  // API veya dış bağlantıları dokunmadan döndür
  if (rawHref.startsWith("/api") || rawHref.startsWith("http")) return rawHref;

  // Zaten locale içeriyorsa değiştirme
  if (rawHref.startsWith(`/${activePrefix}/`)) return rawHref;

  const finalHref = `/${activePrefix}${rawHref.startsWith("/") ? rawHref : `/${rawHref}`}`;

  // 🧼 Grup klasörlerini gizle
  const cleanedHref = finalHref
    .replaceAll(/\(\w+\)\//g, "")
    .replaceAll(/\(\w+\)/g, "")
    .replaceAll(/\/{2,}/g, "/")
    .replace(/\/$/, "");

  if (process.env.NODE_ENV === "development") {
    console.debug(
      `🌍 [localeHref] input='${rawHref}', locale='${locale}' → cleaned='${cleanedHref}'`
    );
  }

  return cleanedHref;
}
