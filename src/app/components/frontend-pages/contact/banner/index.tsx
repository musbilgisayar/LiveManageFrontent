"use client";

import React from "react";
import { Box, Typography, Container, Grid } from "@mui/material";
import { useI18nNs } from "@/app/context/i18nContext";

function auditBeacon(event: string, extra?: Record<string, unknown>) {
  try {
    const payload = JSON.stringify({ event, ts: new Date().toISOString(), ...extra });
    navigator.sendBeacon?.("/api/audit/ui-events", payload);
  } catch { /* swallow */ }
}

const Banner = () => {
  // sadece contact namespace’i yeterli (common kullanılmıyor)
  const { t, lang, ready } = useI18nNs(["contact"]);
  const onMapLoad = () => auditBeacon("contactMapLoaded", { lang });

  return (
    <>
      <Box
        key={`${lang}-contact-banner`}
        bgcolor="primary.light"
        aria-busy={!ready}
        sx={{
          paddingTop: { xs: "40px", lg: "100px" },
          paddingBottom: { xs: "40px", lg: "200px" },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            <Grid alignItems="center" textAlign="center" size={{ xs: 12, lg: 8 }}>
              <Typography
                color="primary.main"
                textTransform="uppercase"
                fontSize="13px"
                aria-label={t("contact:badge,aria")}
              >
                {t("contact:badge,string")}
              </Typography>

              <Typography
                variant="h1"
                mb={3}
                lineHeight={1.4}
                fontWeight={700}
                sx={{ fontSize: { xs: "34px", sm: "48px", lg: "56px" } }}
              >
                {t("contact:title,string")}
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ mt: { lg: "-150px" } }}>
        <Container maxWidth="lg">
          <iframe
            src="https://www.google.com/maps/embed?... (kısalttım)"
            width="100%"
            height="440"
            style={{ border: 0, pointerEvents: ready ? "auto" : "none" }}
            title={t("contact:map,title")}
            aria-label={t("contact:map,aria")}
            allowFullScreen
            loading="lazy"
            onLoad={onMapLoad}
          />

          {/* Fallback örnek */}
          {/*
          <Image
            src="/images/frontend-pages/contact/map.jpg"
            alt={t("contact:map,alt")}
            width={1218}
            height={440}
            style={{ borderRadius: 16, width: "100%", height: "auto" }}
          />
          */}
        </Container>
      </Box>
    </>
  );
};

export default Banner;
