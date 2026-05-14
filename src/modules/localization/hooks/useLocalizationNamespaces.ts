import { useCallback, useEffect, useMemo, useState } from "react";
import { localizationNamespacesService } from "../services/localizationNamespaces.service";
import { LocalizationNamespaceRow } from "../types/LocalizationNamespace.types";

export function useLocalizationNamespaces(locale: string) {
  const [rows, setRows] = useState<LocalizationNamespaceRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchNamespaces = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const data = await localizationNamespacesService.getNamespaces(locale, signal);
        setRows(data);
      } catch (e: any) {
        if (e?.name === "AbortError") return;

        console.error("[useLocalizationNamespaces] fetch error:", e);
        setErrorMessage(localizationNamespacesService.prettyApiError(e));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [locale]
  );

  useEffect(() => {
    const controller = new AbortController();

    void fetchNamespaces(controller.signal);

    return () => controller.abort();
  }, [fetchNamespaces]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return rows;

    return rows.filter((row) =>
      row.name.toLowerCase().includes(normalizedQuery)
    );
  }, [query, rows]);

  return {
    rows,
    filteredRows,
    query,
    setQuery,
    loading,
    errorMessage,
    setErrorMessage,
    refresh: fetchNamespaces,
  };
}