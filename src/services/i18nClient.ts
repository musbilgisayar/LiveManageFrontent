// src/services/i18nClient.ts
import useSWR from "swr";

const fetcher = (url: string) => fetch(url, { headers: { accept: "application/json" } })
  .then(r => r.status === 304 ? { ok: true, data: {}, error: null } : r.json());

export function useDict(lang: string, keys?: string[]) {
  const qs = keys?.length ? `?keys=${encodeURIComponent(keys.join(","))}` : "";
  const { data, error, isLoading } = useSWR(`/api/i18n/${lang}/dict${qs}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5dk
  });
  return { dict: data?.data ?? {}, error: data?.error ?? error, isLoading };
}
