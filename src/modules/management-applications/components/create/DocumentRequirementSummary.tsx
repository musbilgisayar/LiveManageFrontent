"use client";

import Link from "next/link";

import {
  alpha,
  Box,
  Button,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import type { Theme } from "@mui/material/styles";

import {
  IconCheck,
  IconCircleCheck,
  IconDownload,
  IconFileText,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import SectionCard from "./shared/SectionCard";

import { documentCatalog } from "./constants";

import type {
  DocumentRequirement,
  RequiredDocumentKind,
} from "../../types/managementApplication.types";

type DocumentRequirementSummaryProps = {
  requirements: DocumentRequirement[];
  uploadedKindCounts: Record<RequiredDocumentKind, number>;
};

const NS = "property:managementApplication.create.documentsSummary";

export default function DocumentRequirementSummary({
  requirements,
  uploadedKindCounts,
}: DocumentRequirementSummaryProps) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs(["property"]);

  const tr = (key: string, fallback: string) => {
    const fullKey = `${NS}.${key}`;
    const value = t(fullKey);

    return value && value !== fullKey
      ? value
      : fallback;
  };

  const trDirect = (key: string, fallback: string) => {
    const value = t(key);

    return value && value !== key
      ? value
      : fallback;
  };

  return (
    <SectionCard
      icon={<IconCircleCheck size={19} />}
      title={tr(
        "title",
        "Gerekli belge özeti",
      )}
      description={tr(
        "description",
        "Temsil şeklinize göre tamamlanması gereken belgeler aşağıda gösterilir.",
      )}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 1.25,
        }}
      >
        {requirements.map((item) => {
          const uploadedCount =
            uploadedKindCounts[item.kind];

          const completed = uploadedCount > 0;

          const catalog =
            documentCatalog[item.kind];

          const title = catalog
            ? trDirect(
                catalog.titleKey,
                catalog.fallbackTitle,
              )
            : item.title;

          return (
            <Box
              key={item.kind}
              sx={{
                p: 1.4,
                borderRadius: 3.5,
                border: `1px solid ${alpha(
                  completed
                    ? theme.palette.success.main
                    : theme.palette.divider,
                  completed ? 0.24 : 0.74,
                )}`,

                bgcolor: alpha(
                  completed
                    ? theme.palette.success.main
                    : theme.palette.background.default,
                  completed ? 0.06 : 0.3,
                ),

                transition: "all 180ms ease",

                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: `0 10px 24px ${alpha(
                    theme.palette.common.black,
                    0.04,
                  )}`,
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.1}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",

                    color: completed
                      ? "success.main"
                      : "text.disabled",

                    bgcolor: completed
                      ? alpha(
                          theme.palette.success.main,
                          0.09,
                        )
                      : alpha(
                          theme.palette.grey[500],
                          0.08,
                        ),

                    flexShrink: 0,
                  }}
                >
                  {completed ? (
                    <IconCheck size={17} />
                  ) : (
                    <IconFileText size={17} />
                  )}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    fontWeight={900}
                    noWrap
                    sx={{
                      fontSize: 14,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {title}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {completed
                      ? tr(
                          "uploadedCount",
                          "{count} dosya eklendi",
                        ).replace(
                          "{count}",
                          String(uploadedCount),
                        )
                      : item.required
                        ? tr(
                            "requiredWaiting",
                            "Zorunlu belge bekleniyor",
                          )
                        : tr(
                            "optional",
                            "İsteğe bağlı",
                          )}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>

      <Button
        component={Link}
        href="/documents/live-manage-management-agreement.pdf"
        target="_blank"
        rel="noreferrer"
        variant="outlined"
        startIcon={<IconDownload size={17} />}
        sx={{
          mt: 2,
          borderRadius: 999,
          fontWeight: 950,
          textTransform: "none",
          width: "fit-content",

          borderColor: alpha(
            theme.palette.primary.main,
            0.18,
          ),

          "&:hover": {
            borderColor: alpha(
              theme.palette.primary.main,
              0.34,
            ),

            bgcolor: alpha(
              theme.palette.primary.main,
              0.04,
            ),
          },
        }}
      >
        {tr(
          "downloadAgreement",
          "Hizmet sözleşmesini indir",
        )}
      </Button>
    </SectionCard>
  );
}