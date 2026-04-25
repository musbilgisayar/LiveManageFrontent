//src/app/[locale]/(DashboardLayout)/layout/vertical/header/QuickLinks.tsx
"use client";

import { Typography, Stack } from "@mui/material";
import * as dropdownData from "./data";
import Link from "next/link";
import { useI18nNs } from "@/app/context/i18nContext";

const QuickLinks = () => {
 
  const { t, ready } = useI18nNs(["header"]);

//if (!ready) return null;

  return (
    <>
      <Typography variant="h5">
        {t("header:pages.quickLinks", { defaultValue: "Hızlı Bağlantılar" })}
      </Typography>

      <Stack spacing={2} mt={2}>
        {dropdownData.pageLinks.map((pagelink) => (
          <Link href={pagelink.href} key={pagelink.href} className="hover-text-primary">
            <Typography
              variant="subtitle2"
              color="textPrimary"
              className="text-hover"
              fontWeight={600}
            >
              {t(pagelink.titleKey)}
            </Typography>
          </Link>
        ))}
      </Stack>
    </>
  );
};

export default QuickLinks;