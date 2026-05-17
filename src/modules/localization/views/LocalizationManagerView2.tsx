"use client";

import { Alert, Box, Fade, Paper, Zoom } from "@mui/material";
import Breadcrumb from "@/app/[locale]/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import { useCallback, useState } from "react";
import { useI18nNs } from "@/app/context/i18nContext";
import { useLocalizationManager } from "../hooks/useLocalizationManager";
import LocalizationToolbar from "../components/manager/LocalizationToolbar";
import LocalizationGrid from "../components/manager/LocalizationGrid";
import LocalizationToast from "../components/manager/LocalizationToast";
import LocalizationCreateDialog from "../components/manager/LocalizationCreateDialog";
import LocalizationValueLookupPanel from "../components/manager/LocalizationValueLookupPanel";
import   StatsCards   from "../components/manager/StatsCards2";
import { motion, AnimatePresence } from "framer-motion";

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

  // İstatistikler için hesaplamalar
  const stats = {
    totalKeys: manager.rows.length,
    totalLanguages: manager.selectedLangs.length,
    missingTranslations: manager.rows.filter(row => 
      manager.selectedLangs.some(lang => !row.values[lang])
    ).length,
    completionRate: manager.rows.length > 0 
      ? Math.round(((manager.rows.filter(row => 
          manager.selectedLangs.every(lang => row.values[lang])
        ).length) / manager.rows.length) * 100)
      : 0
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 },
      bgcolor: "background.default",
      minHeight: "100vh"
    }}>
      <Fade in timeout={500}>
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
        </Box>
      </Fade>

      {/* İstatistik Kartları */}
      <Zoom in timeout={600}>
        <Box sx={{ mb: 3 }}>
          <StatsCards stats={stats} tr={tr} />
        </Box>
      </Zoom>

      {!ready && (
        <Fade in>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: (theme) => theme.shadows[2]
            }}
            icon={<span>⚠️</span>}
          >
            {tr(
              "common:loadingTranslations",
              "Çeviriler henüz yüklenmedi, geçici metinler gösteriliyor."
            )}
          </Alert>
        </Fade>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: (theme) => theme.shadows[8],
          },
        }}
      >
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

        <LocalizationValueLookupPanel
          locale={lang}
          query={manager.valueLookupQuery}
          onQueryChange={manager.setValueLookupQuery}
          results={manager.valueLookupResults}
          loading={manager.valueLookupLoading}
          selectedLangs={manager.selectedLangs}
          namespaceQuery={manager.namespaceQuery}
          languages={manager.languages}
          onSearch={() => void manager.searchByValue()}
          onClear={manager.clearValueLookup}
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
      </Paper>

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
