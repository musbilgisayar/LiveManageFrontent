// src/app/context/i18nContext.tsx
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";

type Dict = Record<string, string>;

type I18nCtx = {
  lang: string;
  dict: Dict;
  t: (key: string, vars?: Record<string, string | number>) => string;
  ready: boolean;
  ensure: (namespaces: string[]) => void;
  hasNamespace: (ns: string) => boolean;
  hasNamespaces: (namespaces: string[]) => boolean;
  getRequestedNamespaces: () => string[];
};

const Ctx = createContext<I18nCtx | null>(null);

const DEBUG = process.env.NODE_ENV !== "production";
const missingKeyWarnings = new Set<string>();
const ambiguousKeyWarnings = new Set<string>();

function now(): string {
  return new Date().toLocaleString("tr-TR", { hour12: false });
}

function log(...args: unknown[]) {
  if (!DEBUG) return;
  console.log(`🌍 [I18nProvider][${now()}]`, ...args);
}

function warn(...args: unknown[]) {
  if (!DEBUG) return;
  console.warn(`⚠️ [I18nProvider][${now()}]`, ...args);
}

function toShort(s?: string): string {
  return (s ?? "tr").split("-")[0].toLowerCase();
}

function formatICU(
  input: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return input;
  return input.replace(/\{(\w+)\}/g, (_, key) =>
    String(vars[key] ?? `{${key}}`)
  );
}

function deepFlatten(obj: unknown, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};

  if (obj == null) return out;

  if (Array.isArray(obj)) {
    obj.forEach((value, index) => {
      const nextKey = prefix ? `${prefix}.${index}` : String(index);
      if (value && typeof value === "object") {
        Object.assign(out, deepFlatten(value, nextKey));
      } else if (value != null) {
        out[nextKey] = String(value);
      }
    });
    return out;
  }

  if (typeof obj === "object") {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const nextKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object") {
        Object.assign(out, deepFlatten(value, nextKey));
      } else if (value != null) {
        out[nextKey] = String(value);
      }
    }
  }

  return out;
}

function toDotKey(key: string): string {
  if (!key.includes(":")) return key;
  return key.replace(":", ".");
}

function toColonKey(key: string): string {
  if (key.includes(":")) return key;
  const firstDot = key.indexOf(".");
  if (firstDot < 0) return key;
  return `${key.slice(0, firstDot)}:${key.slice(firstDot + 1)}`;
}

function normalizeDict(input: unknown): Dict {
  let source: unknown = input;

  if (
    source &&
    typeof source === "object" &&
    !Array.isArray(source) &&
    "data" in source
  ) {
    const maybeEnvelope = source as Record<string, unknown>;
    if (
      maybeEnvelope.data &&
      typeof maybeEnvelope.data === "object" &&
      !Array.isArray(maybeEnvelope.data)
    ) {
      source = maybeEnvelope.data;
    }
  }

  const flat = deepFlatten(source);
  const out: Dict = {};

  for (const [key, value] of Object.entries(flat)) {
    const str = String(value);
    out[key] = str;
    out[toDotKey(key)] = str;
    out[toColonKey(key)] = str;
  }

  return out;
}

function mergeDict(base: Dict, incoming: Dict): Dict {
  if (Object.keys(incoming).length === 0) return base;
  return { ...base, ...incoming };
}

function extractNamespacesFromDict(dict: Dict): Set<string> {
  const namespaces = new Set<string>();

  for (const key of Object.keys(dict)) {
    const colonIdx = key.indexOf(":");
    const dotIdx = key.indexOf(".");

    if (colonIdx > 0 && (dotIdx < 0 || colonIdx < dotIdx)) {
      namespaces.add(key.slice(0, colonIdx));
      continue;
    }

    if (dotIdx > 0) {
      namespaces.add(key.slice(0, dotIdx));
    }
  }

  return namespaces;
}

function dictHasNamespace(dict: Dict, ns: string): boolean {
  const clean = ns.trim();
  if (!clean) return false;

  const prefixColon = `${clean}:`;
  const prefixDot = `${clean}.`;

  for (const key of Object.keys(dict)) {
    if (key.startsWith(prefixColon) || key.startsWith(prefixDot)) {
      return true;
    }
  }

  return false;
}

function candidateKeys(key: string): string[] {
  const clean = key.trim();
  if (!clean) return [];

  const out = new Set<string>();
  out.add(clean);
  out.add(toDotKey(clean));
  out.add(toColonKey(clean));

  return Array.from(out);
}

