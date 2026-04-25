"use client";

/**
 * 📄 FILE: src/app/[locale]/(DashboardLayout)/layout/vertical/sidebar/NavItem/index.tsx
 * 🧭 PURPOSE:
 *   - Sidebar’daki her menü öğesini render eder (tek linkli item).
 *   - Senin özel i18n sistemini (`useI18nNs(["sidebar"])`) kullanarak
 *     backend → BFF → frontend çeviri zincirine tamamen uyum sağlar.
 *   - `sidebar:menu.*` veya `sidebar:group.*` gibi key’leri dinamik olarak çevirir.
 *   - Tasarım: MUI ListItemButton, responsive hover renkleri, chip (badge) desteği.
 */

import React, { useContext } from "react";
import Link from "next/link";
import {
  Chip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { CustomizerContext } from "@/app/context/customizerContext";
import { useI18nNs } from "@/app/context/i18nContext"; 
import { ItemType } from "@/app/[locale]/(DashboardLayout)/types/layout/sidebar";

export default function NavItem({
  item,
  level,
  pathDirect,
  hideMenu,
  onClick,
}: ItemType) {
  const theme = useTheme();
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));

  // ✅ Senin özel çeviri sistemin
  const { t } = useI18nNs(["sidebar"]);

  // 🎨 Tema / kenar yuvarlama
  const customizer = useContext(CustomizerContext);
  const isBorderRadius = customizer?.isBorderRadius ?? 8;

  // 🧩 Icon render
  const Icon = item?.icon;
  const itemIcon = Icon ? (
    (level ?? 1) > 1 ? (
      <Icon stroke={1.5} size="1rem" />
    ) : (
      <Icon stroke={1.5} size="1.3rem" />
    )
  ) : null;

  // 💅 Dinamik MUI stil
  const ListItemStyled = styled(ListItemButton)(() => ({
    whiteSpace: "nowrap",
    marginBottom: "2px",
    padding: "8px 10px",
    borderRadius: `${isBorderRadius}px`,
    backgroundColor: (level ?? 1) > 1 ? "transparent !important" : "inherit",
    color:
      (level ?? 1) > 1 && pathDirect === item?.href
        ? `${theme.palette.primary.main}!important`
        : theme.palette.text.secondary,
    paddingLeft: hideMenu
      ? "10px"
      : (level ?? 2) > 2
      ? `${(level ?? 1) * 15}px`
      : "10px",
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
    },
    "&.Mui-selected": {
      color: "white",
      backgroundColor: theme.palette.primary.main,
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
        color: "white",
      },
    },
  }));

  // 🧭 Render
  return (
    <List component="li" disablePadding key={item?.id ?? item.title}>
      <Link href={item.href || ""}>
        <ListItemStyled
          disabled={item?.disabled}
          selected={pathDirect === item?.href}
          onClick={lgDown ? onClick : undefined}
        >
          {/* 🔹 Icon */}
          <ListItemIcon
            sx={{
              minWidth: "36px",
              p: "3px 0",
              color:
                (level ?? 1) > 1 && pathDirect === item?.href
                  ? `${theme.palette.primary.main}!important`
                  : "inherit",
            }}
          >
            {itemIcon}
          </ListItemIcon>

          {/* 🔹 Başlık + Altbaşlık */}
            <ListItemText>
            {!hideMenu && (
              <>
                {t(item.title ?? "")} {/* ✅ TypeScript hatası çözülür */}
                {item?.subtitle && (
                  <Typography variant="caption" display="block">
                    {t(item.subtitle ?? "")}
                  </Typography>
                )}
              </>
            )}
          </ListItemText>

          {/* 🔹 Chip etiketi */}
          {!item?.chip || hideMenu ? null : (
            <Chip
              color={
                (item?.chipColor as
                  | "default"
                  | "error"
                  | "primary"
                  | "secondary"
                  | "info"
                  | "success"
                  | "warning") || "default"
              }
              variant={(item?.variant as "filled" | "outlined") || "filled"}
              size="small"
              label={item?.chip}
            />
          )}
        </ListItemStyled>
      </Link>
    </List>
  );
}
