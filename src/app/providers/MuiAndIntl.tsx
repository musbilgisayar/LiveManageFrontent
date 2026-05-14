// src/app/providers/MuiAndIntl.tsx
"use client";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import "dayjs/locale/tr";
import "dayjs/locale/en";
import "dayjs/locale/de";
import "dayjs/locale/ar";

type Props = {
  locale: string;
  children: React.ReactNode;
};

export default function MuiAndIntlProvider({
  locale,
  children,
}: Props) {
  const normalized =
    locale?.toLowerCase()?.split("-")[0] ?? "tr";

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={normalized}
    >
      {children}
    </LocalizationProvider>
  );
}