"use client";

import React from "react";
import { Alert, CardContent, Typography, Stack } from "@mui/material";
import Grid from "@mui/material/Grid"; // ✅ Grid2 API
import BlankCard from "@/app/components/shared/BlankCard";
import { postWebFetcher } from "@/utils/fetchers.web.client";
//import { postWebFetcher } from "@/utils/fetchers.client";
 
import { PasswordChangeCard } from "@/modules/users/components/detail/cards/PasswordChangeCard";

import { EmailChangeCard } from "@/modules/users/components/detail/cards/EmailChangeCard";
 

export default function CredentialsTab() {
  const [emailChangeLoading, setEmailChangeLoading] = React.useState(false);
  const [emailChangeMessage, setEmailChangeMessage] = React.useState<string | null>(null);
  const [emailChangeError, setEmailChangeError] = React.useState<string | null>(null);

  const onRequestEmailChange = async (newEmail: string) => {
    setEmailChangeLoading(true);
    setEmailChangeMessage(null);
    setEmailChangeError(null);

    try {
      const json: any = await postWebFetcher("/api/v1.0/identity/AppUser/email-change/request", {
        newEmail,
      });

      const ok = json?.ok ?? json?.success ?? true;
      if (ok === false) {
        throw new Error(json?.userMessage || json?.message || json?.error || "Email change failed");
      }

      setEmailChangeMessage(json?.userMessage || json?.message || "Doğrulama e-postası gönderildi.");
    } catch (e: any) {
      setEmailChangeError(
        e?.message ||
          e?.payload?.userMessage ||
          e?.payload?.message ||
          e?.payload?.error ||
          "Email change failed"
      );
    } finally {
      setEmailChangeLoading(false);
    }
  };

  return (
    <Grid container spacing={3} justifyContent="center">
      {/* Sayfa başlığı (isteğe bağlı) */}
      <Grid size={{ xs: 12, lg: 9 }}>
        <BlankCard>
          <CardContent>
            <Typography variant="h4" mb={1}>
              Kimlik Bilgileri
            </Typography>
            <Typography color="textSecondary">
              Şifre ve e-posta değişikliği işlemlerini buradan yönetebilirsiniz.
            </Typography>
          </CardContent>
        </BlankCard>
      </Grid>

      {/* Şifre Değiştir */}
      <Grid size={{ xs: 12, lg: 4.5 }}>
        <PasswordChangeCard />
      </Grid>

      {/* E-posta Değiştir */}
      <Grid size={{ xs: 12, lg: 4.5 }}>
        <BlankCard>
          <CardContent>
            <Typography variant="h5" mb={1}>
              E-posta Değiştir
            </Typography>
            <Typography color="textSecondary" mb={2}>
              Yeni e-posta adresinize doğrulama linki gönderilir.
            </Typography>

            <Stack spacing={2}>
              {emailChangeError && <Alert severity="error">{emailChangeError}</Alert>}
              {emailChangeMessage && <Alert severity="success">{emailChangeMessage}</Alert>}

              <EmailChangeCard
                onRequest={onRequestEmailChange}
                loading={emailChangeLoading}
                message={null} // mesajı Alert ile gösteriyoruz
              />
            </Stack>
          </CardContent>
        </BlankCard>
      </Grid>
    </Grid>
  );
}