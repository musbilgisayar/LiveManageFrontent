// src/app/components/container/PageContainer.tsx

/**
 * 📄 Sayfa Kapsayıcı (PageContainer)
 * 
 * Bu bileşen, her sayfada ortak olarak kullanılmak üzere tasarlanmıştır.
 * Amacı: 
 *   - Sayfa başlığını (<title>) dinamik olarak belirlemek,
 *   - Sayfa açıklamasını (<meta name="description">) SEO uyumlu şekilde eklemek,
 *   - Ve içerik bileşenlerini (children) tek bir kapsayıcı içinde sunmaktır.
 * 
 * Bu yapı sayesinde her sayfa düzenli, tutarlı ve SEO açısından optimize edilmiş olur.
 */

import React from "react";

// 🔹 Bileşenin dışarıdan alacağı özellikler (props)
type Props = {
  /** Sayfanın başlığı (tarayıcı sekmesinde görünür) */
  title?: string;

  /** Sayfanın kısa açıklaması (arama motorları için kullanılır) */
  description?: string;

  /** Sayfanın ana içeriği (alt bileşenler veya içerik blokları) */
  children: React.ReactNode;
};

// 🔹 Sayfa Kapsayıcı Bileşeni
const PageContainer = ({ title, description, children }: Props) => (
  <div>
    {/* Tarayıcı sekmesinde görünen başlık */}
    <title>{title}</title>

    {/* SEO için sayfa açıklaması */}
    <meta name="description" content={description} />

    {/* Sayfa içeriği (diğer tüm bileşenler burada yer alır) */}
    {children}
  </div>
);

export default PageContainer;
