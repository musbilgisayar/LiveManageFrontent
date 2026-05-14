"use client";

import { Alert, Box } from "@mui/material";
import Breadcrumb from "@/app/[locale]/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import { useCallback, useState } from "react";
import { useI18nNs } from "@/app/context/i18nContext";
import { useLocalizationManager } from "../hooks/useLocalizationManager";
import LocalizationToolbar from "../components/manager/LocalizationToolbar";
import LocalizationGrid from "../components/manager/LocalizationGrid";
import LocalizationToast from "../components/manager/LocalizationToast";
import LocalizationCreateDialog from "../components/manager/LocalizationCreateDialog";

type Props = {
  locale: string;
};

export default function LocalizationManagerView({ locale }: Props) {
  const lang = (locale ?? "tr").toString();
  const { t, ready } = useI18nNs(["localization", "common"]);
  const [createOpen, setCreateOpen] = useState(false);

  const tr = useCallback(
    (key: string, fallback: string) => {
      const value = t(key);
      return value === `[${key}]` ? fallback : value;
    },
    [t]
  );

  const manager = useLocalizationManager(tr);

  return (
    <Box>
      <Breadcrumb
        title={tr("localization:page.title", "Çeviri Yönetimi")}
        subtitle={tr(
          "localization:page.subtitle",
          "Anahtarlar ve diller bazında çevirileri görüntüleyin"
        )}
        items={[
          {
            title: tr("common:dashboard", "Dashboard"),
            to: `/${lang}/dashboard`,
          },
          {
            title: tr("localization:breadcrumb.section", "Localization"),
          },
        ]}
      />

      {!ready && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {tr(
            "common:loadingTranslations",
            "Çeviriler henüz yüklenmedi, geçici metinler gösteriliyor."
          )}
        </Alert>
      )}

      <LocalizationToolbar
        namespaceQuery={manager.namespaceQuery}
        namespaceOptions={manager.namespaceOptions}
        onNamespaceChange={manager.setNamespaceQuery}
        selectedLangs={manager.selectedLangs}
        onSelectedLangsChange={manager.setSelectedLangs}
        cultureOptions={manager.cultureOptions}
        languages={manager.languages}
        loading={manager.loading}
        onRefresh={() => void manager.refresh()}
        onCreateOpen={() => setCreateOpen(true)}
        tr={tr}
      />

      <LocalizationGrid
        locale={lang}
        rows={manager.rows}
        selectedLangs={manager.selectedLangs}
        languages={manager.languages}
        loading={manager.loading}
        tr={tr}
      />

      <LocalizationToast toast={manager.toast} onClose={manager.closeToast} />

      <LocalizationCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={async (namespace, key, values) => {
          await manager.createKey(namespace, key, values);
          setCreateOpen(false);
        }}
        languages={manager.languages}
        defaultNs={manager.namespaceQuery}
        saving={manager.saving}
      />
    </Box>
  );
}