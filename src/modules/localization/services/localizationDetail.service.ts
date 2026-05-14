import {
  createNewKeyForAllLanguages,
  getLanguages,
  getTranslationDetail,
  prettyApiError,
  upsertTranslation,
  type LanguageItem,
} from "@/modules/localization/services/localizationService";

import type {
  LocalizationValueMap,
  LocalizationVersionMap,
} from "@/modules/localization/types/LocalizationDetail.types";

import {
  buildValueMap,
  buildVersionMap,
} from "@/modules/localization/utils/localizationDetail.utils";

export async function loadLocalizationDetail(
  namespace: string,
  fullKey: string
) {
  const languages = await getLanguages();

  const results = await Promise.all(
    languages.map(async (language) => {
      const item = await getTranslationDetail(
        namespace,
        fullKey,
        language.cultureCode
      );

      return {
        culture: language.cultureCode,
        value: item?.value ?? "",
        version: item?.version ?? null,
      };
    })
  );

  return {
    languages,
    values: buildValueMap(results),
    versions: buildVersionMap(results),
  };
}

export async function saveLocalizationDetailForAllLanguages(params: {
  namespace: string;
  fullKey: string;
  languages: LanguageItem[];
  values: LocalizationValueMap;
  versions: LocalizationVersionMap;
}) {
  const { namespace, fullKey, languages, values, versions } = params;

  for (const language of languages) {
    const culture = language.cultureCode;

    await upsertTranslation(
      fullKey,
      culture,
      values[culture] ?? "",
      versions[culture] ?? null,
      namespace
    );
  }

  const refreshed = await Promise.all(
    languages.map(async (language) => {
      const item = await getTranslationDetail(
        namespace,
        fullKey,
        language.cultureCode
      );

      return {
        culture: language.cultureCode,
        version: item?.version ?? null,
      };
    })
  );

  return buildVersionMap(refreshed);
}

export async function createLocalizationKeyForAllLanguages(params: {
  namespace: string;
  key: string;
  values: LocalizationValueMap;
  languages: LanguageItem[];
}) {
  const { namespace, key, values, languages } = params;

  await createNewKeyForAllLanguages(namespace, key, values, languages);
}

export { prettyApiError };