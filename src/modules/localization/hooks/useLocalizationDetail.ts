import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useI18nNs } from "@/app/context/i18nContext";

import type { LanguageItem } from "@/modules/localization/services/localizationService";
import type {
  LocalizationToastState,
  LocalizationValueMap,
  LocalizationVersionMap,
} from "@/modules/localization/types/LocalizationDetail.types";

import {
  createLocalizationKeyForAllLanguages,
  loadLocalizationDetail,
  prettyApiError,
  saveLocalizationDetailForAllLanguages,
} from "@/modules/localization/services/localizationDetail.service";

import {
  decodeLocalizationKey,
  resolveLocalizationNamespace,
} from "@/modules/localization/utils/localizationDetail.utils";

export function useLocalizationDetail() {
  const { t } = useI18nNs("localization");
  const searchParams = useSearchParams();

  const mountedRef = useRef(false);

const fullKey = useMemo(() => {
  return decodeLocalizationKey(searchParams?.get("key"));
}, [searchParams]);

  const namespace = useMemo(
    () => resolveLocalizationNamespace(searchParams?.get("ns"), fullKey),
    [searchParams, fullKey]
  );

  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [values, setValues] = useState<LocalizationValueMap>({});
  const [versions, setVersions] = useState<LocalizationVersionMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<LocalizationToastState>({
    open: false,
    msg: "",
    sev: "info",
  });

  const showToast = useCallback(
    (msg: string, sev: LocalizationToastState["sev"] = "info") => {
      setToast({ open: true, msg, sev });
    },
    []
  );

  const closeToast = useCallback(() => {
    setToast((current) => ({ ...current, open: false }));
  }, []);

  const loadDetail = useCallback(async () => {
    setLoading(true);

    try {
      const result = await loadLocalizationDetail(namespace, fullKey);

      if (!mountedRef.current) return;

      setLanguages(result.languages);
      setValues(result.values);
      setVersions(result.versions);
    } catch (error: any) {
      if (!mountedRef.current) return;

      showToast(
        prettyApiError(error) ||
          t("detail.toast.translationLoadError") ||
          "Çeviri detayı alınamadı.",
        "error"
      );
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [namespace, fullKey, showToast, t]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const handleValueChange = useCallback((culture: string, value: string) => {
    setValues((prev) => ({ ...prev, [culture]: value }));
  }, []);

  const saveAll = useCallback(async () => {
    setSaving(true);

    try {
      const nextVersions = await saveLocalizationDetailForAllLanguages({
        namespace,
        fullKey,
        languages,
        values,
        versions,
      });

      if (!mountedRef.current) return;

      setVersions(nextVersions);

      showToast(
        t("detail.toast.savedAllLanguages") ||
          "Tüm diller için kaydedildi.",
        "success"
      );
    } catch (error: any) {
      if (!mountedRef.current) return;

      showToast(prettyApiError(error), "error");
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [namespace, fullKey, languages, values, versions, showToast, t]);

  const createNewKey = useCallback(
    async (params: {
      namespace: string;
      key: string;
      values: LocalizationValueMap;
    }) => {
      const nextNamespace = params.namespace.trim();
      const nextKey = params.key.trim();

      if (!nextNamespace || !nextKey) {
        showToast(
          t("detail.toast.namespaceKeyRequired") ||
            "Namespace ve key zorunludur.",
          "warning"
        );
        return false;
      }

      setSaving(true);

      try {
        await createLocalizationKeyForAllLanguages({
          namespace: nextNamespace,
          key: nextKey,
          values: params.values,
          languages,
        });

        if (!mountedRef.current) return false;

        showToast(
          t("detail.toast.newKeyCreated") || "Yeni anahtar oluşturuldu.",
          "success"
        );

        return true;
      } catch (error: any) {
        if (!mountedRef.current) return false;

        showToast(prettyApiError(error), "error");
        return false;
      } finally {
        if (mountedRef.current) {
          setSaving(false);
        }
      }
    },
    [languages, showToast, t]
  );

  return {
    t,
    fullKey,
    namespace,
    languages,
    values,
    versions,
    loading,
    saving,
    toast,
    closeToast,
    handleValueChange,
    saveAll,
    createNewKey,
  };
}