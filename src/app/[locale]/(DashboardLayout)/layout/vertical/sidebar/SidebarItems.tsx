"use client";

import Menuitems from "./MenuItems";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import useMediaQuery from "@mui/material/useMediaQuery";
import { CustomizerContext } from "@/app/context/customizerContext";
import NavItem from "./NavItem";
import NavCollapse from "./NavCollapse";
import NavGroup from "./NavGroup/NavGroup";
import { useContext } from "react";
import { getUserFromToken } from "@/utils/authHelpers"; // 🔒 Token çözümleyici yardımcı fonksiyon

const SidebarItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf("/"));

  // 🎨 Tema context'i güvenli şekilde alınıyor
  const customizer = useContext(CustomizerContext);
  const isSidebarHover = customizer?.isSidebarHover ?? false;
  const isCollapse = customizer?.isCollapse ?? "";
  const isMobileSidebar = customizer?.isMobileSidebar ?? false;
  const setIsMobileSidebar = customizer?.setIsMobileSidebar ?? (() => {});

  // 📱 Responsive kontrol
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const hideMenu = lgUp ? isCollapse == "mini-sidebar" && !isSidebarHover : "";

  // 🔐 Kullanıcının rollerini token'dan çek
  const user = getUserFromToken();
  const roles = user?.roles ?? [];
  const isSuperAdmin = roles.includes("SuperAdmin") || roles.includes("Admin");

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {Menuitems
          // 🎯 Role bazlı filtreleme
          .filter((item) => {
            // "Rol İşlemleri" menüsünü sadece SuperAdmin/Admin görsün
            if (item.title === "Rol İşlemleri" && !isSuperAdmin) return false;
            return true;
          })
          .map((item) => {
            // Başlık grubu
            if (item.subheader) {
              return (
                <NavGroup
                  item={item}
                  hideMenu={hideMenu}
                  key={item.subheader}
                />
              );
            }
            // Alt menü (collapse)
            else if (item.children) {
              return (
                <NavCollapse
                  menu={item}
                  pathDirect={pathDirect}
                  hideMenu={hideMenu}
                  pathWithoutLastPart={pathWithoutLastPart}
                  level={1}
                  key={item.id}
                  onClick={() => setIsMobileSidebar(!isMobileSidebar)}
                />
              );
            }
            // Normal menü öğesi
            else {
              return (
                <NavItem
                  item={item}
                  key={item.id}
                  pathDirect={pathDirect}
                  hideMenu={hideMenu}
                  onClick={() => setIsMobileSidebar(!isMobileSidebar)}
                />
              );
            }
          })}
      </List>
    </Box>
  );
};

export default SidebarItems;
