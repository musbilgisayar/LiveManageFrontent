"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";

import Breadcrumb from "@/app/[locale]/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";

import LocalizationCreateKeyDialog from "@/modules/localization/components/detail/LocalizationCreateKeyDialog";
import LocalizationDetailToolbar from "@/modules/localization/components/detail/LocalizationDetailToolbar";
import LocalizationLanguageValueList from "@/modules/localization/components/detail/LocalizationLanguageValueList";
import LocalizationSelectedKeyCard from "@/modules/localization/components/detail/LocalizationSelectedKeyCard";
import LocalizationToast from "@/modules/localization/components/detail/LocalizationToast";

import { useLocalizationDetail } from "@/modules/localization/hooks/useLocalizationDetail";
import type { LocalizationDetailPageProps } from "@/modules/localization/types/LocalizationDetail.types";

export default function LocalizationDetailView({
  locale,
}: LocalizationDetailPageProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  const lang = (locale ?? "tr").toString();

  const {
    t,
    fullKey,
    namespace,
    languages,
    values,
    loading,
    saving,
    toast,
    closeToast,
    handleValueChange,
    saveAll,
    createNewKey,
  } = useLocalizationDetail();

  return (
    <Box>
      <Breadcrumb
        title={t("localization:detail.breadcrumb.title") || "Çeviri Detay"}
        subtitle={
          t("localization:detail.breadcrumb.subtitle") ||
          "Anahtar detayları ve tüm diller için değerler"
        }
        items={[
          {
            title:
              t("localization:detail.breadcrumb.localization") ||
              "Localization",
            to: `/${lang}/localization`,
          },
          {
            title: t("localization:detail.breadcrumb.detail") || "Detail",
          },
        ]}
      />

      <LocalizationDetailToolbar
        t={t}
        onBack={() => router.back()}
        onOpenCreateDialog={() => setCreateOpen(true)}
      />

      <LocalizationSelectedKeyCard
        namespace={namespace}
        fullKey={fullKey}
        t={t}
      />

      <LocalizationLanguageValueList
        languages={languages}
        values={values}
        loading={loading}
        saving={saving}
        t={t}
        onValueChange={handleValueChange}
        onSaveAll={saveAll}
      />

      <LocalizationCreateKeyDialog
        open={createOpen}
        initialNamespace={namespace}
        languages={languages}
        saving={saving}
        t={t}
        onClose={() => setCreateOpen(false)}
        onCreate={createNewKey}
      />

      <LocalizationToast toast={toast} onClose={closeToast} />
    </Box>
  );
}