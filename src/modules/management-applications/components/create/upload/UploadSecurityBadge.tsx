// src/modules/management-applications/components/create/upload/UploadSecurityBadge.tsx
"use client";

import {
  alpha,
  Box,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import type { Theme } from "@mui/material/styles";

import {
  IconEyeCheck,
  IconLock,
  IconShieldCheck,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

const I18N_PREFIX = "management-applications";

const KEYS = {
  encrypted:
    "management-applications:create.documentUploader.security.encrypted",

  verified:
    "management-applications:create.documentUploader.security.verified",

  authorized:
    "management-applications:create.documentUploader.security.authorized",
} as const;

export default function UploadSecurityBadge() {
  const theme = useTheme<Theme>();

  const { t } = useI18nNs(I18N_PREFIX);

  const tr = (fullKey: string, fallback: string) => {
    const value = t(fullKey);

    if (!value) return fallback;
    if (value === fullKey) return fallback;
    if (value === `[${fullKey}]`) return fallback;

    return value;
  };

  const items = [
    {
      icon: <IconLock size={16} />,
      label: tr(KEYS.encrypted, "Şifreli saklama"),
    },
    {
      icon: <IconShieldCheck size={16} />,
      label: tr(KEYS.verified, "Güvenli doğrulama"),
    },
    {
      icon: <IconEyeCheck size={16} />,
      label: tr(KEYS.authorized, "Yetkili erişim"),
    },
  ];

  return (
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
    >
      {items.map((item) => (
        <Box
          key={item.label}
          sx={{
            px: 1.2,
            py: 0.7,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            border: `1px solid ${alpha(
              theme.palette.success.main,
              0.18,
            )}`,
            bgcolor: alpha(theme.palette.success.main, 0.055),
            color: "success.main",
            fontWeight: 900,
            fontSize: 12,
          }}
        >
          {item.icon}

          <Typography
            component="span"
            sx={{
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {item.label}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}