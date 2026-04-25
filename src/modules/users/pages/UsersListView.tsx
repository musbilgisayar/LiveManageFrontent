//src/modules/users/pages/UsersListView.tsx yeni
"use client";

import { Box, Typography } from "@mui/material";
import { useI18nNs } from "@/app/context/i18nContext";
import UsersTable from "../components/list/UsersTable";

type Props = {
  locale: string;
};

export default function UsersListView({ locale }: Props) {
  const { t } = useI18nNs(["users", "common"]);

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
        {tr("users:list.title", "Kullanıcılar")}
      </Typography>

      <UsersTable locale={locale} />
    </Box>
  );
}