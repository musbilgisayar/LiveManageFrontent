"use client";

import {
  alpha,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconCheck,
  IconDownload,
  IconFileText,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import { documentCatalog } from "./constants";

import type { UploadedFileItem } from "../../types/managementApplication.types";

type UploadedDocumentListProps = {
  files: UploadedFileItem[];
  onRemove: (id: string) => void;
  onDownload?: (backendDocumentId: string) => void;
};

const I18N_PREFIX = "management-applications";

const KEYS = {
  fallbackDocument: "management-applications:create.uploadedDocuments.fallbackDocument",
  title: "management-applications:create.uploadedDocuments.title",
  description: "management-applications:create.uploadedDocuments.description",
  count: "management-applications:create.uploadedDocuments.count",
  emptyTitle: "management-applications:create.uploadedDocuments.emptyTitle",
  emptyDescription:
    "management-applications:create.uploadedDocuments.emptyDescription",
  uploaded: "management-applications:create.uploadedDocuments.uploaded",
  download: "management-applications:create.uploadedDocuments.download",
  remove: "management-applications:create.uploadedDocuments.remove",
} as const;

export default function UploadedDocumentList({
  files,
  onRemove,
  onDownload,
}: UploadedDocumentListProps) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs(I18N_PREFIX);

  const tr = (fullKey: string, fallback: string) => {
    const value = t(fullKey);

    if (!value) return fallback;
    if (value === fullKey) return fallback;
    if (value === `[${fullKey}]`) return fallback;

    return value;
  };

  const getDocumentTitle = (kind: UploadedFileItem["kind"]) => {
    const catalog = documentCatalog[kind];

    return catalog
      ? tr(catalog.titleKey, catalog.fallbackTitle)
      : tr(KEYS.fallbackDocument, "Belge");
  };

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 2.4,
        },
        borderRadius: 5,
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.78),
        bgcolor: "background.paper",
        boxShadow: `0 22px 60px ${alpha(
          theme.palette.common.black,
          theme.palette.mode === "dark" ? 0.28 : 0.065,
        )}`,
        animation: "uploadedDocumentsIn 320ms ease both",

        "@keyframes uploadedDocumentsIn": {
          from: {
            opacity: 0,
            transform: "translateY(8px)",
          },

          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1.5}
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          justifyContent="space-between"
        >
          <Box>
            <Typography
              fontWeight={950}
              sx={{
                fontSize: 20,
                letterSpacing: "-0.035em",
                lineHeight: 1.15,
              }}
            >
              {tr(KEYS.title, "Eklenen belgeler")}
            </Typography>

            <Typography
              sx={{
                mt: 0.7,
                color: alpha(theme.palette.text.secondary, 0.82),
                fontSize: 14,
                lineHeight: 1.65,
                fontWeight: 500,
              }}
            >
              {tr(
                KEYS.description,
                "Başvurunuza eklenen belgeleri buradan kontrol edebilirsiniz.",
              )}
            </Typography>
          </Box>

          <Chip
            icon={<IconCheck size={15} />}
            label={tr(KEYS.count, "{count} belge eklendi").replace(
              "{count}",
              String(files.length),
            )}
            sx={{
              borderRadius: 999,
              fontWeight: 950,
              color: "success.main",
              bgcolor: alpha(theme.palette.success.main, 0.09),
              border: `1px solid ${alpha(theme.palette.success.main, 0.18)}`,

              "& .MuiChip-icon": {
                color: "success.main",
              },
            }}
          />
        </Stack>

        {files.length === 0 ? (
          <Box
            sx={{
              minHeight: 240,
              borderRadius: 5,
              border: "2px dashed",
              borderColor: alpha(theme.palette.divider, 0.85),
              bgcolor: alpha(theme.palette.background.default, 0.32),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",

              "&::after": {
                content: '""',
                position: "absolute",
                top: -70,
                right: -70,
                width: 160,
                height: 160,
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            <Stack
              spacing={1.6}
              alignItems="center"
              textAlign="center"
              sx={{
                position: "relative",
                zIndex: 1,
                maxWidth: 360,
              }}
            >
              <Box
                sx={{
                  width: 74,
                  height: 74,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  color: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  boxShadow: `0 16px 40px ${alpha(
                    theme.palette.primary.main,
                    0.12,
                  )}`,
                }}
              >
                <IconUpload size={34} />
              </Box>

              <Box>
                <Typography
                  fontWeight={950}
                  sx={{
                    fontSize: 18,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {tr(KEYS.emptyTitle, "Henüz belge eklenmedi")}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.8,
                    color: alpha(theme.palette.text.secondary, 0.78),
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  {tr(
                    KEYS.emptyDescription,
                    "Belgeler yüklendiğinde burada listelenecektir.",
                  )}
                </Typography>
              </Box>
            </Stack>
          </Box>
        ) : (
          <Stack spacing={1.4}>
            {files.map((file, index) => (
              <Box
                key={file.id}
                sx={{
                  p: 1.5,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.divider, 0.72),
                  bgcolor: alpha(theme.palette.background.default, 0.22),
                  transition: "all 180ms ease",
                  animation: `uploadedFileRowIn 260ms ease ${
                    index * 70
                  }ms both`,

                  "@keyframes uploadedFileRowIn": {
                    from: {
                      opacity: 0,
                      transform: "translateY(8px)",
                    },

                    to: {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },

                  "&:hover": {
                    transform: "translateY(-2px)",
                    borderColor: alpha(theme.palette.primary.main, 0.18),
                    boxShadow: `0 18px 42px ${alpha(
                      theme.palette.common.black,
                      theme.palette.mode === "dark" ? 0.22 : 0.06,
                    )}`,
                  },
                }}
              >
                <Stack
                  direction={{
                    xs: "column",
                    md: "row",
                  }}
                  spacing={1.5}
                  alignItems={{
                    xs: "stretch",
                    md: "center",
                  }}
                  justifyContent="space-between"
                >
                  <Stack
                    direction="row"
                    spacing={1.4}
                    alignItems="center"
                    sx={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: 3,
                        display: "grid",
                        placeItems: "center",
                        color: "success.main",
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        flexShrink: 0,
                      }}
                    >
                      <IconFileText size={25} />
                    </Box>

                    <Box
                      sx={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Typography
                          noWrap
                          sx={{
                            fontWeight: 950,
                            fontSize: 15,
                            letterSpacing: "-0.015em",
                            maxWidth: "100%",
                          }}
                        >
                          {file.name}
                        </Typography>

                        <Chip
                          size="small"
                          label={tr(KEYS.uploaded, "Yüklendi")}
                          sx={{
                            height: 24,
                            borderRadius: 999,
                            fontWeight: 900,
                            color: "success.main",
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                          }}
                        />
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={0.8}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{
                          mt: 0.9,
                        }}
                      >
                        <Chip
                          size="small"
                          label={getDocumentTitle(file.kind)}
                          sx={{
                            borderRadius: 999,
                            fontWeight: 800,
                          }}
                        />

                        <Chip
                          size="small"
                          label={file.sizeLabel}
                          sx={{
                            borderRadius: 999,
                            fontWeight: 800,
                          }}
                        />
                      </Stack>

                      {file.description && (
                        <Typography
                          sx={{
                            mt: 1,
                            color: alpha(theme.palette.text.secondary, 0.82),
                            fontSize: 13,
                            lineHeight: 1.65,
                          }}
                        >
                          {file.description}
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    {file.backendDocumentId && onDownload && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<IconDownload size={15} />}
                        onClick={() => onDownload(file.backendDocumentId!)}
                        sx={{
                          borderRadius: 999,
                          fontWeight: 700,
                        }}
                      >
                        {tr(KEYS.download, "İndir")}
                      </Button>
                    )}

                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<IconTrash size={15} />}
                      onClick={() => onRemove(file.id)}
                      sx={{
                        borderRadius: 999,
                        fontWeight: 700,
                      }}
                    >
                      {tr(KEYS.remove, "Kaldır")}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}