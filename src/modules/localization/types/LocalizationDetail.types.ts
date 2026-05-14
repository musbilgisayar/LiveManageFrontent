import type { LanguageItem } from "@/modules/localization/services/localizationService";

export type LocalizationDetailPageProps = {
  locale: string;
};

export type LocalizationValueMap = Record<string, string>;

export type LocalizationVersionMap = Record<string, string | null>;

export type LocalizationToastSeverity = "success" | "error" | "info" | "warning";

export type LocalizationToastState = {
  open: boolean;
  msg: string;
  sev: LocalizationToastSeverity;
};

export type LocalizationLanguageValueItem = {
  culture: string;
  value: string;
  version: string | null;
};

export type LocalizationCreateKeyState = {
  open: boolean;
  namespace: string;
  key: string;
  values: LocalizationValueMap;
};

export type LocalizationDetailLoadResult = {
  languages: LanguageItem[];
  values: LocalizationValueMap;
  versions: LocalizationVersionMap;
};