import {
  LocalizationCreateKeyRequest,
  LocalizationLanguageItem,
  LocalizationTranslationDto,
} from "../types/LocalizationManager.types";

async function readJson<T>(res: Response): Promise<T> {
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      payload?.userMessage ||
      payload?.message ||
      payload?.error ||
      `HTTP ${res.status}`;

    throw new Error(message);
  }

  return payload as T;
}

export async function getLocalizationLanguages(): Promise<
  LocalizationLanguageItem[]
> {
  const res = await fetch("/api/v1.0/localization/languages", {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  const payload = await readJson<any>(res);
  return payload?.data?.data ?? payload?.data ?? payload ?? [];
}

export async function getTranslationsByNamespaceForCultures(
  namespace: string,
  cultures: string[]
): Promise<LocalizationTranslationDto[]> {
  const searchParams = new URLSearchParams();
  searchParams.set("namespace", namespace);

  for (const culture of cultures) {
    searchParams.append("cultures", culture);
  }

  const res = await fetch(
    `/api/v1.0/localization/manager/search?${searchParams.toString()}`,
    {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
    }
  );

  const payload = await readJson<any>(res);

  const items = payload?.data?.data ?? payload?.data ?? payload ?? [];

  console.log("[LocalizationManager] requested cultures:", cultures);
console.log("[LocalizationManager] response items:", items);
console.log(
  "[LocalizationManager] response cultures:",
  items.map((x: any) => x.cultureCode ?? x.culture ?? x.CultureCode ?? x.Culture)
);
  return items.map((item: any) => ({
    ...item,
    key: item.key ?? item.Key,
    value: item.value ?? item.Value ?? "",
    cultureCode:
      item.cultureCode ??
      item.culture ??
      item.CultureCode ??
      item.Culture ??
      "",
    culture:
      item.culture ??
      item.cultureCode ??
      item.Culture ??
      item.CultureCode ??
      "",
    flagEmoji: item.flagEmoji ?? "🏳️",
  }));
}

export async function createLocalizationKeyBatch(
  request: LocalizationCreateKeyRequest
): Promise<void> {
  const res = await fetch("/api/v1.0/localization/manager/upsert-batch", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
  });

  await readJson(res);
}