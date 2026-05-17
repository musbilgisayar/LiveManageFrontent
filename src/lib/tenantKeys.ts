export const DEFAULT_TENANT_KEY = "livemanage";

export const ALLOWED_TENANT_KEYS = [
  DEFAULT_TENANT_KEY,
  "system",
  "kulturtisch",
  "demo",
] as const;

export type AllowedTenantKey = (typeof ALLOWED_TENANT_KEYS)[number];

const ALLOWED_TENANT_KEY_SET = new Set<string>(ALLOWED_TENANT_KEYS);

export function normalizeTenantKey(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

export function isAllowedTenantKey(value?: string | null): boolean {
  return ALLOWED_TENANT_KEY_SET.has(normalizeTenantKey(value));
}

export function coerceTenantKey(
  value?: string | null,
  fallback: string = DEFAULT_TENANT_KEY
): string {
  const normalized = normalizeTenantKey(value);

  if (normalized === "default") {
    return DEFAULT_TENANT_KEY;
  }

  if (ALLOWED_TENANT_KEY_SET.has(normalized)) {
    return normalized;
  }

  const normalizedFallback = normalizeTenantKey(fallback);
  return ALLOWED_TENANT_KEY_SET.has(normalizedFallback)
    ? normalizedFallback
    : DEFAULT_TENANT_KEY;
}
