// src/modules/management-applications/components/create/PageHero.tsx
"use client";

import {
  alpha,
  Box,
  Card,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

import {
  IconBuildingCommunity,
  IconFileCheck,
  IconLockCheck,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

const NS = "management-applications:create.pageHero";

export default function PageHero() {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs("management-applications");

  const tr = (key: string, fallback: string) => {
    const fullKey = `${NS}.${key}`;
    const value = t(fullKey);

    if (!value) return fallback;
    if (value === fullKey) return fallback;
    if (value === `[${fullKey}]`) return fallback;

    return value;
  };

  const trustItems = [
    {
      icon: <IconLockCheck size={17} />,
      label: tr("trust.secureStorage", "Güvenli veri saklama"),
    },
    {
      icon: <IconFileCheck size={17} />,
      label: tr("trust.documentReview", "Belgeli inceleme"),
    },
    {
      icon: <IconBuildingCommunity size={17} />,
      label: tr("trust.tenantAware", "Kurumsal yönetim akışı"),
    },
  ];

  return (
    <Card
      variant="outlined"
      sx={{
        position: "relative",
        overflow: "hidden",
        p: { xs: 2.5, md: 4 },
        borderRadius: 5,
        border: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.18),
        bgcolor: "background.paper",
        boxShadow: `0 24px 70px ${alpha(
          theme.palette.common.black,
          theme.palette.mode === "dark" ? 0.32 : 0.08,
        )}`,

        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at top right, ${alpha(
            theme.palette.primary.main,
            0.16,
          )} 0%, transparent 34%)`,
          pointerEvents: "none",
        },

        "&::after": {
          content: '""',
          position: "absolute",
          right: -90,
          top: -90,
          width: 220,
          height: 220,
          borderRadius: "50%",
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          pointerEvents: "none",
        },
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 3, md: 4 }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Stack spacing={1.6} sx={{ maxWidth: 720 }}>
          <Chip
            icon={<IconShieldCheck size={15} />}
            label={tr("badge", "Güvenli başvuru süreci")}
            sx={{
              width: "fit-content",
              height: 30,
              borderRadius: 999,
              fontWeight: 900,
              color: "primary.main",
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
              "& .MuiChip-icon": {
                color: "primary.main",
              },
            }}
          />

          <Box>
            <Typography
              variant="h4"
              fontWeight={950}
              sx={{
                letterSpacing: "-0.045em",
                lineHeight: 1.08,
                fontSize: { xs: 30, md: 40 },
              }}
            >
              {tr("title", "Yönetim başvurusu oluştur")}
            </Typography>

            <Typography
              sx={{
                mt: 1.2,
                maxWidth: 620,
                color: alpha(theme.palette.text.secondary, 0.82),
                fontSize: { xs: 14.5, md: 15.5 },
                lineHeight: 1.75,
                fontWeight: 500,
              }}
            >
              {tr(
                "description",
                "Başvurunuzu güvenli, belgeli ve kontrollü bir süreçle tamamlayın.",
              )}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ pt: 0.6 }}
          >
            {trustItems.map((item) => (
              <Box
                key={item.label}
                sx={{
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  color: "text.primary",
                  bgcolor: alpha(theme.palette.background.default, 0.62),
                  border: `1px solid ${alpha(theme.palette.divider, 0.72)}`,
                  boxShadow: `0 10px 24px ${alpha(
                    theme.palette.common.black,
                    theme.palette.mode === "dark" ? 0.18 : 0.04,
                  )}`,
                }}
              >
                <Box
                  sx={{
                    color: "primary.main",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {item.icon}
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 850,
                    color: alpha(theme.palette.text.primary, 0.82),
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>

        <Box
          sx={{
            width: { xs: "100%", md: 220 },
            minHeight: 150,
            borderRadius: 4,
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.065),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
            boxShadow: `inset 0 1px 0 ${alpha(
              theme.palette.common.white,
              0.28,
            )}`,
          }}
        >
          <Stack spacing={1.2} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                boxShadow: `0 18px 44px ${alpha(
                  theme.palette.primary.main,
                  0.18,
                )}`,
              }}
            >
              <IconSparkles size={34} />
            </Box>

            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 900,
                color: alpha(theme.palette.text.primary, 0.78),
              }}
            >
              {tr("sideNote", "Adım adım güvenli doğrulama")}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}