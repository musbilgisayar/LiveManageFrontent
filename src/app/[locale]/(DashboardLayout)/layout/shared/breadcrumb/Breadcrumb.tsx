// src/app/[locale]/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb.tsx

'use client'

/**
 * 📍 Breadcrumb (Gezinme Yolu) Bileşeni
 * 
 * Amacı:
 *   - Sayfanın hiyerarşik konumunu kullanıcıya göstermek (örnek: Ana Sayfa / Ayarlar / Profil)
 *   - Her bir adımı tıklanabilir hale getirerek kolay navigasyon sağlamak
 *   - Başlık, alt başlık ve isteğe bağlı dekoratif görsel (breadcrumb görseli) göstermek
 * 
 * Özellikler:
 *   ✅ Duyarlı (responsive) yapı: mobilde sade, masaüstünde geniş görünüm
 *   ✅ i18n destekli başlıklar: çeviri sisteminden gelen başlıklar gösterilebilir
 *   ✅ Çocuk bileşen desteği (children): özel bir görsel veya buton eklenebilir
 */

import React, { ReactNode } from "react";
import {
  Grid,
  Typography,
  Box,
  Breadcrumbs,
  Theme
} from "@mui/material";
import Link from "next/link";
import { IconCircle } from "@tabler/icons-react";
import Image from "next/image";

// 🔹 Breadcrumb öğesi tipi
interface BreadCrumbItem {
  title: string;  // Gösterilecek başlık (örneğin: "Profil", "Ayarlar")
  to?: string;    // Tıklanabilir bağlantı adresi (örneğin: "/account/settings")
}

// 🔹 Ana bileşen tipi
interface BreadCrumbType {
  title: string;          // Sayfa ana başlığı (örneğin: "Hesap Ayarları")
  subtitle?: string;      // Sayfa alt başlığı veya açıklama
  items?: BreadCrumbItem[]; // Gezinme adımları listesi
  children?: ReactNode;   // Ek içerik (örneğin: özel görsel veya buton)
}

// 🔹 Breadcrumb bileşeni
const Breadcrumb = ({ subtitle, items, title, children }: BreadCrumbType) => (
  <Grid
    container
    sx={{
      backgroundColor: "primary.light",
      borderRadius: (theme: Theme) =>
        typeof theme.shape.borderRadius === "number"
          ? theme.shape.borderRadius / 4
          : 4,
      p: "30px 25px 20px",
      marginBottom: "30px",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* 🔸 Sol kısım: Başlık, alt başlık ve gezinme bağlantıları */}
    <Grid
      mb={1}
      size={{
        xs: 12,
        sm: 6,
        lg: 8,
      }}
    >
      {/* Sayfa ana başlığı */}
      <Typography variant="h4">{title}</Typography>

      {/* Sayfa alt başlığı (varsa) */}
      {subtitle && (
        <Typography
          color="textSecondary"
          variant="h6"
          fontWeight={400}
          mt={0.8}
          mb={0}
        >
          {subtitle}
        </Typography>
      )}

      {/* Gezinme yolu (örnek: Ana Sayfa • Hesap • Ayarlar) */}
      {items && (
        <Breadcrumbs
          separator={
            <IconCircle
              size="5"
              fill="textSecondary"
              fillOpacity={"0.6"}
              style={{ margin: "0 5px" }}
            />
          }
          sx={{ alignItems: "center", mt: "10px" }}
          aria-label="breadcrumb"
        >
          {items.map((item) => (
            <div key={item.title}>
              {item.to ? (
                <Link href={item.to} passHref>
                  <Typography color="textSecondary">{item.title}</Typography>
                </Link>
              ) : (
                <Typography color="textPrimary">{item.title}</Typography>
              )}
            </div>
          ))}
        </Breadcrumbs>
      )}
    </Grid>

    {/* 🔸 Sağ kısım: Görsel veya özel içerik */}
    <Grid
      display="flex"
      alignItems="flex-end"
      size={{
        xs: 12,
        sm: 6,
        lg: 4,
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "block", lg: "flex" },
          alignItems: "center",
          justifyContent: "flex-end",
          width: "100%",
        }}
      >
        {children ? (
          // Eğer özel içerik gönderildiyse onu göster
          <Box sx={{ top: "0px", position: "absolute" }}>{children}</Box>
        ) : (
          // Aksi halde varsayılan breadcrumb görselini göster
          <Box sx={{ top: "0px", position: "absolute" }}>
            <Image
              src="/images/breadcrumb/ChatBc.png"
              alt="breadcrumbImg"
              style={{ width: "165px", height: "165px" }}
              priority
              width={165}
              height={165}
            />
          </Box>
        )}
      </Box>
    </Grid>
  </Grid>
);

export default Breadcrumb;
