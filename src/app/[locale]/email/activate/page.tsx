"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useI18nNs } from "@/app/context/i18nContext";
import { localeHref } from "@/app/components/shared/LocaleLink";
// ============================================================
// 📌 Component
// ============================================================
export default function EmailActivatePage() {
  const { t } = useI18nNs(["verification"]);
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const locale = params?.locale || "tr";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  // ============================================================
  // 📌 Email doğrulama isteği
  // ============================================================
  const verifyEmail = useCallback(async () => {
    const rawToken = searchParams.get("token");

    if (!rawToken) {
      setStatus("error");
      return;
    }

    const normalizedToken = rawToken.replace(/ /g, "+");
    const url = `/api/v1.0/account/confirm-email?token=${encodeURIComponent(normalizedToken)}`;

    try {
      const res = await fetch(url, { method: "GET" });
      const text = await res.text();
      const data = JSON.parse(text || "{}");

      if (res.ok && data.ok !== false) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, [searchParams]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  // ============================================================
  // 📌 Başarılıysa 3 sn sonra login sayfasına yönlendir
  // ============================================================


useEffect(() => {
  if (status === "success") {
    const timer = setTimeout(() => {
      router.push(localeHref("/auth?tab=login", locale));
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [status, router, locale]);


  // ============================================================
  // 📌 Render
  // ============================================================
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 480,
          width: "100%",
          p: 4,
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        {/* Yükleniyor */}
        {status === "loading" && (
          <>
            <CircularProgress color="primary" sx={{ mb: 3 }} />
            <Typography variant="h6">{t("verification:loading.title")}</Typography>
          </>
        )}

        {/* Başarılı */}
        {status === "success" && (
          <>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 64, color: "success.main", mb: 2 }}
            />
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {t("verification:success.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t("verification:success.message")}
            </Typography>
           <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={() => router.push(localeHref("/auth?tab=login", locale))}
          >
            {t("verification:success.button")}
          </Button>
          </>
        )}

        {/* Hata */}
        {status === "error" && (
          <>
            <ErrorOutlineIcon
              sx={{ fontSize: 64, color: "error.main", mb: 2 }}
            />
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {t("verification:error.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t("verification:error.message")}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={() => router.push(`/${locale}/verify-email`)}
            >
              {t("verification:error.button")}
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}
