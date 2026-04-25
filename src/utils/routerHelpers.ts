"use client";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * 🧭 safePush — Next.js grup klasörlerini (/ (DashboardLayout), /(panel) vs.) gizleyerek yönlendirme yapar.
 *
 * - Middleware mantığıyla aynı regex kullanılır.
 * - Çift slash'ları düzeltir, gereksiz trailing slash'ı kaldırır.
 * - Tüm router.push çağrılarında güvenli yönlendirme sağlar.
 */
export function safePush(router: AppRouterInstance, href: string) {
  if (!href) return;

  const cleaned = href
    .replaceAll(/\(\w+\)\//g, "") // (DashboardLayout)/ veya (panel)/ gibi segmentleri sil
    .replaceAll(/\(\w+\)/g, "")   // parantezli klasörleri sil
    .replaceAll(/\/{2,}/g, "/")   // çift slashları düzelt
    .replace(/\/$/, "");          // sonundaki gereksiz "/" sil

  router.push(cleaned);
}
