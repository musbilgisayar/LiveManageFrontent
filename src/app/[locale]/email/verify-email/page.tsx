"use client";

import React from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { useRouter, useParams } from "next/navigation";
import { useI18nNs } from "@/app/context/i18nContext";

export default function VerifyEmailPage() {
  const { t } = useI18nNs(["verification"]);
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || "tr";

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
        <MarkEmailReadIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />

        <Typography variant="h4" fontWeight={600} gutterBottom>
          {t("verification:verifyEmail.title")}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t("verification:verifyEmail.message")}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={() => router.push(`/${locale}/auth?tab=login`)}
        >
          {t("verification:verifyEmail.button")}
        </Button>
      </Paper>
    </Box>
  );
}
