// src/app/[locale]/(DashboardLayout)/DashboardContent.client.tsx

"use client";

import React, { useContext, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { useTheme } from "@mui/material/styles";

import Header from "./layout/vertical/header/Header";
import Sidebar from "./layout/vertical/sidebar/Sidebar";
import Customizer from "./layout/shared/customizer/Customizer";
import Navigation from "./layout/horizontal/navbar/Navigation";
import HorizontalHeader from "./layout/horizontal/header/Header";
import { CustomizerContext } from "@/app/context/customizerContext";

export default function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const customizer = useContext(CustomizerContext);
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeLayout = mounted ? customizer?.activeLayout ?? "vertical" : "vertical";
  const isLayout = mounted ? customizer?.isLayout ?? "full" : "full";
  const activeMode = mounted ? customizer?.activeMode ?? "light" : "light";
  const isCollapse = mounted ? customizer?.isCollapse ?? "" : "";

  return (
    <div
      suppressHydrationWarning
      className={activeMode === "dark" ? "darkbg mainwrapper" : "mainwrapper"}
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {mounted && activeLayout !== "horizontal" ? <Sidebar /> : null}

      <Box
        suppressHydrationWarning
        className="page-wrapper"
        sx={{
          display: "flex",
          flexGrow: 1,
          paddingBottom: "60px",
          flexDirection: "column",
          zIndex: 1,
          width: "100%",
          backgroundColor: "transparent",
          ...(mounted &&
            isCollapse === "mini-sidebar" && {
              [theme.breakpoints.up("lg")]: {
                ml: "87px",
              },
            }),
        }}
      >
        {mounted ? (
          activeLayout === "horizontal" ? (
            <HorizontalHeader />
          ) : (
            <Header />
          )
        ) : null}

        {mounted && activeLayout === "horizontal" ? <Navigation /> : null}

        <Container
          sx={{
            pt: "30px",
            maxWidth: mounted && isLayout === "boxed" ? "lg" : "100%!important",
          }}
        >
          <Box sx={{ minHeight: "calc(100vh - 170px)" }}>
            {mounted ? children : null}
          </Box>
        </Container>

        {mounted ? <Customizer /> : null}
      </Box>
    </div>
  );
}