function findTranslation(
  dict: Dict,
  key: string,
  vars?: Record<string, string | number>
): string | null {
  for (const candidate of candidateKeys(key)) {
    const raw = dict[candidate];
    if (raw != null) {
      return formatICU(String(raw), vars);
    }
  }

  return null;
}

function namespaceKeyCandidates(ns: string, key: string): string[] {
  const cleanNs = ns.trim();
  const cleanKey = key.trim();
  if (!cleanNs || !cleanKey) return [];
  if (cleanKey.startsWith(`${cleanNs}:`) || cleanKey.startsWith(`${cleanNs}.`)) {
    return candidateKeys(cleanKey);
  }

  return candidateKeys(`${cleanNs}:${cleanKey}`);
}

function findScopedTranslation(params: {
  dict: Dict;
  key: string;
  namespaces: string[];
  vars?: Record<string, string | number>;
  lang: string;
}): string | null {
  const { dict, key, namespaces, vars, lang } = params;
  const clean = key.trim();
  if (!clean) return "";

  const direct = findTranslation(dict, clean, vars);
  if (direct != null) {
    return direct;
  }

  if (clean.includes(":") || namespaces.length === 0) {
    return null;
  }

  const matches: Array<{ ns: string; value: string }> = [];

  for (const ns of namespaces) {
    for (const candidate of namespaceKeyCandidates(ns, clean)) {
      const raw = dict[candidate];
      if (raw != null) {
        matches.push({ ns, value: formatICU(String(raw), vars) });
        break;
      }
    }
  }

  if (matches.length > 1 && DEBUG) {
    const warningKey = `${lang}|${clean}|${namespaces.join("|")}`;
    if (!ambiguousKeyWarnings.has(warningKey)) {
      ambiguousKeyWarnings.add(warningKey);
      warn("Birden fazla namespace aynı scoped key'i sağlıyor", {
        lang,
        key: clean,
        namespaces: matches.map((match) => match.ns),
        selectedNamespace: matches[0]?.ns,
      });
    }
  }

  return matches[0]?.value ?? null;
}

function normalizeNamespaces(namespaces: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const item of namespaces) {
    const clean = item?.trim();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    out.push(clean);
  }

  return out;
}

