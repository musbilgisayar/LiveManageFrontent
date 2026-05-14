"use client";

import { useContext, useMemo } from "react";
import { usePathname } from "next/navigation";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import useMediaQuery from "@mui/material/useMediaQuery";

import Menuitems from "./MenuItems";
import NavItem from "./NavItem";
import NavCollapse from "./NavCollapse";
import NavGroup from "./NavGroup/NavGroup";

import { CustomizerContext } from "@/app/context/customizerContext";
import { useAuth } from "@/app/context/AuthContext";
import { filterMenuByPermissions } from "@/modules/auth/utils/menuPermission.utils";

const SidebarItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf("/"));

  const customizer = useContext(CustomizerContext);
  const isSidebarHover = customizer?.isSidebarHover ?? false;
  const isCollapse = customizer?.isCollapse ?? "";
  const isMobileSidebar = customizer?.isMobileSidebar ?? false;
  const setIsMobileSidebar = customizer?.setIsMobileSidebar ?? (() => {});

  const { effectivePermissions, loading, permissionsReady } = useAuth();

  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const hideMenu = lgUp ? isCollapse === "mini-sidebar" && !isSidebarHover : "";

  const filteredMenuItems = useMemo(() => {
    if (loading || !permissionsReady) {
      return [];
    }

    return filterMenuByPermissions(Menuitems, effectivePermissions);
  }, [effectivePermissions, loading, permissionsReady]);

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {filteredMenuItems.map((item) => {
          if (item.subheader) {
            return (
              <NavGroup
                item={item}
                hideMenu={hideMenu}
                key={item.subheader}
              />
            );
          }

          if (item.children) {
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

          return (
            <NavItem
              item={item}
              key={item.id}
              pathDirect={pathDirect}
              hideMenu={hideMenu}
              onClick={() => setIsMobileSidebar(!isMobileSidebar)}
            />
          );
        })}
      </List>
    </Box>
  );
};

export default SidebarItems;