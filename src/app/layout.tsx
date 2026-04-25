//src/app/layout.tsx
import type { Metadata } from "next";
import { cookies } from "next/headers";
import React from "react";
import NextTopLoader from "nextjs-toploader";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
 
import "./global.css";
 
 
export const metadata: Metadata = {
  title: "LiveManage",
  description: "LiveManage frontend",
};

const RTL = new Set(["ar", "fa", "he"]);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const c = await cookies();

   
  const lang = (c.get("lm.lang")?.value || "tr").toLowerCase();
  const dir = RTL.has(lang) ? "rtl" : "ltr";
  const themeMode = (c.get("theme")?.value ?? "light") as "light" | "dark";
  const colorTheme = c.get("colorTheme")?.value ?? "BLUE_THEME";
  const layout = c.get("layout")?.value ?? "vertical";
  const boxed = c.get("boxed")?.value ?? "boxed";
  const sidebar = c.get("sidebar")?.value ?? "full-sidebar";

  return (
    <html
      lang={lang}
      dir={dir}
      className={themeMode}
      data-color-theme={colorTheme}
      data-layout={layout}
      data-boxed-layout={boxed}
      data-sidebar-type={sidebar}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <NextTopLoader color="#5D87FF" />
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}