async function readJsonIfPossible(response: Response): Promise<any | null> {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

type ProviderProps = {
  lang?: string;
  dict?: Dict | Record<string, unknown>;
  children: React.ReactNode;
};

export function I18nProvider({
  lang: langProp,
  dict: dictProp,
  children,
}: ProviderProps) {
  const params = useParams() as { lang?: string; locale?: string };

  const effectiveLang = useMemo(
    () => toShort(langProp ?? params?.lang ?? params?.locale ?? "tr"),
    [langProp, params?.lang, params?.locale]
  );

  const normalizedInitialDict = useMemo(
    () => normalizeDict(dictProp),
    [dictProp]
  );

  const initialLoadedNamespaces = useMemo(
    () => extractNamespacesFromDict(normalizedInitialDict),
    [normalizedInitialDict]
  );

  const [dict, setDict] = useState<Dict>(normalizedInitialDict);
  const [requestedNamespaces, setRequestedNamespaces] = useState<Set<string>>(
    () => new Set(Array.from(initialLoadedNamespaces))
  );
  const [loadedNamespaces, setLoadedNamespaces] = useState<Set<string>>(
    () => new Set(Array.from(initialLoadedNamespaces))
  );

  const dictRef = useRef<Dict>(normalizedInitialDict);
  const inFlightRef = useRef<Set<string>>(new Set());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const requestVersionRef = useRef(0);
  const previousLangRef = useRef(effectiveLang);

  useEffect(() => {
    dictRef.current = dict;
  }, [dict]);

  useEffect(() => {
    const langChanged = previousLangRef.current !== effectiveLang;
    const nextInitialNamespaces = extractNamespacesFromDict(normalizedInitialDict);

    if (langChanged) {
      log("🌐 Dil değişti, i18n state resetleniyor", {
        from: previousLangRef.current,
        to: effectiveLang,
      });

      previousLangRef.current = effectiveLang;
      requestVersionRef.current += 1;

      for (const controller of abortControllersRef.current.values()) {
        controller.abort();
      }

      abortControllersRef.current.clear();
      inFlightRef.current.clear();
    }

    setDict(normalizedInitialDict);
    dictRef.current = normalizedInitialDict;
    setLoadedNamespaces(new Set(Array.from(nextInitialNamespaces)));
    setRequestedNamespaces((prev) => {
      const next = new Set(Array.from(nextInitialNamespaces));
      for (const ns of prev) {
        next.add(ns);
      }
      return next;
    });
  }, [effectiveLang, normalizedInitialDict]);
 
  const hasNamespace = useCallback(
  (ns: string): boolean => {
    const clean = ns.trim();
    if (!clean) return false;
    return loadedNamespaces.has(clean);
  },
  [loadedNamespaces]
);

const hasNamespaces = useCallback(
  (namespaces: string[]): boolean => {
    return normalizeNamespaces(namespaces).every((ns) =>
      loadedNamespaces.has(ns)
    );
  },
  [loadedNamespaces]
);

  const ensure = useCallback(
    (namespaces: string[]) => {
      const clean = normalizeNamespaces(namespaces);
      if (clean.length === 0) return;

      const missing = clean.filter((ns) => !dictHasNamespace(dictRef.current, ns));
      if (missing.length === 0) {
        return;
      }

      setRequestedNamespaces((prev) => {
        let changed = false;
        const next = new Set(prev);

        for (const ns of missing) {
          if (!next.has(ns)) {
            next.add(ns);
            changed = true;
          }
        }

        if (!changed) {
          return prev;
        }

        log("➕ Namespace ensure edildi", {
          lang: effectiveLang,
          requested: missing,
          requestedAfter: Array.from(next).sort(),
        });

        return next;
      });
    },
    [effectiveLang]
  );

  const requestedKey = useMemo(
    () => Array.from(requestedNamespaces).sort().join(","),
    [requestedNamespaces]
  );

  useEffect(() => {
    const requested = Array.from(requestedNamespaces).sort();

    const missing = requested.filter((ns) => {
      const alreadyInDict = dictHasNamespace(dictRef.current, ns);
      const inFlight = inFlightRef.current.has(ns);
      return !alreadyInDict && !inFlight;
    });

    if (missing.length === 0) {
      return;
    }

    const currentVersion = requestVersionRef.current;

    missing.forEach((ns) => {
      const controller = new AbortController();
      const url = `/api/i18n/${effectiveLang}/dict?ns=${encodeURIComponent(ns)}`;

      inFlightRef.current.add(ns);
      abortControllersRef.current.set(ns, controller);

      log("🌐 Namespace fetch başlıyor", {
        lang: effectiveLang,
        ns,
        url,
      });

      void (async () => {
        try {
          const response = await fetch(url, {
            method: "GET",
            headers: { accept: "application/json" },
            cache: "no-store",
            signal: controller.signal,
          });

          const json = await readJsonIfPossible(response);

          if (controller.signal.aborted) {
            log("🛑 Fetch abort edildi", { lang: effectiveLang, ns });
            return;
          }

          if (currentVersion !== requestVersionRef.current) {
            log("⏭️ Eski fetch sonucu yok sayıldı", {
              lang: effectiveLang,
              ns,
              fetchVersion: currentVersion,
              currentVersion: requestVersionRef.current,
            });
            return;
          }

          log("📨 Namespace fetch response alındı", {
            lang: effectiveLang,
            ns,
            status: response.status,
            ok: response.ok,
          });

          if (!response.ok || json?.ok === false) {
            warn("Namespace fetch başarısız", {
              lang: effectiveLang,
              ns,
              status: response.status,
              error: json?.error,
              detail: json?.detail,
            });
            return;
          }

          const incoming = normalizeDict(json?.data ?? {});
          const incomingCount = Object.keys(incoming).length;
          const incomingNamespaces = extractNamespacesFromDict(incoming);

          log("✅ Namespace fetch başarılı", {
            lang: effectiveLang,
            ns,
            incomingKeyCount: incomingCount,
            incomingNamespaces: Array.from(incomingNamespaces).sort(),
          });

          if (incomingCount === 0) {
            warn("⚠️ Namespace fetch boş döndü", {
              lang: effectiveLang,
              ns,
            });
            return;
          }

          setDict((prev) => {
            const next = mergeDict(prev, incoming);
            dictRef.current = next;
            return next;
          });

          setLoadedNamespaces((prev) => {
            const next = new Set(prev);
            for (const incomingNs of incomingNamespaces) {
              if (dictHasNamespace(incoming, incomingNs)) {
                next.add(incomingNs);
              }
            }
            return next;
          });
        } catch (error) {
          if (controller.signal.aborted) {
            log("🛑 Fetch iptal edildi", { lang: effectiveLang, ns });
            return;
          }

          warn("❌ Namespace fetch exception", {
            lang: effectiveLang,
            ns,
            error: error instanceof Error ? error.message : String(error),
          });
        } finally {
          inFlightRef.current.delete(ns);
          abortControllersRef.current.delete(ns);
        }
      })();
    });

    return () => {
      for (const ns of missing) {
        const controller = abortControllersRef.current.get(ns);
        if (controller) {
          controller.abort();
          abortControllersRef.current.delete(ns);
          inFlightRef.current.delete(ns);
        }
      }
    };
  }, [effectiveLang, requestedKey, requestedNamespaces]);

  // 🔥 GÜNCELLENEN t() FONKSİYONU
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      if (!key) return "";

      // 1. Direct lookup - full key ile ara
      let translated = findTranslation(dict, key, vars);
      if (translated != null) {
        return translated;
      }

      // 2. Eğer key'de namespace yoksa, aktif namespace'ler ile dene
      if (!key.includes(":")) {
        const activeNamespaces = Array.from(loadedNamespaces);
        
        for (const ns of activeNamespaces) {
          const fullKey = `${ns}:${key}`;
          translated = findTranslation(dict, fullKey, vars);
          if (translated != null) {
            return translated;
          }
        }
      }

      // 3. Fallback - FULL KEY formatında
      let fallbackKey = key;
      
      // Eğer key'de namespace yoksa ve loadedNamespaces varsa, ilk namespace'i kullan
      if (!key.includes(":") && loadedNamespaces.size > 0) {
        const firstNamespace = Array.from(loadedNamespaces)[0];
        fallbackKey = `${firstNamespace}:${key}`;
      }

      // DEBUG: Eksik key warning'ini zenginleştir
      if (DEBUG) {
        const warningKey = `${effectiveLang}|${key}`;
        if (!missingKeyWarnings.has(warningKey)) {
          missingKeyWarnings.add(warningKey);
          warn("Eksik çeviri anahtarı", {
            lang: effectiveLang,
            originalKey: key,
            fallbackKey,
            availableNamespaces: Array.from(loadedNamespaces),
            suggestion: loadedNamespaces.size > 0 
              ? `Try: ${Array.from(loadedNamespaces)[0]}:${key}`
              : "No active namespaces found",
          });
        }
      }

      return `[${fallbackKey}]`;
    },
    [dict, effectiveLang, loadedNamespaces] // loadedNamespaces dependency eklendi
  );

 const providerReady = useMemo(() => {
  const requested = Array.from(requestedNamespaces);
  return requested.every((ns) => loadedNamespaces.has(ns));
}, [loadedNamespaces, requestedNamespaces]);

  const getRequestedNamespaces = useCallback(() => {
    return Array.from(requestedNamespaces).sort();
  }, [requestedNamespaces]);

  const value = useMemo<I18nCtx>(
    () => ({
      lang: effectiveLang,
      dict,
      t,
      ready: providerReady,
      ensure,
      hasNamespace,
      hasNamespaces,
      getRequestedNamespaces,
    }),
    [
      effectiveLang,
      dict,
      t,
      providerReady,
      ensure,
      hasNamespace,
      hasNamespaces,
      getRequestedNamespaces,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(namespaces?: string | string[]) {
  const ctx = useContext(Ctx);

  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  const depKey = useMemo(() => {
    const raw = Array.isArray(namespaces)
      ? namespaces
      : namespaces
        ? [namespaces]
        : [];

    return normalizeNamespaces(raw).join("|");
  }, [namespaces]);

  const normalizedNamespaces = useMemo(() => {
    return depKey ? depKey.split("|").filter(Boolean) : [];
  }, [depKey]);

  useEffect(() => {
    if (normalizedNamespaces.length === 0) {
      return;
    }

    ctx.ensure(normalizedNamespaces);
  }, [ctx.ensure, depKey]);

  const ready = useMemo(() => {
    if (normalizedNamespaces.length === 0) return ctx.ready;
    return normalizedNamespaces.every((ns) => ctx.hasNamespace(ns));
  }, [ctx, depKey, normalizedNamespaces]);

  const scopedT = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      if (!key) return "";

      const translated = findScopedTranslation({
        dict: ctx.dict,
        key,
        namespaces: normalizedNamespaces,
        vars,
        lang: ctx.lang,
      });

      if (translated != null) {
        return translated;
      }

      return ctx.t(key, vars);
    },
    [ctx, depKey, normalizedNamespaces]
  );

  return useMemo(
    () => ({
      ...ctx,
      t: scopedT,
      ready,
    }),
    [ctx, scopedT, ready]
  );
}

export function useI18nNs(namespaces: string | string[]) {
  return useI18n(namespaces);
}
