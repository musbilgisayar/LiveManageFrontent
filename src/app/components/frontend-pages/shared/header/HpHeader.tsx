// src/app/components/frontend-pages/shared/header/HpHeader.tsx
"use client";
import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import { styled } from "@mui/material/styles";
import Logo from "@/app/[locale]/(DashboardLayout)/layout/shared/logo/Logo";
import Navigations from "./Navigations";
import MobileSidebar from "./MobileSidebar";
import { IconMenu2 } from "@tabler/icons-react";
import LanguageSelector from "@/app/components/shared/LanguageSelector";
import UserMenu from "@/app/components/shared/UserMenu";

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  justifyContent: "center",
  [theme.breakpoints.up("lg")]: { minHeight: "100px" },
  backgroundColor: theme.palette.primary.light,
}));

const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
  width: "100%",
  paddingLeft: "0 !important",
  paddingRight: "0 !important",
  color: theme.palette.text.secondary,
  justifyContent: "space-between",
}));

export default function HpHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <AppBarStyled position="sticky" elevation={0}>
      <Container sx={{ maxWidth: "1400px !important" }}>
        <ToolbarStyled>
          <Logo />

          {/* WHY: DOM sabit; görünürlük breakpoint ile */}
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={() => setMenuOpen(true)}
            sx={{ display: { xs: "inline-flex", lg: "none" } }}
          >
            <IconMenu2 size="20" />
          </IconButton>

          {/* Masaüstü navigasyon */}
          <Stack
            direction="row"
            alignItems="center"
            sx={{ display: { xs: "none", lg: "flex" }, flex: 1, justifyContent: "center" }}
          >
            <Navigations />
          </Stack>

          {/* Sağ aksiyonlar (masaüstü) */}
          <Stack
            spacing={2}
            direction="row"
            alignItems="center"
            sx={{ display: { xs: "none", lg: "flex" } }}
          >
            <LanguageSelector />
            <UserMenu />
          </Stack>
        </ToolbarStyled>
      </Container>

      {/* Mobil Drawer */}
      <Drawer
        anchor="left"
        open={menuOpen}
        variant="temporary"
        onClose={() => setMenuOpen(false)}
        slotProps={{
          paper: {
            sx: { width: 270, border: "0 !important", boxShadow: (theme) => theme.shadows[8] },
          },
        }}
      >
        <MobileSidebar />
      </Drawer>
    </AppBarStyled>
  );
}
