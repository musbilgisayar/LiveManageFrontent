"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LocalizationLanguageItem,
  LocalizationManagerToastState,
  LocalizationTranslationRow,
  LocalizationValueLookupResult,
} from "../types/LocalizationManager.types";
import {
  createLocalizationKeyBatch,
  getLocalizationLanguages,
  getTranslationsByNamespaceForCultures,
  searchLocalizationKeysByValue,
} from "../services/localizationManager.service";
import { groupTranslationsByKey } from "../utils/localizationManager.mapper";

type TranslateFn = (key: string, fallback: string) => string;

const DEFAULT_NAMESPACE_OPTIONS = [
  "common",
  "localization",
  "sidebar",
  "permissions",
  "validation",
  "property",
  "account",
  "profile",
  "users",
  "roles",
  "monitoring",
];

export function useLocalizationManager(tr: TranslateFn) {
  const mountedRef = useRef(false);

  const [languages, setLanguages] = useState<LocalizationLanguageItem[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [rows, setRows] = useState<LocalizationTranslationRow[]>([]);
  const [namespaceQuery, setNamespaceQuery] = useState("");
  const [namespaceOptions, setNamespaceOptions] = useState<string[]>(
    DEFAULT_NAMESPACE_OPTIONS
  );
  const [valueLookupQuery, setValueLookupQuery] = useState("");
  const [valueLookupResults, setValueLookupResults] = useState<
    LocalizationValueLookupResult[]
  >([]);
  const [valueLookupLoading, setValueLookupLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<LocalizationManagerToastState>({
    open: false,
    msg: "",
    sev: "info",
  });

  const cultureOptions = useMemo(
    () => Array.from(new Set(languages.map((item) => item.cultureCode))),
    [languages]
  );

  const closeToast = useCallback(() => {
    setToast((current) => ({ ...current, open: false }));
  }, []);

  const loadLanguages = useCallback(async () => {
    try {
      const result = await getLocalizationLanguages();
      if (!mountedRef.current) return;

      setLanguages(result);

      const defaults = result
        .filter((item) => item.isDefault)
        .map((item) => item.cultureCode);

      if (defaults.length > 0) {
        setSelectedLangs(defaults);
      } else if (result.length > 0) {
        setSelectedLangs([result[0].cultureCode]);
      }
    } catch (error) {
      if (!mountedRef.current) return;

      setToast({
        open: true,
        sev: "error",
        msg:
          error instanceof Error
            ? error.message
            : tr(
                "localization:messages.languagesLoadFailed",
                "Dil listesi alınamadı."
              ),
      });
    }
  }, [tr]);

  const refresh = useCallback(
    async (namespaceArg?: string, culturesArg?: string[]) => {
      const namespace = (namespaceArg ?? namespaceQuery).trim();
      const cultures = culturesArg ?? selectedLangs;

      if (!namespace) {
        setRows([]);
        setToast({
          open: true,
          sev: "warning",
          msg: tr(
            "localization:messages.namespaceRequired",
            "Lütfen önce bir namespace seçin."
          ),
        });
        return;
      }

      if (cultures.length === 0) {
        setRows([]);
        setToast({
          open: true,
          sev: "warning",
          msg: tr(
            "localization:messages.cultureRequired",
            "Lütfen en az bir dil seçin."
          ),
        });
        return;
      }

      setLoading(true);

      try {
        const result = await getTranslationsByNamespaceForCultures(
          namespace,
          cultures
        );

        if (!mountedRef.current) return;

        setRows(groupTranslationsByKey(result));
      } catch (error) {
        if (!mountedRef.current) return;

        setRows([]);
        setToast({
          open: true,
          sev: "error",
          msg:
            error instanceof Error
              ? error.message
              : tr(
                  "localization:messages.namespaceLoadFailed",
                  "Namespace verileri yüklenemedi."
                ),
        });
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [namespaceQuery, selectedLangs, tr]
  );

  const createKey = useCallback(
    async (namespace: string, key: string, values: Record<string, string>) => {
      const trimmedNamespace = namespace.trim();
      const trimmedKey = key.trim();

      if (!trimmedNamespace || !trimmedKey) {
        setToast({
          open: true,
          sev: "warning",
          msg: tr(
            "localization:messages.namespaceAndKeyRequired",
            "Namespace ve key zorunludur."
          ),
        });
        return;
      }

      setSaving(true);

      try {
        await createLocalizationKeyBatch({
          namespace: trimmedNamespace,
          key: trimmedKey,
          values,
          reason: "Create new localization key from manager UI",
        });

        setNamespaceOptions((current) =>
          current.includes(trimmedNamespace)
            ? current
            : [...current, trimmedNamespace].sort()
        );

        setToast({
          open: true,
          sev: "success",
          msg: tr(
            "localization:messages.newKeyCreated",
            "Yeni anahtar oluşturuldu."
          ),
        });

        await refresh(trimmedNamespace, selectedLangs);
      } catch (error) {
        setToast({
          open: true,
          sev: "error",
          msg:
            error instanceof Error
              ? error.message
              : tr(
                  "localization:messages.newKeyCreateFailed",
                  "Yeni anahtar oluşturulamadı."
                ),
        });
      } finally {
        if (mountedRef.current) {
          setSaving(false);
        }
      }
    },
    [refresh, selectedLangs, tr]
  );

  const searchByValue = useCallback(
    async (textArg?: string) => {
      const text = (textArg ?? valueLookupQuery).trim();

      if (!text) {
        setValueLookupResults([]);
        setToast({
          open: true,
          sev: "warning",
          msg: tr(
            "localization:valueLookup.messages.queryRequired",
            "Lütfen aranacak açıklama metnini girin."
          ),
        });
        return;
      }

      if (selectedLangs.length === 0) {
        setValueLookupResults([]);
        setToast({
          open: true,
          sev: "warning",
          msg: tr(
            "localization:messages.cultureRequired",
            "Lütfen en az bir dil seçin."
          ),
        });
        return;
      }

      setValueLookupLoading(true);

      try {
        const result = await searchLocalizationKeysByValue({
          text,
          cultures: selectedLangs,
          namespace: namespaceQuery,
        });

        if (!mountedRef.current) return;

        setValueLookupResults(result);

        if (result.length === 0) {
          setToast({
            open: true,
            sev: "info",
            msg: tr(
              "localization:valueLookup.messages.noResults",
              "Bu açıklamaya uygun localization key bulunamadı."
            ),
          });
        }
      } catch (error) {
        if (!mountedRef.current) return;

        setValueLookupResults([]);
        setToast({
          open: true,
          sev: "error",
          msg:
            error instanceof Error
              ? error.message
              : tr(
                  "localization:valueLookup.messages.searchFailed",
                  "Açıklamaya göre key araması tamamlanamadı."
                ),
        });
      } finally {
        if (mountedRef.current) {
          setValueLookupLoading(false);
        }
      }
    },
    [namespaceQuery, selectedLangs, tr, valueLookupQuery]
  );

  const clearValueLookup = useCallback(() => {
    setValueLookupQuery("");
    setValueLookupResults([]);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadLanguages();

    return () => {
      mountedRef.current = false;
    };
  }, [loadLanguages]);

  return {
    languages,
    selectedLangs,
    setSelectedLangs,
    rows,
    namespaceQuery,
    setNamespaceQuery,
    namespaceOptions,
    valueLookupQuery,
    setValueLookupQuery,
    valueLookupResults,
    valueLookupLoading,
    cultureOptions,
    loading,
    saving,
    toast,
    closeToast,
    refresh,
    createKey,
    searchByValue,
    clearValueLookup,
  };
}
