//bu dosya ait metinler management-applications.json dosyasında bulunur. Anahtarlar KEYS objesinde tanımlanmıştır. Metin eklemek veya değiştirmek için o dosyayı düzenleyin. bu dosyanın amacı sadece bileşen yapısını tanımlamaktır, metinleri değil. bu dosya, belgelerin gerekliliklerini ve yükleme durumlarını özetleyen bir bileşen içerir. Her belge türü için, yüklenmiş dosya sayısını ve belgenin zorunlu olup olmadığını gösterir. Ayrıca, belgelerin güvenli bir şekilde saklandığını belirten bir bilgi kutusu da içerir. Bu bileşen, kullanıcıların hangi belgeleri yüklemeleri gerektiğini ve hangi belgelerin eksik olduğunu hızlıca görmelerini sağlar.
// src/modules/management-applications/components/create/DocumentRequirementSummary.tsx
"use client";
// src/modules/management-applications/components/create/DocumentRequirementSummary.tsx
"use client";

import {
  alpha,
  Box,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconCheck, IconFileText, IconLock } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";
import { documentCatalog } from "./constants";

import type {
  DocumentRequirement,
  RequiredDocumentKind,
} from "../../types/managementApplication.types";

type Props = {
  requirements: DocumentRequirement[];
  uploadedKindCounts?: Partial<Record<RequiredDocumentKind, number>>;
};

const I18N_PREFIX = "management-applications";

const KEYS = {
  title: "management-applications:create.documentRequirementSummary.title",
  description:
    "management-applications:create.documentRequirementSummary.description",
  uploadedCount:
    "management-applications:create.documentRequirementSummary.uploadedCount",
  required: "management-applications:create.documentRequirementSummary.required",
  optional: "management-applications:create.documentRequirementSummary.optional",
  securityTitle:
    "management-applications:create.documentRequirementSummary.securityTitle",
  securityDescription:
    "management-applications:create.documentRequirementSummary.securityDescription",
} as const;

export default function DocumentRequirementSummary({
  requirements,
  uploadedKindCounts = {},
}: Props) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs(I18N_PREFIX);

  const tr = (fullKey: string, fallback: string) => {
    const value = t(fullKey);

    if (!value) return fallback;
    if (value === fullKey) return fallback;
    if (value === `[${fullKey}]`) return fallback;

    return value;
  };

  const resolveTitle = (item: DocumentRequirement) => {
    if (item.title && item.title !== item.kind) {
      return item.title;
    }

    const catalog = documentCatalog[item.kind];

    if (!catalog) {
      return "Belge";
    }

    return tr(catalog.titleKey, catalog.fallbackTitle);
  };

  const completedCount = requirements.filter(
    (item) => (uploadedKindCounts[item.kind] ?? 0) > 0,
  ).length;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.78),
        bgcolor: "background.paper",
        boxShadow: `0 18px 46px ${alpha(
          theme.palette.common.black,
          theme.palette.mode === "dark" ? 0.26 : 0.055,
        )}`,
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography
              fontWeight={950}
              sx={{
                fontSize: 18,
                letterSpacing: "-0.025em",
                lineHeight: 1.2,
              }}
            >
              {tr(KEYS.title, "Gerekli belgeler")}
            </Typography>

            <Typography
              sx={{
                mt: 0.55,
                fontSize: 13,
                lineHeight: 1.55,
                color: alpha(theme.palette.text.secondary, 0.78),
                fontWeight: 500,
              }}
            >
              {tr(
                KEYS.description,
                "Tüm belgeleri yükleyerek başvurunuzu tamamlayabilirsiniz.",
              )}
            </Typography>
          </Box>

          <Chip
            label={`${completedCount} / ${requirements.length}`}
            size="small"
            sx={{
              height: 26,
              borderRadius: 999,
              fontWeight: 950,
              color: "success.main",
              bgcolor: alpha(theme.palette.success.main, 0.09),
              border: `1px solid ${alpha(theme.palette.success.main, 0.18)}`,
            }}
          />
        </Stack>

        <Stack spacing={1}>
          {requirements.map((item, index) => {
            const uploaded = uploadedKindCounts[item.kind] ?? 0;
            const completed = uploaded > 0;
            const title = resolveTitle(item);

            return (
              <Box
                key={item.kind}
                sx={{
                  p: 1.25,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: completed
                    ? alpha(theme.palette.success.main, 0.28)
                    : alpha(theme.palette.divider, 0.72),
                  bgcolor: completed
                    ? alpha(theme.palette.success.main, 0.045)
                    : alpha(theme.palette.background.default, 0.28),
                  boxShadow: `0 8px 22px ${alpha(
                    theme.palette.common.black,
                    theme.palette.mode === "dark" ? 0.18 : 0.03,
                  )}`,
                  transition:
                    "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                  animation: `documentRequirementIn 220ms ease ${
                    index * 45
                  }ms both`,

                  "@keyframes documentRequirementIn": {
                    from: {
                      opacity: 0,
                      transform: "translateY(6px)",
                    },
                    to: {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },

                  "&:hover": {
                    transform: "translateY(-1px)",
                    borderColor: completed
                      ? alpha(theme.palette.success.main, 0.38)
                      : alpha(theme.palette.primary.main, 0.22),
                    boxShadow: `0 12px 30px ${alpha(
                      completed
                        ? theme.palette.success.main
                        : theme.palette.primary.main,
                      0.1,
                    )}`,
                  },
                }}
              >
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2.5,
                      display: "grid",
                      placeItems: "center",
                      color: completed ? "success.main" : "text.disabled",
                      bgcolor: completed
                        ? alpha(theme.palette.success.main, 0.12)
                        : alpha(theme.palette.grey[500], 0.08),
                      flexShrink: 0,
                    }}
                  >
                    {completed ? (
                      <IconCheck size={18} />
                    ) : (
                      <IconFileText size={18} />
                    )}
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 950,
                        color: "text.primary",
                        lineHeight: 1.25,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {title}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.3,
                        display: "block",
                        color: completed
                          ? "success.main"
                          : alpha(theme.palette.text.secondary, 0.72),
                        fontWeight: 800,
                      }}
                    >
                      {completed
                        ? tr(KEYS.uploadedCount, "{count} dosya eklendi").replace(
                            "{count}",
                            String(uploaded),
                          )
                        : item.required
                          ? tr(KEYS.required, "Zorunlu belge")
                          : tr(KEYS.optional, "İsteğe bağlı")}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>

        <Box
          sx={{
            p: 1.25,
            borderRadius: 3,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.14),
            bgcolor: alpha(theme.palette.primary.main, 0.035),
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.09),
                flexShrink: 0,
              }}
            >
              <IconLock size={19} />
            </Box>

            <Box>
              <Typography
                fontWeight={950}
                sx={{
                  fontSize: 13.5,
                  letterSpacing: "-0.01em",
                }}
              >
                {tr(KEYS.securityTitle, "Güvenli ve yasal")}
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: 12.5,
                  lineHeight: 1.55,
                  color: alpha(theme.palette.text.secondary, 0.78),
                }}
              >
                {tr(
                  KEYS.securityDescription,
                  "Belgeleriniz şifrelenerek saklanır.",
                )}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}