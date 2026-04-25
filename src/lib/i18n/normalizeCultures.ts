export type CultureRaw =
  | string
  | {
      cultureCode?: string;
      name?: string;
      isDefault?: boolean;
    };

export type CultureUiItem = {
  cultureCode: string;   // "tr-TR"
  prefix: string;        // "tr"
  name: string;          // "Türkçe" / fallback
  key?: string;          // "culture:name.tr-TR"
  isDefault: boolean;
  flagUrl: string;       // "/images/flag/tr-TR.svg"
};

const toPrefix = (c: string) => (c || "tr").split("-")[0].toLowerCase();
const flagUrl = (cultureCode: string) => `/images/flag/${cultureCode}.svg`;

const isBracket = (s?: string) => !!s && s.length >= 3 && s.startsWith("[") && s.endsWith("]");
const unbracket = (s: string) => s.slice(1, -1).trim();

const niceNameByCulture = (cultureCode: string) => {
  const map: Record<string, string> = {
    "tr-TR": "Türkçe",
    "de-DE": "Deutsch",
    "en-US": "English",
    "fr-FR": "Français",
    "it-IT": "Italiano",
    "ar-SA": "العربية",
    "ru-RU": "Русский",
    "es-ES": "Español",
  };
  return map[cultureCode] || cultureCode;
};

// "culture:name.tr-TR" -> true
const looksLikeMissingTranslation = (s: string) => {
  // Senin localizer bulamayınca "[...]" döndürüyor, biz zaten bracket'tan çıkarıyoruz.
  // Bazı sistemler direkt "culture:name.tr-TR" döndürebilir:
  return s.includes(":") && s.includes(".") && s.toLowerCase().includes("culture:");
};

export function normalizeCultures(raw: any): CultureUiItem[] {
  const data: any[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.items)
    ? raw.items
    : [];

  if (!data.length) return [];

  const items = data
    .map((x: CultureRaw): CultureUiItem | null => {
      // string[] olasılığı
      if (typeof x === "string") {
        const cultureCode = x.trim();
        if (!cultureCode) return null;

        const key = `culture:name.${cultureCode}`;
        return {
          cultureCode,
          prefix: toPrefix(cultureCode),
          name: niceNameByCulture(cultureCode),
          key,
          isDefault: cultureCode.toLowerCase() === "tr-tr",
          flagUrl: flagUrl(cultureCode),
        };
      }

      const cultureCode = (x?.cultureCode || "").trim();
      if (!cultureCode) return null;

      let name = (x?.name || "").trim();
      let key: string | undefined;

      // "[culture:name.tr-TR]" => key
      if (isBracket(name)) {
        key = unbracket(name);
        name = "";
      }

      // bazen bracket yok ama gene key dönmüş olabilir
      if (name && looksLikeMissingTranslation(name)) {
        key = name;
        name = "";
      }

      // fallback name
      if (!name) name = niceNameByCulture(cultureCode);

      return {
        cultureCode,
        prefix: toPrefix(cultureCode),
        name,
        key: key ?? `culture:name.${cultureCode}`,
        isDefault: Boolean(x?.isDefault),
        flagUrl: flagUrl(cultureCode),
      };
    })
    .filter(Boolean) as CultureUiItem[];

  // default yoksa tr-TR default
  if (!items.some((i) => i.isDefault)) {
    const tr = items.find((i) => i.cultureCode.toLowerCase() === "tr-tr");
    if (tr) tr.isDefault = true;
  }

  items.sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return a.name.localeCompare(b.name);
  });

  return items;
}