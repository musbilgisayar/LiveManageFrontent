"use client";

import React, { useEffect } from "react";

type Props = {
  children: React.ReactNode;
  dir: "ltr" | "rtl";
  mode: "light" | "dark";
};

export default function MuiProviders({ children, dir }: Props) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.dir = dir;
    }
  }, [dir]);

  return <>{children}</>;
}
// src/app/providers/MuiProviders.tsx
/*
"use client";

import React, { useEffect, useMemo } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";

type Props = {
  children: React.ReactNode;
  dir: "ltr" | "rtl";
  mode: "light" | "dark";
};

function createEmotionCache(dir: "ltr" | "rtl") {
  return createCache({
    key: dir === "rtl" ? "mui-rtl" : "mui",
    prepend: true,
    stylisPlugins: dir === "rtl" ? [prefixer, rtlPlugin] : [prefixer],
  });
}

export default function MuiProviders({ children, dir, mode }: Props) {
  const cache = useMemo(() => createEmotionCache(dir), [dir]);

  const theme = useMemo(
    () =>
      createTheme({
        direction: dir,
        palette: { mode },
        // burada typography, shape, components override vs. ekleyebilirsin
      }),
    [dir, mode]
  );

  // güvenlik: client’ta da dir eşitle
  useEffect(() => {
    if (typeof document !== "undefined") document.dir = dir;
  }, [dir]);

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
*/