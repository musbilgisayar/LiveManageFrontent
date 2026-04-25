//src/modules/account-setting/components/AccountTab.tsx
"use client";

import React from "react";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";

import ProfilePhotoCard from "./ProfilePhotoCard";
import PasswordChangeCard from "@/modules/users/components/detail/cards/PasswordChangeCard";
import PersonalInfoCard from "./PersonalInfoCard";
import { EmailChangeCard } from "@/modules/users/components/detail/cards/EmailChangeCard";

import { postWebFetcher } from "@/utils/fetchers.web.client";

export default function AccountTab() {
  // Email change state
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

      setEmailChangeMessage(
        json?.userMessage || json?.message || "Doğrulama e-postası gönderildi."
      );
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
    <Grid container spacing={3}>
      {/* 🟢 Profil Fotoğrafı */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <ProfilePhotoCard />
      </Grid>

      {/* 🟡 Şifre Değiştir */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <PasswordChangeCard />
      </Grid>

      {/* 🔵 Kişisel Bilgiler */}
      <Grid size={{ xs: 12 }}>
        <PersonalInfoCard />
      </Grid>

      {/* 🔵 Email Değiştirme */}
      <Grid size={{ xs: 12 }}>
        {emailChangeError && <Alert severity="error" sx={{ mb: 2 }}>{emailChangeError}</Alert>}
        {emailChangeMessage && <Alert severity="success" sx={{ mb: 2 }}>{emailChangeMessage}</Alert>}

        <EmailChangeCard
          onRequest={onRequestEmailChange}
          loading={emailChangeLoading}
          message={null} // message'i Alert ile gösteriyoruz
        />
      </Grid>
    </Grid>
  );
}