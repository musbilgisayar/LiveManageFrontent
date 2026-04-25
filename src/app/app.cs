"use client";

import React, { useContext } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import RTL from "@/app/[locale]/(DashboardLayout)/layout/shared/customizer/RTL";
import "leaflet/dist/leaflet.css";

import { ThemeSettings } from "@/utils/theme/Theme";
import { CustomizerContext } from "@/app/context/customizerContext";

const MyApp = ({ children }: { children: React.ReactNode }) => {
  const theme = ThemeSettings();
  const customizer = useContext(CustomizerContext);
  const activeDir = customizer?.activeDir ?? "ltr";

  return (
    <ThemeProvider theme={theme}>
      <RTL direction={activeDir}>
        <CssBaseline />
        {children}
      </RTL>
    </ThemeProvider>
  );
};

export default MyApp;
/*"use client";
import React, { useContext } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import RTL from "@/app/[locale]/(DashboardLayout)/layout/shared/customizer/RTL";
import "leaflet/dist/leaflet.css";

import { ThemeSettings } from "@/utils/theme/Theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { CustomizerContext } from "@/app/context/customizerContext";

const MyApp = ({ children }: { children: React.ReactNode }) => {
  const theme = ThemeSettings();
  const customizer = useContext(CustomizerContext);
  const activeDir = customizer?.activeDir ?? "ltr"; // ✅ null-safe default

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <RTL direction={activeDir}>
          <CssBaseline />
          {children}
        </RTL>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};

export default MyApp;
*/