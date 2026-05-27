//bu dosya ait metinler management-applications.json dosyasında bulunur. Anahtarlar KEYS objesinde tanımlanmıştır. Metin eklemek veya değiştirmek için o dosyayı düzenleyin. bu dosyanın amacı sadece bileşen yapısını tanımlamaktır, metinleri değil.
// src/modules/management-applications/components/create/CompactDocumentUploader.tsx
"use client";

import Link from "next/link";
import React, { useMemo } from "react";

import {
  alpha,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconDownload, IconFileUpload, IconPlus } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import UploadDropzoneCard from "./upload/UploadDropzoneCard";
import { documentCatalog } from "./constants";

import type {
  DocumentRequirement,
  RequiredDocumentKind,
} from "../../types/managementApplication.types";

type CompactDocumentUploaderProps = {
  requirements: DocumentRequirement[];
  selectedKind: RequiredDocumentKind;
  selectedFile: File | null;
  description: string;
  onKindChange: (kind: RequiredDocumentKind) => void;
  onDescriptionChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onAdd: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

const I18N_PREFIX = "management-applications";

const KEYS = {
  title: "management-applications:create.documentUploader.title",
  description: "management-applications:create.documentUploader.description",
  documentType: "management-applications:create.documentUploader.documentType",
  required: "management-applications:create.documentUploader.required",
  downloadAgreement:
    "management-applications:create.documentUploader.downloadAgreement",
  addDocument: "management-applications:create.documentUploader.addDocument",
  descriptionField:
    "management-applications:create.documentUploader.descriptionField",
  descriptionPlaceholder:
    "management-applications:create.documentUploader.descriptionPlaceholder",
  securityNotice:
    "management-applications:create.documentUploader.securityNotice",
} as const;

export default function CompactDocumentUploader({
  requirements,
  selectedKind,
  selectedFile,
  description,
  onKindChange,
  onDescriptionChange,
  onFileChange,
  onAdd,
  inputRef,
}: CompactDocumentUploaderProps) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs(I18N_PREFIX);

  const tr = (fullKey: string, fallback: string) => {
    const value = t(fullKey);

    if (!value) return fallback;
    if (value === fullKey) return fallback;
    if (value === `[${fullKey}]`) return fallback;

    return value;
  };

  const allOptions = useMemo(() => {
    const map = new Map<RequiredDocumentKind, DocumentRequirement>();

    requirements.forEach((item) => {
      map.set(item.kind, item);
    });

    map.set("Other", {
      kind: "Other",
      title: documentCatalog.Other.fallbackTitle,
      description: documentCatalog.Other.fallbackDescription,
      required: false,
    });

    return Array.from(map.values());
  }, [requirements]);

  const canAdd = Boolean(selectedFile && selectedKind);

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      bgcolor: "background.paper",
      boxShadow: `0 10px 24px ${alpha(
        theme.palette.common.black,
        theme.palette.mode === "dark" ? 0.2 : 0.035,
      )}`,
      transition: "all 180ms ease",

      "& input::placeholder, & textarea::placeholder": {
        color: alpha(theme.palette.text.secondary, 0.42),
        opacity: 1,
        fontWeight: 400,
      },

      "&:hover": {
        boxShadow: `0 14px 32px ${alpha(
          theme.palette.common.black,
          theme.palette.mode === "dark" ? 0.26 : 0.055,
        )}`,
      },

      "&.Mui-focused": {
        boxShadow: `0 16px 38px ${alpha(theme.palette.primary.main, 0.13)}`,
      },
    },

    "& .MuiInputLabel-root": {
      color: alpha(theme.palette.text.secondary, 0.72),
      fontWeight: 700,
    },

    "& .MuiFormHelperText-root": {
      color: alpha(theme.palette.text.secondary, 0.58),
      fontSize: 12,
    },
  };

  return (
    <Box
      sx={{
        height: "100%",
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
        animation: "documentUploaderIn 340ms ease both",

        "@keyframes documentUploaderIn": {
          from: {
            opacity: 0,
            transform: "translateY(10px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography
            fontWeight={950}
            sx={{
              fontSize: 20,
              letterSpacing: "-0.035em",
              lineHeight: 1.15,
            }}
          >
            {tr(KEYS.title, "Belge yükleyin")}
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
              "Belge türünü seçin, dosyanızı yükleyin ve kısa bir açıklama ekleyin.",
            )}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 230px",
            },
            gap: 1.4,
            alignItems: "end",
          }}
        >
          <TextField
            select
            label={tr(KEYS.documentType, "Belge türü")}
            value={selectedKind}
            onChange={(event) =>
              onKindChange(event.target.value as RequiredDocumentKind)
            }
            fullWidth
            sx={fieldSx}
          >
            {allOptions.map((item) => {
              const catalog = documentCatalog[item.kind];

              const title = catalog
                ? tr(catalog.titleKey, catalog.fallbackTitle)
                : item.title;

              return (
                <MenuItem key={item.kind} value={item.kind}>
                  {title}
                  {item.required ? ` (${tr(KEYS.required, "Zorunlu")})` : ""}
                </MenuItem>
              );
            })}
          </TextField>

          <Button
            component={Link}
            href="/documents/live-manage-management-agreement.pdf"
            target="_blank"
            rel="noreferrer"
            variant="outlined"
            startIcon={<IconDownload size={18} />}
            sx={{
              height: 56,
              borderRadius: 3,
              fontWeight: 950,
              textTransform: "none",
              borderColor: alpha(theme.palette.primary.main, 0.28),
              bgcolor: alpha(theme.palette.primary.main, 0.025),
              boxShadow: `0 12px 28px ${alpha(
                theme.palette.primary.main,
                0.09,
              )}`,

              "&:hover": {
                transform: "translateY(-1px)",
                borderColor: alpha(theme.palette.primary.main, 0.44),
                bgcolor: alpha(theme.palette.primary.main, 0.055),
                boxShadow: `0 16px 36px ${alpha(
                  theme.palette.primary.main,
                  0.14,
                )}`,
              },
            }}
          >
            {tr(KEYS.downloadAgreement, "Sözleşmeyi indir")}
          </Button>
        </Box>

        <UploadDropzoneCard
          file={selectedFile}
          inputRef={inputRef}
          onFileChange={onFileChange}
        />

        {selectedFile && (
          <Button
            variant="contained"
            disabled={!canAdd}
            onClick={onAdd}
            startIcon={<IconPlus size={18} />}
            sx={{
              height: 50,
              width: {
                xs: "100%",
                sm: "fit-content",
              },
              px: 2.8,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 950,
              alignSelf: {
                xs: "stretch",
                sm: "flex-end",
              },
              boxShadow: `0 16px 34px ${alpha(
                theme.palette.primary.main,
                0.22,
              )}`,

              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: `0 20px 44px ${alpha(
                  theme.palette.primary.main,
                  0.28,
                )}`,
              },
            }}
          >
            {tr(KEYS.addDocument, "Belgeyi ekle")}
          </Button>
        )}

        <Box>
          <Typography
            fontWeight={900}
            sx={{
              mb: 0.8,
              fontSize: 13.5,
              color: alpha(theme.palette.text.primary, 0.86),
            }}
          >
            {tr(KEYS.descriptionField, "Açıklama")}
          </Typography>

          <TextField
            placeholder={tr(
              KEYS.descriptionPlaceholder,
              "Kısa bir açıklama yazın...",
            )}
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            multiline
            minRows={2}
            maxRows={3}
            fullWidth
            sx={fieldSx}
            InputProps={{
              endAdornment: (
                <Typography
                  variant="caption"
                  sx={{
                    alignSelf: "flex-end",
                    pb: 0.3,
                    color: alpha(theme.palette.text.secondary, 0.58),
                    whiteSpace: "nowrap",
                  }}
                >
                  {description.length} / 500
                </Typography>
              ),
            }}
          />
        </Box>

        <Box
          sx={{
            p: 1.3,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            gap: 1.1,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.16),
            bgcolor: alpha(theme.palette.primary.main, 0.035),
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2.4,
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              bgcolor: alpha(theme.palette.primary.main, 0.09),
              flexShrink: 0,
            }}
          >
            <IconFileUpload size={18} />
          </Box>

          <Typography
            sx={{
              color: alpha(theme.palette.text.secondary, 0.84),
              fontSize: 13,
              lineHeight: 1.55,
              fontWeight: 600,
            }}
          >
            {tr(
              KEYS.securityNotice,
              "Yüklenen belgeler güvenli şekilde saklanır ve yalnızca yetkili inceleme sürecinde görüntülenir.",
            )}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
