"use client";

/**
 * 🌍 LiveManage | Yan Menü Başlık Bileşeni (NavGroup)
 * ---------------------------------------------------
 * Bu bileşen, sol menüdeki grup başlıklarını (örnek: "Uygulamalar", "Sayfalar" vb.)
 * temsil eder. Başlıklar i18n sistemi üzerinden çevrilir.
 *
 * Özellikler:
 * - `subheader`: Çeviri anahtarı (örn. "sidebar:group.apps")
 * - `hideMenu`: Menü daraltılmışsa sadece nokta ikonu gösterilir
 *
 * Gereksinimler:
 * - `useI18nNs(["sidebar"])` ile "sidebar" namespace’inin yüklü olması gerekir.
 */

import React from "react";
import ListSubheader from "@mui/material/ListSubheader";
import { styled, Theme } from "@mui/material/styles";
import { IconDots } from "@tabler/icons-react";
import { useI18nNs } from "@/app/context/i18nContext"; // 🌐 Çeviri sağlayıcısı

// 🔹 Tip tanımları
type NavGroupType = {
  navlabel?: boolean;
  subheader?: string; // Örn. "sidebar:group.apps"
};

interface NavGroupProps {
  item: NavGroupType;
  hideMenu: string | boolean;
}

// 🔹 Stiller (MUI styled API ile)
const ListSubheaderStyle = styled((props: Theme | any) => (
  <ListSubheader disableSticky {...props} />
))(({ theme }) => ({
  ...theme.typography.overline,
  fontWeight: 700,
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(0),
  color: theme.palette.text.primary,
  lineHeight: "26px",
  padding: "3px 12px",
}));

// 🔹 Ana bileşen
const NavGroup: React.FC<NavGroupProps> = ({ item, hideMenu }) => {
  const { t } = useI18nNs(["sidebar"]); // 🌍 "sidebar" namespace çevirileri

  // 🧠 Başlık metni
  const title = item?.subheader ? t(item.subheader) : "";

  return (
    <ListSubheaderStyle
      sx={{
        marginLeft: hideMenu ? 0 : "-10px",
      }}
    >
      {hideMenu ? <IconDots size="14" /> : title}
    </ListSubheaderStyle>
  );
};

export default NavGroup;
