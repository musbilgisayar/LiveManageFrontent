// src/modules/profile/pages/ProfilePage.tsx
"use client";

import React from "react";
import { Stack, Grid, Alert } from "@mui/material";
import PageContainer from "@/app/components/container/PageContainer";
import { useI18nNs } from "@/app/context/i18nContext";

// 🧩 Modül kartları
import UserAccountDetailCard from "../../users/components/detail/cards/UserAccountDetailCard";
import UserLanguageCard from "../../users/components/detail/cards/UserLanguageCard";

import { useProfile } from "../hooks/useProfile";
import { useAccountMe } from "../hooks/useAccountMe";

export default function ProfilePage() {
  const { t } = useI18nNs(["account", "common"]);

  const { profile, isLoading, error, save, reload } = useProfile();
  const { user, isLoading: userLoading, error: userError } = useAccountMe();

  return (
    <PageContainer
      title={t("account:profile.title", { defaultValue: "Profilim" })}
      description={t("account:profile.desc", {
        defaultValue: "Kişisel ve kurumsal bilgilerinizi yönetin.",
      })}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("common:alert.error", { defaultValue: "Bir hata oluştu." })}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sol Sütun */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack spacing={3}>
            <UserLanguageCard
              currentCultureCode={user?.cultureCode}
              isLoading={userLoading}
              error={null}
              onUpdated={reload}
            />

            <UserAccountDetailCard
              user={user}
              isLoading={userLoading}
              error={userError}
              onUpdated={reload}
            />
          </Stack>
        </Grid>

        {/* Sağ Sütun */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack spacing={3}>
            {/* İleride başka kartlar buraya gelecek */}
          </Stack>
        </Grid>
      </Grid>
    </PageContainer>
  );
}