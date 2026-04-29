// src/modules/users/pages/UsersListView.tsx
"use client";

import React from "react";
import {
  alpha,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { IconSparkles, IconUsers, IconUserPlus } from "@tabler/icons-react";
import { useI18nNs } from "@/app/context/i18nContext";
import UsersTable from "../components/list/UsersTable";

type Props = {
  locale: string;
};

export default function UsersListView({ locale }: Props) {
  const theme = useTheme();
  const { t } = useI18nNs(["users", "common"]);

  const isDark = theme.palette.mode === "dark";

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return !value || value === key || value === `[${key}]` ? fallback : value;
  };

  const softBorder = alpha(theme.palette.divider, isDark ? 0.42 : 0.82);
  const heroShadow = isDark
    ? "0 24px 60px rgba(0,0,0,0.42)"
    : "0 24px 60px rgba(15,23,42,0.10)";
  const ambientShadow = isDark
    ? "0 18px 40px rgba(0,0,0,0.34)"
    : "0 18px 40px rgba(15,23,42,0.08)";

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
          border: `1px solid ${softBorder}`,
          background: isDark
            ? `
              radial-gradient(circle at top left, ${alpha(theme.palette.primary.main, 0.22)} 0%, transparent 30%),
              radial-gradient(circle at top right, ${alpha(theme.palette.info.main, 0.18)} 0%, transparent 28%),
              linear-gradient(180deg, ${alpha("#101828", 0.96)} 0%, ${alpha("#0B1220", 0.92)} 100%)
            `
            : `
              radial-gradient(circle at top left, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 30%),
              radial-gradient(circle at top right, ${alpha(theme.palette.info.main, 0.10)} 0%, transparent 28%),
              linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 0.92)} 100%)
            `,
          boxShadow: heroShadow,
          backdropFilter: "blur(18px)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, isDark ? 0.04 : 0.16)} 0%, transparent 35%)`,
          }}
        />

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box minWidth={0}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.22 : 0.12),
                  color: "primary.main",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                }}
              >
                <IconSparkles size={18} />
              </Box>

              <Chip
                size="small"
                label={tr("users:list.badge", "User Management")}
                variant="outlined"
                sx={{
                  fontWeight: 800,
                  borderColor: alpha(theme.palette.common.white, isDark ? 0.12 : 0.18),
                  bgcolor: alpha(theme.palette.background.paper, isDark ? 0.08 : 0.28),
                  backdropFilter: "blur(10px)",
                }}
              />
            </Stack>

            <Typography variant="h4" fontWeight={900} letterSpacing={-0.8}>
              {tr("users:list.title", "Kullanıcılar")}
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={1} sx={{ maxWidth: 760 }}>
              {tr(
                "users:list.subtitle",
                "Kullanıcı kayıtlarını görüntüleyin, yönetin ve hesap durumlarını tek bir merkezden takip edin."
              )}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<IconUserPlus size={18} />}
              sx={{
                borderRadius: 999,
                px: 2,
                fontWeight: 800,
                boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.28)}`,
              }}
            >
              {tr("users:list.actions.add", "Yeni Kullanıcı")}
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            mt: 3,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1.5,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              border: `1px solid ${softBorder}`,
              bgcolor: alpha(theme.palette.background.paper, isDark ? 0.5 : 0.82),
              boxShadow: ambientShadow,
              backdropFilter: "blur(12px)",
            }}
          >
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
              <Box minWidth={0}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                    fontWeight: 800,
                    mb: 0.75,
                  }}
                >
                  {tr("users:list.cards.directory", "Dizin")}
                </Typography>

                <Typography variant="h6" fontWeight={900} lineHeight={1.1}>
                  {tr("users:list.cards.directoryValue", "Kullanıcı Kataloğu")}
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                  {tr(
                    "users:list.cards.directoryHint",
                    "Tüm kullanıcı kayıtları ve liste işlemleri"
                  )}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.14)}`,
                  flexShrink: 0,
                }}
              >
                <IconUsers size={20} />
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              border: `1px solid ${softBorder}`,
              bgcolor: alpha(theme.palette.background.paper, isDark ? 0.5 : 0.82),
              boxShadow: ambientShadow,
              backdropFilter: "blur(12px)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: 0.4,
                fontWeight: 800,
                mb: 0.75,
              }}
            >
              {tr("users:list.cards.locale", "Locale")}
            </Typography>

            <Typography variant="h6" fontWeight={900} lineHeight={1.1}>
              {locale}
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
              {tr("users:list.cards.localeHint", "Aktif listeleme dili / yönlendirme bağlamı")}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              border: `1px solid ${softBorder}`,
              bgcolor: alpha(theme.palette.background.paper, isDark ? 0.5 : 0.82),
              boxShadow: ambientShadow,
              backdropFilter: "blur(12px)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: 0.4,
                fontWeight: 800,
                mb: 0.75,
              }}
            >
              {tr("users:list.cards.operations", "Operasyonlar")}
            </Typography>

            <Typography variant="h6" fontWeight={900} lineHeight={1.1}>
              {tr("users:list.cards.operationsValue", "Listele • Filtrele • Yönet")}
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
              {tr(
                "users:list.cards.operationsHint",
                "Hızlı yönetim akışları için optimize edilmiş görünüm"
              )}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${softBorder}`,
          bgcolor: alpha(theme.palette.background.paper, isDark ? 0.66 : 0.9),
          backdropFilter: "blur(16px)",
          boxShadow: ambientShadow,
        }}
      >
        <Box
          sx={{
            px: { xs: 2, md: 2.5 },
            py: 1.5,
            borderBottom: `1px solid ${softBorder}`,
            background: alpha(theme.palette.background.default, isDark ? 0.28 : 0.52),
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={900}>
                {tr("users:list.tableTitle", "Kullanıcı Listesi")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tr(
                  "users:list.tableSubtitle",
                  "Arama, filtreleme ve yönetim işlemleri aşağıdaki tablo üzerinden yapılır."
                )}
              </Typography>
            </Box>

            <Chip
              size="small"
              variant="outlined"
              label={tr("users:list.tableBadge", "Live Data")}
              sx={{ fontWeight: 800 }}
            />
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 1, md: 1.5 } }}>
          <UsersTable locale={locale} />
        </Box>
      </Box>
    </Box>
  );
}