"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled, Theme } from "@mui/material/styles";
import { IconMenu2, IconMoon, IconSun } from "@tabler/icons-react";
import { useI18nNs } from "@/app/context/i18nContext";
import { useCustomizer } from "@/app/context/customizerContext";
import Logo from "../../shared/logo/Logo";
import Navigation from "../../vertical/header/Navigation";
import Search from "../../vertical/header/Search";
import Cart from "../../vertical/header/Cart";
import Notifications from "../../vertical/header/Notification";
import Profile from "../../vertical/header/Profile";
import LanguageSelector from "@/app/components/shared/LanguageSelector";
import { ProductProvider } from "@/app/context/Ecommercecontext";
import config from "@/app/context/config";

const Header = () => {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));

  const {
    isLayout,
    isMobileSidebar,
    setIsMobileSidebar,
    activeMode,
    setActiveMode,
  } = useCustomizer();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    [theme.breakpoints.up("lg")]: {
      minHeight: config.topbarHeight,
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    margin: "0 auto",
    width: "100%",
    color: theme.palette.text.secondary,
  }));

  return (
    <ProductProvider>
      <AppBarStyled position="sticky" color="default" elevation={8}>
        <ToolbarStyled
          sx={{
            maxWidth: isLayout === "boxed" ? "lg" : "100%!important",
          }}
        >
          <Box sx={{ width: lgDown ? "45px" : "auto", overflow: "hidden" }}>
            <Logo />
          </Box>

          {lgDown && (
            <IconButton
              color="inherit"
              onClick={() => setIsMobileSidebar(!isMobileSidebar)}
            >
              <IconMenu2 />
            </IconButton>
          )}

          <Search />

          {lgUp && <Navigation />}

          <Box flexGrow={1} />

          <Stack spacing={1} direction="row" alignItems="center">
            <LanguageSelector />

            <Cart />

            <IconButton size="large" color="inherit">
              {activeMode === "light" ? (
                <IconMoon size={21} stroke={1.5} onClick={() => setActiveMode("dark")} />
              ) : (
                <IconSun size={21} stroke={1.5} onClick={() => setActiveMode("light")} />
              )}
            </IconButton>

            <Notifications />
            <Profile />
          </Stack>
        </ToolbarStyled>
      </AppBarStyled>
    </ProductProvider>
  );
};

export default Header;
