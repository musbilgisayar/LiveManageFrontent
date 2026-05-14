"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import { IconHistory, IconShieldCheck } from "@tabler/icons-react";
import { useI18nNs } from "@/app/context/i18nContext";

interface Props {
  onOpenHistory: () => void;
  historyDisabled: boolean;
}

export default function UserPermissionHeader({
  onOpenHistory,
  historyDisabled,
}: Props) {
  const { t } = useI18nNs(["permission", "sidebar"]);

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      spacing={2}
    >
      <Box>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconShieldCheck size={28} />

          <Typography variant="h4" fontWeight={800}>
            {t("permission:userOverrides.title")}
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {t("permission:userOverrides.subtitle")}
        </Typography>
      </Box>

      <Button
        variant="outlined"
        startIcon={<IconHistory size={18} />}
        disabled={historyDisabled}
        onClick={onOpenHistory}
      >
        {t("permission:userOverrides.actions.history")}
      </Button>
    </Stack>
  );
}