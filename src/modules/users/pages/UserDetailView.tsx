//src/modules/users/pages/UserDetailView.tsx
"use client";

import { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Grid, Stack } from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";
import { useAuth } from "@/app/context/AuthContext";


import { useUserDetail } from "../hooks/useUserDetail";
import { getUserDetailTabs } from "../config/userDetailTabs.config";

import UserDetailHeader from "../components/detail/UserDetailHeader";
import UserDetailTabs from "../components/detail/tabs/UserDetailTabs";
import UserOverviewTab from "../components/detail/tabs/UserOverviewTab";
import UserIdentityTab from "../components/detail/tabs/UserIdentityTab";
import UserContactTab from "../components/detail/tabs/ContactTab";
import PreferencesTab from "../components/detail/tabs/PreferencesTab";
import SecurityTab from "../components/detail/tabs/SecurityTab";
import { PasswordChangeCard } from "../components/detail/cards/PasswordChangeCard";

import type { UserDetailTabKey } from "../types/UserDetail.types";
import type { UserDetailMode } from "../config/userDetailTabs.config";

type Props = {
  locale: string;
  mode: UserDetailMode;
  userId?: string;
};

function firstNonEmptyString(...values: Array<unknown>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export default function UserDetailView({ locale, mode, userId }: Props) {
  const { t, ready } = useI18nNs(["users", "common", "header"]);
  const { user: authUser, effectivePermissions } = useAuth();
  const [activeTab, setActiveTab] = useState<UserDetailTabKey>("overview");

  const isSelfMode = mode === "self";
  const missingAdminUserId = !isSelfMode && !userId;

 

  const { user, isLoading, error, mutate } = useUserDetail({
    mode,
    userId,
  });

  const tabs = getUserDetailTabs({
    mode,
    permissions: mode === "admin" ? effectivePermissions : [],
  });

  useEffect(() => {
    if (!tabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(tabs[0]?.key ?? "overview");
    }
  }, [activeTab, tabs]);

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };

  if (missingAdminUserId) {
    return (
      <Alert severity="error">
        {tr(
          "users:detail.errors.userIdRequired",
          "Admin mode için userId zorunludur."
        )}
      </Alert>
    );
  }

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
        {error?.message?.includes(":")
          ? tr(error.message, "Bir hata oluştu.")
          : error?.message || tr("common:error", "Bir hata oluştu.")}
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

  const effectiveUserId = firstNonEmptyString(
    user.identity?.id,
    mode === "admin" ? userId : undefined,
    authUser?.id,
    authUser?.userId,
    authUser?.appUserId,
    authUser?.applicationUserId,
    authUser?.sub,
    authUser?.user?.id,
    authUser?.user?.userId,
    authUser?.user?.appUserId,
    authUser?.user?.applicationUserId
  );

  return (
    <Stack spacing={3}>
      <UserDetailHeader user={user} locale={locale} t={t} mode={mode} />

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
        {activeTab === "overview" && <UserOverviewTab user={user} mode={mode} />}

        {activeTab === "identity" && (
          <UserIdentityTab
            user={user}
            mode={mode}
            onUpdated={async () => {
              await mutate();
            }}
          />
        )}

        {activeTab === "contact" && (
          <UserContactTab user={user} userId={effectiveUserId} />
        )}

        {activeTab === "preferences" && (
          <PreferencesTab data={user} t={t} />
        )}

        {mode === "self" && activeTab === "security" && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <PasswordChangeCard userId={effectiveUserId} />
            </Grid>
          </Grid>
        )}

        {mode === "admin" && activeTab === "security" && (
          <SecurityTab data={user} locale={locale} t={t} role="superadmin" />
        )}

        {mode === "admin" && activeTab === "organization" && (
          <Alert severity="info">Organization tab hazırlanacak</Alert>
        )}

        {mode === "admin" && activeTab === "permissions" && (
          <Alert severity="info">Permissions tab hazırlanacak</Alert>
        )}

        {mode === "admin" && activeTab === "audit" && (
          <Alert severity="info">Audit tab hazırlanacak</Alert>
        )}

        {mode === "admin" && activeTab === "system" && (
          <Alert severity="info">System tab hazırlanacak</Alert>
        )}
      </Box>
    </Stack>
  );
}
