"use client";

import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled, useTheme } from "@mui/material/styles";
import Header from "./layout/vertical/header/Header";
import Sidebar from "./layout/vertical/sidebar/Sidebar";
import Customizer from "./layout/shared/customizer/Customizer";
import Navigation from "./layout/horizontal/navbar/Navigation";
import HorizontalHeader from "./layout/horizontal/header/Header";
import { CustomizerContext } from "@/app/context/customizerContext";

// 🎨 styled components
const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  width: "100%",
  backgroundColor: "transparent",
}));

/**
 * 🧩 Client Component
 * Auth guard burada değil, middleware tarafında yapılır.
 * Web auth stratejisi cookie tabanlıdır.
 */
export default function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const customizer = useContext(CustomizerContext);
  const theme = useTheme();

  const activeLayout = customizer?.activeLayout ?? "vertical";
  const isLayout = customizer?.isLayout ?? "full";
  const activeMode = customizer?.activeMode ?? "light";
  const isCollapse = customizer?.isCollapse ?? "";

  return (
    <MainWrapper
      className={activeMode === "dark" ? "darkbg mainwrapper" : "mainwrapper"}
    >
      {activeLayout === "horizontal" ? null : <Sidebar />}

      <PageWrapper
        className="page-wrapper"
        sx={{
          ...(isCollapse === "mini-sidebar" && {
            [theme.breakpoints.up("lg")]: {
              ml: `87px`,
            },
          }),
        }}
      >
        {activeLayout === "horizontal" ? <HorizontalHeader /> : <Header />}
        {activeLayout === "horizontal" ? <Navigation /> : null}

        <Container
          sx={{
            pt: "30px",
            maxWidth: isLayout === "boxed" ? "lg" : "100%!important",
          }}
        >
          <Box sx={{ minHeight: "calc(100vh - 170px)" }}>{children}</Box>
        </Container>

        <Customizer />
      </PageWrapper>
    </MainWrapper>
  );
}