// FILE: src/lib/locale.ts
export const LOCALE_PREFIX_RE = /^\/[a-z]{2}(?:-[A-Za-z]{2})?(?=\/|$)/i;
export const toPrefix = (cultureCode: string) => cultureCode.split('-')[0].toLowerCase();
export const stripLocale = (pathname: string) => pathname.replace(LOCALE_PREFIX_RE, '') || '/';