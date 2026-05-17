export interface LocalizationLanguageItem {
  cultureCode: string;
  name: string;
  nativeName?: string | null;
  flagEmoji: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface LocalizationTranslationDto {
  namespace?: string | null;
  key: string;
  cultureCode: string;
  value?: string | null;
  version?: string | null;
}

export interface LocalizationTranslationRow {
  id: string;
  key: string;
  values: Record<string, string>;
  versions: Record<string, string | null>;
}

export interface LocalizationCreateKeyRequest {
  namespace: string;
  key: string;
  values: Record<string, string>;
  reason?: string | null;
}

export interface LocalizationValueLookupResult {
  id: string;
  namespace: string;
  key: string;
  fullKey: string;
  cultureCode: string;
  value: string;
}

export interface LocalizationManagerToastState {
  open: boolean;
  msg: string;
  sev: "success" | "error" | "info" | "warning";
}
