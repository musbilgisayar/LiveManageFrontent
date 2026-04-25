"use client";

/**
 * 🌍 LiveManage | Sidebar Açılır Menü Bileşeni (NavCollapse)
 * ---------------------------------------------------------
 * Bu bileşen sidebar’daki alt başlık gruplarını (örnek: "Uygulamalar", "Forms", "Charts" vb.)
 * ve onların altındaki menü öğelerini açıp kapatır.
 *
 * Özellikler:
 * - menu.title → Çeviri anahtarı (örn. "sidebar:menu.forms.root")
 * - Alt öğeler (menu.children) varsa kendini recursive olarak çağırır.
 *
 * 🔧 i18n sistemi: useI18nNs(["sidebar"])
 */

import React, { useContext, useState, useEffect } from "react";
import { CustomizerContext } from "@/app/context/customizerContext";
import { usePathname } from "next/navigation";
import {
  Collapse,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Theme, styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { isNull } from "lodash";
import NavItem from "../NavItem";
import { NavCollapseProps, NavGroup } from "@/app/[locale]/(DashboardLayout)/types/layout/sidebar";
import { useI18nNs } from "@/app/context/i18nContext"; // 🌐 Özel çeviri hook'u

export default function NavCollapse({
  menu,
  level,
  pathWithoutLastPart,
  pathDirect,
  hideMenu,
  onClick,
}: NavCollapseProps) {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
  const  isBorderRadius  = useContext(CustomizerContext);
  const Icon = menu?.icon;
  const theme = useTheme();
  const pathname = usePathname();

  // 🌍 Yeni çeviri sistemi
  const { t } = useI18nNs(["sidebar"]);

  const [open, setOpen] = useState(false);

  const menuIcon = Icon ? (
    level > 1 ? <Icon stroke={1.5} size="1rem" /> : <Icon stroke={1.5} size="1.3rem" />
  ) : null;

  const handleClick = () => {
    setOpen(!open);
  };

  // 🔄 Sayfa değişince alt menülerin açılma durumu kontrol edilir
  useEffect(() => {
    setOpen(false);
    menu?.children?.forEach((item: NavGroup) => {
      if (item?.href === pathname) {
        setOpen(true);
      }
    });
  }, [pathname, menu.children]);

  // 🎨 Stil
  const ListItemStyled = styled(ListItemButton)(() => ({
    marginBottom: "2px",
    padding: "8px 10px",
    paddingLeft: hideMenu ? "10px" : level > 2 ? `${level * 15}px` : "10px",
    backgroundColor: open && level < 2 ? theme.palette.primary.main : "",
    whiteSpace: "nowrap",
    "&:hover": {
      backgroundColor:
        pathname.includes(menu.href || "") || open
          ? theme.palette.primary.main
          : theme.palette.primary.light,
      color:
        pathname.includes(menu.href || "") || open
          ? "white"
          : theme.palette.primary.main,
    },
    color:
      open && level < 2
        ? "white"
        : level > 1 && open
        ? theme.palette.primary.main
        : theme.palette.text.secondary,
    borderRadius: `${isBorderRadius}px`,
  }));

  // 🔽 Alt menüler (recursive yapı)
 const submenus = menu.children?.map((item: any, index: number) => {
  const keyBase =
    item?.id ||
    item?.href ||
    item?.title ||
    `submenu-${level}-${index}`;

  if (item.children) {
    return (
      <NavCollapse
        key={`collapse-${keyBase}`}
        menu={item}
        level={level + 1}
        pathWithoutLastPart={pathWithoutLastPart}
        pathDirect={pathDirect}
        hideMenu={hideMenu}
        onClick={onClick}
      />
    );
  }

  return (
    <NavItem
      key={`item-${keyBase}`}
      item={item}
      level={level + 1}
      pathDirect={pathDirect}
      hideMenu={hideMenu}
      onClick={lgDown ? onClick : isNull}
    />
  );
});

  // 🧠 Çeviri anahtarı
  const title = menu?.title ? t(menu.title) : "";

  return (
    <>
      <ListItemStyled
        onClick={handleClick}
        selected={pathWithoutLastPart === menu.href}
        //key={menu?.id}
      >
        <ListItemIcon
          sx={{
            minWidth: "36px",
            p: "3px 0",
            color: "inherit",
          }}
        >
          {menuIcon}
        </ListItemIcon>

        {/* 🔹 Alt başlık (çevirilen başlık) */}
        <ListItemText color="inherit">
          {hideMenu ? "" : <>{title}</>}
        </ListItemText>

        {/* Açılır/Kapanır ikon */}
        {!open ? <IconChevronDown size="1rem" /> : <IconChevronUp size="1rem" />}
      </ListItemStyled>

      <Collapse in={open} timeout="auto">
        {submenus}
      </Collapse>
    </>
  );
}
