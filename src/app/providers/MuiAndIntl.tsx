// src/app/providers/MuiAndIntl.tsx
"use client";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/tr";
import "dayjs/locale/en";
import "dayjs/locale/de";
import { useI18n } from "@/app/context/i18nContext";

export default function MuiAndIntlProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useI18n();
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang.toLowerCase()}>
      {children}
    </LocalizationProvider>
  );
}
export const nf = (lang: string, opts?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat(lang, opts ?? { maximumFractionDigits: 2 });

export const df = (lang: string, opts?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(lang, opts ?? { dateStyle: "medium" });

// Kullanım: [lang]/layout.tsx içinde <MuiAndIntlProvider> ile wrap edin.
