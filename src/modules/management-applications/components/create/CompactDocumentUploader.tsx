"use client";

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

import { IconUpload } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import SectionCard from "./shared/SectionCard";
import InlineNotice from "./shared/InlineNotice";

import {
  documentCatalog,
  formatFileSize,
  premiumFieldSx,
} from "./constants";

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

const NS =
  "property:managementApplication.create.documentUploader";

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
  const { t } = useI18nNs(["property"]);

  const tr = (key: string, fallback: string) => {
    const fullKey = `${NS}.${key}`;
    const value = t(fullKey);

    return value && value !== fullKey
      ? value
      : fallback;
  };

  const trDirect = (
    key: string,
    fallback: string,
  ) => {
    const value = t(key);

    return value && value !== key
      ? value
      : fallback;
  };

  const allOptions = useMemo(() => {
    const map = new Map<
      RequiredDocumentKind,
      DocumentRequirement
    >();

    requirements.forEach((item) =>
      map.set(item.kind, item),
    );

    map.set("other", {
      kind: "other",
      title:
        documentCatalog.other.fallbackTitle,
      description:
        documentCatalog.other.fallbackDescription,
      required: false,
    });

    return Array.from(map.values());
  }, [requirements]);

  const selectedRequirement =
    allOptions.find(
      (item) => item.kind === selectedKind,
    );

  const canAdd =
    !!selectedFile && !!selectedKind;

  return (
    <SectionCard
      icon={<IconUpload size={19} />}
      title={tr(
        "title",
        "Belge ekle",
      )}
      description={tr(
        "description",
        "Belge türünü seçin, dosyanızı ekleyin ve gerekiyorsa kısa bir açıklama yazın.",
      )}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.1fr 1.1fr",
            },
            gap: 2,
          }}
        >
          <TextField
            select
            label={tr(
              "documentType",
              "Belge türü",
            )}
            value={selectedKind}
            onChange={(event) =>
              onKindChange(
                event.target
                  .value as RequiredDocumentKind,
              )
            }
            helperText={
              selectedRequirement?.required
                ? tr(
                    "requiredHint",
                    "Bu belge zorunlu belgeler arasında.",
                  )
                : tr(
                    "optionalHint",
                    "Bu belge isteğe bağlı olarak eklenebilir.",
                  )
            }
            fullWidth
            sx={premiumFieldSx}
          >
            {allOptions.map((item) => {
              const catalog =
                documentCatalog[item.kind];

              const title = catalog
                ? trDirect(
                    catalog.titleKey,
                    catalog.fallbackTitle,
                  )
                : item.title;

              return (
                <MenuItem
                  key={item.kind}
                  value={item.kind}
                >
                  {title}
                  {item.required
                    ? ` · ${tr(
                        "required",
                        "Zorunlu",
                      )}`
                    : ""}
                </MenuItem>
              );
            })}
          </TextField>

          <Box>
            <input
              ref={inputRef}
              type="file"
              hidden
              accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff"
              onChange={(event) =>
                onFileChange(
                  event.target.files?.[0] ??
                    null,
                )
              }
            />

            <Box
              onClick={() =>
                inputRef.current?.click()
              }
              role="button"
              tabIndex={0}
              sx={{
                minHeight: 58,
                px: 1.5,
                py: 1,
                borderRadius: 3.25,

                border: `1px solid ${alpha(
                  theme.palette.divider,
                  0.86,
                )}`,

                bgcolor: alpha(
                  theme.palette.background
                    .default,
                  0.35,
                ),

                cursor: "pointer",

                display: "flex",
                alignItems: "center",
                gap: 1.25,

                transition:
                  "all 160ms ease",

                "&:hover": {
                  borderColor: alpha(
                    theme.palette.primary
                      .main,
                    0.35,
                  ),

                  bgcolor: alpha(
                    theme.palette.primary
                      .main,
                    0.035,
                  ),
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.75,

                  display: "grid",
                  placeItems: "center",

                  bgcolor: alpha(
                    theme.palette.primary
                      .main,
                    0.08,
                  ),

                  color: "primary.main",
                  flexShrink: 0,
                }}
              >
                <IconUpload size={18} />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  fontWeight={900}
                  noWrap
                >
                  {selectedFile
                    ? selectedFile.name
                    : tr(
                        "selectFile",
                        "Dosya seçin",
                      )}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {selectedFile
                    ? `${formatFileSize(
                        selectedFile.size,
                      )} · ${
                        selectedFile.type ||
                        tr(
                          "unknownFileType",
                          "Dosya",
                        )
                      }`
                    : tr(
                        "supportedFormats",
                        "PDF, JPG, PNG, TIFF desteklenir",
                      )}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <TextField
          label={tr(
            "descriptionField",
            "Açıklama",
          )}
          value={description}
          onChange={(event) =>
            onDescriptionChange(
              event.target.value,
            )
          }
          multiline
          minRows={3}
          helperText={tr(
            "descriptionHint",
            "Belge hakkında kısa bir not ekleyebilirsiniz.",
          )}
          fullWidth
          sx={premiumFieldSx}
        />

        <InlineNotice tone="info">
          {tr(
            "securityNotice",
            "Yüklenen belgeler güvenli şekilde saklanır ve yalnızca yetkili inceleme sürecinde görüntülenir.",
          )}
        </InlineNotice>

        <Button
          variant="contained"
          disabled={!canAdd}
          onClick={onAdd}
          startIcon={<IconUpload size={18} />}
          sx={{
            height: 50,
            width: "fit-content",
            borderRadius: 999,

            textTransform: "none",

            fontWeight: 950,

            px: 3,

            boxShadow:
              "0 10px 24px rgba(37, 99, 235, 0.22)",
          }}
        >
          {tr(
            "addDocument",
            "Belgeyi ekle",
          )}
        </Button>
      </Stack>
    </SectionCard>
  );
}