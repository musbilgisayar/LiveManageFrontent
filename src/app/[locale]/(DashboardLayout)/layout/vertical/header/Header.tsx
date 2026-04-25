// src/app/[locale]/(DashboardLayout)/layout/vertical/header/Header.tsx
"use client";

import { useContext } from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled } from "@mui/material/styles";

import { IconMenu2, IconMoon, IconSun } from "@tabler/icons-react";

import Notifications from "./Notification";
import Profile from "./Profile";
import Cart from "./Cart";
import Search from "./Search";
import Navigation from "./Navigation";
import MobileRightSidebar from "./MobileRightSidebar";

import LanguageSelector from "@/app/components/shared/LanguageSelector";

import { CustomizerContext } from "@/app/context/customizerContext";
import { useI18nNs } from "@/app/context/i18nContext";

import config from "@/app/context/config";
import { ProductProvider } from "@/app/context/Ecommercecontext/index";

const Header = () => {
  // 🔹 Header çevirilerini önceden yükler
 

 

 const { t, dict } = useI18nNs(["header"]);

 

  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));

  const TopbarHeight = config.topbarHeight;

  // 🔹 Context güvenli şekilde alınır
  const customizer = useContext(CustomizerContext);

  if (!customizer) {
    throw new Error("CustomizerContext bulunamadı. Provider ekli mi kontrol edin.");
  }

  const {
    activeMode,
    setActiveMode,
    setIsCollapse,
    isCollapse,
    isMobileSidebar,
    setIsMobileSidebar,
  } = customizer;

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    [theme.breakpoints.up("lg")]: {
      minHeight: TopbarHeight,
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary,
  }));

  return (
    <ProductProvider>
      <AppBarStyled position="sticky" color="default">
        <ToolbarStyled>

          {/* Menü aç/kapat butonu */}
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={() => {
              if (lgUp) {
                isCollapse === "full-sidebar"
                  ? setIsCollapse("mini-sidebar")
                  : setIsCollapse("full-sidebar");
              } else {
                setIsMobileSidebar(!isMobileSidebar);
              }
            }}
          >
            <IconMenu2 size="20" />
          </IconButton>

          {/* Arama */}
          <Search />

          {/* Büyük ekranda navigation */}
          {lgUp && <Navigation />}

          <Box flexGrow={1} />

          {/* Sağ üst ikonlar */}
          <Stack spacing={1} direction="row" alignItems="center">

            <LanguageSelector />

            <Cart />

            {/* Tema değiştirme */}
            <IconButton size="large" color="inherit">
              {activeMode === "light" ? (
                <IconMoon
                  size="21"
                  stroke="1.5"
                  onClick={() => setActiveMode("dark")}
                />
              ) : (
                <IconSun
                  size="21"
                  stroke="1.5"
                  onClick={() => setActiveMode("light")}
                />
              )}
            </IconButton>

            <Notifications />

            {lgDown && <MobileRightSidebar />}

            <Profile />

          </Stack>

        </ToolbarStyled>
      </AppBarStyled>
    </ProductProvider>
  );
};

export default Header;