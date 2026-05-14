import { LocalizationTranslationRow } from "../types/LocalizationManager.types";

type BackendTranslationDto = {
  key?: string | null;
  culture?: string | null;
  cultureCode?: string | null;
  value?: string | null;
  version?: string | null;
  rowVersion?: string | null;
};

export function groupTranslationsByKey(
  items: BackendTranslationDto[]
): LocalizationTranslationRow[] {
  const map = new Map<string, LocalizationTranslationRow>();

  for (const item of items) {
    const key = item.key?.trim();
    const cultureCode = (item.cultureCode ?? item.culture)?.trim();

    if (!key || !cultureCode) continue;

    const shortCode = cultureCode.includes("-")
      ? cultureCode.split("-")[0]
      : cultureCode;

    const row =
      map.get(key) ??
      ({
        id: key,
        key,
        values: {},
        versions: {},
      } satisfies LocalizationTranslationRow);

    row.values[cultureCode] = item.value ?? "";
    row.versions[cultureCode] = item.version ?? item.rowVersion ?? null;

    if (!(shortCode in row.values)) {
      row.values[shortCode] = item.value ?? "";
      row.versions[shortCode] = item.version ?? item.rowVersion ?? null;
    }

    map.set(key, row);
  }

  return Array.from(map.values());
}