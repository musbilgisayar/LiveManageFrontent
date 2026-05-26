"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  normalizeCultures,
  type CultureUiItem,
} from "@/lib/i18n/normalizeCultures";

type CultureContextValue = {
  languages: CultureUiItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getByPrefix: (prefix: string) => CultureUiItem | undefined;
  getDefault: () => CultureUiItem | undefined;
};

const FALLBACK_LANGUAGES: CultureUiItem[] = [
  {
    cultureCode: "tr-TR",
    prefix: "tr",
    name: "Turkce",
    key: "culture:name.tr-TR",
    isDefault: true,
    flagUrl: "/images/flag/tr-TR.svg",
  },
  {
    cultureCode: "en-US",
    prefix: "en",
    name: "English",
    key: "culture:name.en-US",
    isDefault: false,
    flagUrl: "/images/flag/en-US.svg",
  },
];

const CultureContext = createContext<CultureContextValue | null>(null);
const inFlightCultureRequests = new Map<string, Promise<CultureUiItem[]>>();

function normalizeLocale(locale?: string) {
  const value = (locale ?? "tr").trim().toLowerCase();
  return value || "tr";
}

function toCulture(locale?: string) {
  const prefix = normalizeLocale(locale).split("-")[0];

  if (prefix === "tr") return "tr-TR";
  if (prefix === "en") return "en-US";
  if (prefix === "de") return "de-DE";
  if (prefix === "fr") return "fr-FR";
  if (prefix === "it") return "it-IT";
  if (prefix === "ar") return "ar-SA";

  return `${prefix}-${prefix.toUpperCase()}`;
}

async function readJsonIfPossible(res: Response): Promise<unknown | null> {
  const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  const text = await res.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function fetchCultureList(locale?: string): Promise<CultureUiItem[]> {
  const acceptCulture = toCulture(locale);
  const key = `culture-list:${acceptCulture}`;
  const existing = inFlightCultureRequests.get(key);

  if (existing) {
    return existing;
  }

  const promise = fetch("/api/v1.0/localization/languages", {
    headers: {
      accept: "application/json",
      "accept-language": acceptCulture,
    },
    credentials: "include",
    cache: "no-store",
  })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`culture-list http ${res.status}`);
      }

      const json = await readJsonIfPossible(res);
      const normalized = normalizeCultures(json);

      return normalized.length ? normalized : FALLBACK_LANGUAGES;
    })
    .finally(() => {
      inFlightCultureRequests.delete(key);
    });

  inFlightCultureRequests.set(key, promise);
  return promise;
}

export function CultureProvider({
  children,
  locale,
  initialLanguages,
}: {
  children: React.ReactNode;
  locale?: string;
  initialLanguages?: CultureUiItem[];
}) {
  const initial =
    initialLanguages && initialLanguages.length
      ? initialLanguages
      : FALLBACK_LANGUAGES;
  const hasInitialLanguages = Boolean(initialLanguages?.length);

  const [languages, setLanguages] = useState<CultureUiItem[]>(initial);
  const [isLoading, setIsLoading] = useState(!hasInitialLanguages);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextLanguages = await fetchCultureList(locale);
      setLanguages(nextLanguages);
    } catch (err: any) {
      setError(err?.message ?? "culture-list failed");
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    if (hasInitialLanguages) {
      return;
    }

    let active = true;

    setIsLoading(true);
    setError(null);

    fetchCultureList(locale)
      .then((nextLanguages) => {
        if (!active) return;
        setLanguages(nextLanguages);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message ?? "culture-list failed");
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [hasInitialLanguages, locale]);

  const value = useMemo<CultureContextValue>(() => {
    const getByPrefix = (prefix: string) => {
      const normalized = normalizeLocale(prefix).split("-")[0];
      return languages.find((item) => item.prefix === normalized);
    };

    const getDefault = () =>
      languages.find((item) => item.isDefault) ?? languages[0];

    return {
      languages,
      isLoading,
      error,
      refresh,
      getByPrefix,
      getDefault,
    };
  }, [error, isLoading, languages, refresh]);

  return (
    <CultureContext.Provider value={value}>{children}</CultureContext.Provider>
  );
}

export function useCulture() {
  const value = useContext(CultureContext);

  if (!value) {
    throw new Error("useCulture must be used within CultureProvider");
  }

  return value;
}
