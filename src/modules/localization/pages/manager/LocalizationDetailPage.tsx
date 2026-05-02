//src/modules/localization/pages/manager/LocalizationDetailPage.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Toolbar,
  Typography,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Breadcrumb from "@/app/[locale]/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18nNs } from "@/app/context/i18nContext";
import {
  createNewKeyForAllLanguages,
  getLanguages,
  getTranslationDetail,
  prettyApiError,
  type LanguageItem,
} from "@/modules/localization/services/localizationService";

type LocalizationDetailPageProps = {
  locale: string;
  encodedKey: string;
};

type ValueMap = Record<string, string>;
type VersionMap = Record<string, string | null>;

export default function LocalizationDetailPage({
  locale,
  encodedKey,
}: LocalizationDetailPageProps) {
  const { t } = useI18nNs("localization");
  const router = useRouter();
  const searchParams = useSearchParams();

  const lang = (locale ?? "tr").toString();
  const fullKey = decodeURIComponent(encodedKey ?? "");
  const nsFromQuery = searchParams?.get("ns") || fullKey.split(":")[0] || "common";

  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [values, setValues] = useState<ValueMap>({});
  const [versions, setVersions] = useState<VersionMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    msg: "",
    sev: "info",
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [createNs, setCreateNs] = useState(nsFromQuery);
  const [createKey, setCreateKey] = useState("");
  const [createValues, setCreateValues] = useState<ValueMap>({});

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setCreateNs(nsFromQuery);
  }, [nsFromQuery]);

  useEffect(() => {
    (async () => {
      try {
        const langs = await getLanguages();
        if (!mountedRef.current) return;
        setLanguages(langs);
      } catch (error: any) {
        if (!mountedRef.current) return;
        setToast({
          open: true,
          msg:
            t("detailPage.toast.languagesLoadError") ||
            prettyApiError(error) ||
            "Dil listesi alınamadı.",
          sev: "error",
        });
      }
    })();
  }, [t]);

  useEffect(() => {
    if (!languages.length) return;

    (async () => {
      setLoading(true);

      try {
        const results = await Promise.all(
          languages.map(async (language) => {
            const item = await getTranslationDetail(
              nsFromQuery,
              fullKey,
              language.cultureCode
            );

            return {
              culture: language.cultureCode,
              value: item?.value ?? "",
              version: item?.version ?? null,
            };
          })
        );

        if (!mountedRef.current) return;

        const nextValues: ValueMap = {};
        const nextVersions: VersionMap = {};

        for (const item of results) {
          nextValues[item.culture] = item.value ?? "";
          nextVersions[item.culture] = item.version ?? null;
        }

        setValues(nextValues);
        setVersions(nextVersions);
      } catch (error: any) {
        if (!mountedRef.current) return;
        setToast({
          open: true,
          msg: prettyApiError(error),
          sev: "error",
        });
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    })();
  }, [languages, fullKey, nsFromQuery]);

  const handleValueChange = useCallback((culture: string, value: string) => {
    setValues((prev) => ({ ...prev, [culture]: value }));
  }, []);

  const handleSaveAll = useCallback(async () => {
    setSaving(true);

    try {
      const { upsertTranslation } = await import(
        "@/modules/localization/services/localizationService"
      );

      for (const language of languages) {
        const culture = language.cultureCode;
        const value = values[culture] ?? "";
        const expectedRowVersion = versions[culture] ?? null;

        try {
          await upsertTranslation(
            fullKey,
            culture,
            value,
            expectedRowVersion,
            nsFromQuery
          );
        } catch (error: any) {
          setToast({
            open: true,
            msg: `(${culture}) ${prettyApiError(error)}`,
            sev: "error",
          });
        }
      }

      const refreshed = await Promise.all(
        languages.map(async (language) => {
          const item = await getTranslationDetail(
            nsFromQuery,
            fullKey,
            language.cultureCode
          );

          return {
            culture: language.cultureCode,
            version: item?.version ?? null,
          };
        })
      );

      const nextVersions: VersionMap = {};
      for (const item of refreshed) {
        nextVersions[item.culture] = item.version ?? null;
      }
      setVersions(nextVersions);

      setToast({
        open: true,
        msg:
          t("detailPage.toast.savedAllLanguages") ||
          "Tüm diller için kaydedildi.",
        sev: "success",
      });
    } finally {
      setSaving(false);
    }
  }, [languages, values, versions, fullKey, nsFromQuery, t]);

  const handleCreateNewKey = useCallback(async () => {
    const ns = (createNs || "").trim();
    const key = (createKey || "").trim();

    if (!ns || !key) {
      setToast({
        open: true,
        msg:
          t("detailPage.toast.namespaceKeyRequired") ||
          "Namespace ve key zorunludur.",
        sev: "warning",
      });
      return;
    }

    setSaving(true);

    try {
      await createNewKeyForAllLanguages(ns, key, createValues, languages);

      setToast({
        open: true,
        msg:
          t("detailPage.toast.newKeyCreated") ||
          "Yeni anahtar oluşturuldu.",
        sev: "success",
      });

      setCreateOpen(false);
      setCreateKey("");
      setCreateValues({});
    } catch (error: any) {
      setToast({
        open: true,
        msg: prettyApiError(error),
        sev: "error",
      });
    } finally {
      setSaving(false);
    }
  }, [createKey, createNs, createValues, languages, t]);

  return (
    <Box>
      <Breadcrumb
        title={t("detailPage.breadcrumb.title") || "Çeviri Detay"}
        subtitle={
          t("detailPage.breadcrumb.subtitle") ||
          "Anahtar detayları ve tüm diller için değerler"
        }
        items={[
          {
            title: t("detailPage.breadcrumb.localization") || "Localization",
            to: `/${lang}/superadmin/localization`,
          },
          { title: t("detailPage.breadcrumb.detail") || "Detail" },
        ]}
      />

      <Toolbar
        disableGutters
        sx={{ mb: 2, gap: 2, flexWrap: "wrap", alignItems: "center" }}
      >
        <Button variant="outlined" onClick={() => router.back()}>
          {t("detailPage.actions.backToList") || "← Listeye Dön"}
        </Button>

        <Box sx={{ flex: 1 }} />

        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          {t("detailPage.actions.addNewKey") || "Yeni Anahtar Ekle"}
        </Button>
      </Toolbar>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t("detailPage.selectedKey.title") || "Seçili Anahtar"}
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label={t("detailPage.fields.namespace") || "Namespace"}
              value={nsFromQuery}
              size="small"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label={t("detailPage.fields.key") || "Key"}
              value={fullKey}
              size="small"
              InputProps={{ readOnly: true }}
              sx={{ flex: 1 }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6">
              {t("detailPage.allLanguages.title") || "Tüm Diller"}
            </Typography>

            <Button
              variant="contained"
              disabled={saving || loading}
              startIcon={saving ? <CircularProgress size={16} /> : undefined}
              onClick={handleSaveAll}
            >
              {t("detailPage.actions.saveAllLanguages") ||
                "Kaydet (Tüm Diller)"}
            </Button>
          </Stack>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2} divider={<Divider />}>
              {languages.map((language) => (
                <Stack
                  key={language.cultureCode}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems="center"
                >
                  <Box sx={{ width: 220, display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 20, marginRight: 8 }}>
                      {language.flagEmoji ?? "🏳️"}
                    </span>
                    <div>
                      <Typography variant="subtitle2">{language.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {language.cultureCode}
                        {language.isDefault
                          ? ` • ${
                              t("detailPage.defaultLanguageBadge") || "Varsayılan"
                            }`
                          : ""}
                      </Typography>
                    </div>
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    label={t("detailPage.fields.value") || "Value"}
                    value={values[language.cultureCode] ?? ""}
                    onChange={(e) =>
                      handleValueChange(language.cultureCode, e.target.value)
                    }
                  />
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t("newKeyDialog.title") || "Yeni Anahtar Ekle"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label={t("newKeyDialog.namespaceLabel") || "Namespace"}
                value={createNs}
                onChange={(e) => setCreateNs(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              />
              <TextField
                label={t("newKeyDialog.keyLabel") || "Key (ns olmadan)"}
                value={createKey}
                onChange={(e) => setCreateKey(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
            </Stack>

            <Typography variant="caption" color="text.secondary">
              {t("newKeyDialog.composedKeyLabel") || "Oluşacak tam anahtar:"}{" "}
              <b>
                {(createNs || "").trim()}:{(createKey || "").trim()}
              </b>
            </Typography>

            <Divider />

            <Typography variant="subtitle1">
              {t("newKeyDialog.valuesTitle") || "Değerler (Tüm Diller)"}
            </Typography>

            <Stack spacing={2} divider={<Divider />}>
              {languages.map((language) => (
                <Stack
                  key={language.cultureCode}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems="center"
                >
                  <Box sx={{ width: 220, display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 20, marginRight: 8 }}>
                      {language.flagEmoji ?? "🏳️"}
                    </span>
                    <div>
                      <Typography variant="subtitle2">{language.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {language.cultureCode}
                        {language.isDefault
                          ? ` • ${
                              t("newKeyDialog.defaultLanguageBadge") || "Varsayılan"
                            }`
                          : ""}
                      </Typography>
                    </div>
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    label={t("newKeyDialog.valueLabel") || "Value"}
                    value={createValues[language.cultureCode] ?? ""}
                    onChange={(e) =>
                      setCreateValues((prev) => ({
                        ...prev,
                        [language.cultureCode]: e.target.value,
                      }))
                    }
                  />
                </Stack>
              ))}
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>
            {t("common.cancel") || "İptal"}
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateNewKey}
            disabled={saving}
          >
            {saving
              ? t("common.saving") || "Kaydediliyor..."
              : t("newKeyDialog.createButton") || "Oluştur"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((current) => ({ ...current, open: false }))}
          severity={toast.sev}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}