import type {
  LocalizationValueMap,
  LocalizationVersionMap,
} from "@/modules/localization/types/LocalizationDetail.types";

export function decodeLocalizationKey(encodedKey: string | null | undefined) {
  return decodeURIComponent(encodedKey ?? "");
}

export function resolveLocalizationNamespace(
  queryNamespace: string | null | undefined,
  fullKey: string
) {
  return queryNamespace || fullKey.split(":")[0] || "common";
}

export function composeLocalizationKey(namespace: string, key: string) {
  return `${namespace.trim()}:${key.trim()}`;
}

export function buildValueMap(
  items: Array<{ culture: string; value: string | null | undefined }>
): LocalizationValueMap {
  const result: LocalizationValueMap = {};

  for (const item of items) {
    result[item.culture] = item.value ?? "";
  }

  return result;
}

export function buildVersionMap(
  items: Array<{ culture: string; version: string | null | undefined }>
): LocalizationVersionMap {
  const result: LocalizationVersionMap = {};

  for (const item of items) {
    result[item.culture] = item.version ?? null;
  }

  return result;
}