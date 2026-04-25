"use client";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import SidebarItems from "./SidebarItems";
import Logo from "../../shared/logo/Logo";
import { CustomizerContext } from "@/app/context/customizerContext";
import config from "@/app/context/config";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";
import { Profile } from "./SidebarProfile/Profile";
import { useContext } from "react";

const Sidebar = () => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));
  const customizer = useContext(CustomizerContext);
  const theme = useTheme();

  // 🔹 Null olasılığına karşı güvenli erişim
  const isCollapse = customizer?.isCollapse ?? "full";
  const isSidebarHover = customizer?.isSidebarHover ?? false;
  const setIsSidebarHover = customizer?.setIsSidebarHover ?? (() => {});
  const isMobileSidebar = customizer?.isMobileSidebar ?? false;
  const setIsMobileSidebar = customizer?.setIsMobileSidebar ?? (() => {});

  const MiniSidebarWidth = config.miniSidebarWidth;
  const SidebarWidth = config.sidebarWidth;

  const toggleWidth =
    isCollapse === "mini-sidebar" && !isSidebarHover
      ? MiniSidebarWidth
      : SidebarWidth;

  const onHoverEnter = () => {
    if (isCollapse === "mini-sidebar") {
      setIsSidebarHover(true);
    }
  };

  const onHoverLeave = () => {
    setIsSidebarHover(false);
  };

  return (
    <>
      {/* Masaüstü (desktop) görünümü */}
      {!lgUp ? (
        <Box
          sx={{
            zIndex: 100,
            width: toggleWidth,
            flexShrink: 0,
            ...(isCollapse === "mini-sidebar" && {
              position: "absolute",
            }),
          }}
        >
          <Drawer
            anchor="left"
            open
            onMouseEnter={onHoverEnter}
            onMouseLeave={onHoverLeave}
            variant="permanent"
            slotProps={{
              paper: {
                sx: {
                  transition: theme.transitions.create("width", {
                    duration: theme.transitions.duration.shortest,
                  }),
                  width: toggleWidth,
                  boxSizing: "border-box",
                },
              },
            }}
          >
            <Box sx={{ height: "100%" }}>
              <Box px={3}>
                <Logo />
              </Box>

              <Scrollbar sx={{ height: "calc(100% - 190px)" }}>
                <SidebarItems />
              </Scrollbar>

              <Profile />
            </Box>
          </Drawer>
        </Box>
      ) : (
        // 🔹 Mobil görünüm
        <Drawer
          anchor="left"
          open={isMobileSidebar}
          onClose={() => setIsMobileSidebar(false)}
          variant="temporary"
          slotProps={{
            paper: {
              sx: {
                width: SidebarWidth,
                border: "0 !important",
                boxShadow: (theme) => theme.shadows[8],
              },
            },
          }}
        >
          <Box px={2}>
            <Logo />
          </Box>
          <SidebarItems />
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
