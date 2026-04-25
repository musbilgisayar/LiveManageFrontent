// src/lib/i18n/server.ts
export type Dict = Record<string, string>;

export async function fetchDictSSR(lang: string, keys?: string[]): Promise<{ dict: Dict; etag?: string }> {
  const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/i18n/${encodeURIComponent(lang)}/dict`);
  if (keys?.length) url.searchParams.set("keys", keys.join(","));

  const res = await fetch(url, {
    method: "GET",
    headers: { accept: "application/json", "accept-language": lang },
    cache: "no-store",
  });

  if (res.status === 304) return { dict: {}, etag: res.headers.get("etag") ?? undefined };

  const json = await res.json().catch(() => null);
  const dict = json?.data ?? {};
  return { dict, etag: res.headers.get("etag") ?? undefined };
}
