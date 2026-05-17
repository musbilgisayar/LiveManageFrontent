export type MenuResult<T> = { data: T | null; error: string | null };

export type TopMenuItem = {
  title: string;
  href: string;
  tooltip?: string;
  icon?: string;
  badge?: string;
  isExternal?: boolean;
  isFeatureEnabled?: boolean;
  displayMode?: string;
  new?: boolean;
};

const cultureFromPrefix = (prefix: string): string => {
  switch ((prefix || "tr").split("-")[0].toLowerCase()) {
    case "en":
      return "en-US";
    case "de":
      return "de-DE";
    case "fr":
      return "fr-FR";
    case "it":
      return "it-IT";
    case "ar":
      return "ar-SA";
    case "tr":
    default:
      return "tr-TR";
  }
};

const asText = (value: unknown): string => {
  if (typeof value !== "string") return "";

  const text = value.trim();
  if (!text || text.toLowerCase() === "untitled") return "";

  return text;
};

const pickLocalizedText = (value: unknown, lang: string): string => {
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  const short = lang.split("-")[0].toLowerCase();
  const culture = cultureFromPrefix(short);

  return (
    asText(record[short]) ||
    asText(record[culture]) ||
    asText(record[short.toUpperCase()]) ||
    asText(record[culture.toLowerCase()]) ||
    asText(record.tr) ||
    asText(record["tr-TR"]) ||
    asText(record.en) ||
    asText(record["en-US"])
  );
};

const resolveMenuTitle = (item: any, lang: string): string => {
  return (
    asText(item?.title) ||
    asText(item?.text) ||
    asText(item?.label) ||
    asText(item?.name) ||
    asText(item?.displayName) ||
    asText(item?.menuTitle) ||
    asText(item?.localizedTitle) ||
    asText(item?.localizedName) ||
    pickLocalizedText(item?.title, lang) ||
    pickLocalizedText(item?.text, lang) ||
    pickLocalizedText(item?.label, lang) ||
    pickLocalizedText(item?.name, lang) ||
    pickLocalizedText(item?.displayName, lang) ||
    pickLocalizedText(item?.translations, lang) ||
    pickLocalizedText(item?.localizations, lang) ||
    asText(item?.key) ||
    asText(item?.code)
  );
};

function normalizeItems(arr: any[], lang: string): TopMenuItem[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((x) => ({
    title: resolveMenuTitle(x, lang),
    href: asText(x?.href) || asText(x?.url) || asText(x?.path) || "#",
    tooltip: asText(x?.tooltip) || undefined,
    icon: x?.icon ?? undefined,
    badge: x?.badge ?? undefined,
    isExternal: !!x?.isExternal,
    isFeatureEnabled: x?.isFeatureEnabled ?? undefined,
    displayMode: x?.displayMode ?? undefined,
    new: !!x?.new,
  }));
}

export async function fetchTopMenu(lang: string): Promise<MenuResult<TopMenuItem[]>> {
  try {
    const seg = (lang ?? "tr").split("-")[0].toLowerCase();
    const culture = cultureFromPrefix(seg);
    const res = await fetch(`/api/v1.0/menus/top`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "accept-language": culture,
      },
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);
    if (!json) return { data: null, error: "INVALID_RESPONSE" };
    if (!json.ok) return { data: null, error: `${json.error ?? "UNKNOWN"}:${json.status ?? ""}` };

    const items = normalizeItems(Array.isArray(json.data) ? json.data : [], seg);
    return { data: items, error: null };
  } catch (e: any) {
    return { data: null, error: e?.message ?? "FETCH_FAILED" };
  }
}
