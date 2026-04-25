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

function normalizeItems(arr: any[]): TopMenuItem[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((x) => ({
    title: (x?.title ?? x?.text ?? "") as string,
    href: (x?.href ?? x?.url ?? "#") as string,
    tooltip: x?.tooltip ?? undefined,
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
    const res = await fetch(`/api/v1.0/menus/top`, {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);
    if (!json) return { data: null, error: "INVALID_RESPONSE" };
    if (!json.ok) return { data: null, error: `${json.error ?? "UNKNOWN"}:${json.status ?? ""}` };

    const items = normalizeItems(Array.isArray(json.data) ? json.data : []);
    return { data: items, error: null };
  } catch (e: any) {
    return { data: null, error: e?.message ?? "FETCH_FAILED" };
  }
}
