// src/app/[locale]/(DashboardLayout)/DashboardContent.client.tsx

"use client";

import React, { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { useTheme } from "@mui/material/styles";

import Header from "./layout/vertical/header/Header";
import Sidebar from "./layout/vertical/sidebar/Sidebar";
import Customizer from "./layout/shared/customizer/Customizer";
import Navigation from "./layout/horizontal/navbar/Navigation";
import HorizontalHeader from "./layout/horizontal/header/Header";
import { CustomizerContext } from "@/app/context/customizerContext";
import { useAuth } from "@/app/context/AuthContext";
import {
  buildLoginUrlWithReturnUrl,
  getCurrentReturnUrl,
} from "@/utils/sessionExpiredRedirect.client";

export default function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const customizer = useContext(CustomizerContext);
  const theme = useTheme();
  const router = useRouter();
  const params = useParams() as { locale?: string | string[] };
  const { loading, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const shouldRedirectToLogin = mounted && !loading && !isAuthenticated;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!shouldRedirectToLogin) return;

    const rawLocale = Array.isArray(params.locale)
      ? params.locale[0]
      : params.locale;

    router.replace(
      buildLoginUrlWithReturnUrl(rawLocale ?? "tr", getCurrentReturnUrl())
    );
  }, [params.locale, router, shouldRedirectToLogin]);

  if (shouldRedirectToLogin) {
    return null;
  }

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
            {mounted && !shouldRedirectToLogin ? children : null}
          </Box>
        </Container>

        {mounted ? <Customizer /> : null}
      </Box>
    </div>
  );
}
