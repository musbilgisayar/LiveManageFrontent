"use client";

import { useState } from "react";
import { Alert, Box, CircularProgress, Grid, Stack } from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";
import { useSuperAdminUserDetail } from "../hooks/useSuperAdminUserDetail";

import UserDetailHeader from "../components/detail/UserDetailHeader";
import UserDetailTabs, {
  UserDetailTabDefinition,
  UserDetailTabKey,
} from "../components/detail/tabs/UserDetailTabs";

import UserOverviewTab from "../components/detail/tabs/UserOverviewTab";
import UserIdentityTab from "../components/detail/tabs/UserIdentityTab";
import UserContactTab from "../components/detail/tabs/ContactTab";
import PreferencesTab from "../components/detail/tabs/PreferencesTab";
import { PasswordChangeCard } from "../components/detail/cards/PasswordChangeCard";

type Props = {
  locale: string;
  userId: string;
};

export default function UserDetailView({ locale, userId }: Props) {
  const { t, ready } = useI18nNs(["users", "common", "header"]);
  const { user, isLoading, error, mutate } = useSuperAdminUserDetail(userId);
  const [activeTab, setActiveTab] = useState<UserDetailTabKey>("overview");

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };

  const tabs: UserDetailTabDefinition[] = [
    { key: "overview", labelKey: "users:detail.tabs.overview" },
    { key: "identity", labelKey: "users:detail.tabs.identity" },
    { key: "contact", labelKey: "users:detail.tabs.contact" },
    { key: "preferences", labelKey: "users:detail.tabs.preferences" },
    { key: "organization", labelKey: "users:detail.tabs.organization" },
    { key: "security", labelKey: "users:detail.tabs.security" },
    { key: "permissions", labelKey: "users:detail.tabs.permissions" },
    { key: "audit", labelKey: "users:detail.tabs.audit" },
    { key: "system", labelKey: "users:detail.tabs.system" },
  ];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error.message || tr("common:error", "Bir hata oluştu.")}
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert severity="info">
        {tr("users:detail.empty", "Kullanıcı detayı bulunamadı.")}
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <UserDetailHeader user={user} locale={locale} t={t} />

      {!ready && (
        <Alert severity="warning">
          {tr(
            "common:loadingTranslations",
            "Çeviriler henüz yüklenmedi, geçici metinler gösteriliyor."
          )}
        </Alert>
      )}

      <UserDetailTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        t={t}
      />

      <Box>
        {activeTab === "overview" && <UserOverviewTab user={user} />}

        {activeTab === "identity" && (
          <UserIdentityTab
            user={user}
            onUpdated={async () => {
              await mutate();
            }}
          />
        )}

        {activeTab === "contact" && <UserContactTab user={user} />}

        {activeTab === "preferences" && (
          <PreferencesTab data={user} t={t} />
        )}

        {activeTab === "organization" && (
          <Alert severity="info">Organization tab hazırlanacak</Alert>
        )}

        {activeTab === "security" && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <PasswordChangeCard userId={userId} />
            </Grid>
          </Grid>
        )}

        {activeTab === "permissions" && (
          <Alert severity="info">Permissions tab hazırlanacak</Alert>
        )}

        {activeTab === "audit" && (
          <Alert severity="info">Audit tab hazırlanacak</Alert>
        )}

        {activeTab === "system" && (
          <Alert severity="info">System tab hazırlanacak</Alert>
        )}
      </Box>
    </Stack>
  );
}