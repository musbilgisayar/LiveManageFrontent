"use client";

import {
  alpha,
  Box,
  Button,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconFileText, IconX } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import SectionCard from "./shared/SectionCard";
import { documentCatalog } from "./constants";
import type { UploadedFileItem } from "../../types/managementApplication.types";

type UploadedDocumentListProps = {
  files: UploadedFileItem[];
  onRemove: (id: string) => void;
};

const NS = "property:managementApplication.create.uploadedDocuments";

export default function UploadedDocumentList({
  files,
  onRemove,
}: UploadedDocumentListProps) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs(["property"]);

  const tr = (key: string, fallback: string) => {
    const fullKey = `${NS}.${key}`;
    const value = t(fullKey);
    return value && value !== fullKey ? value : fallback;
  };

  const trDirect = (key: string, fallback: string) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const getDocumentTitle = (kind: UploadedFileItem["kind"]) => {
    const catalog = documentCatalog[kind];

    return catalog
      ? trDirect(catalog.titleKey, catalog.fallbackTitle)
      : tr("fallbackDocument", "Belge");
  };

  return (
    <SectionCard
      icon={<IconFileText size={19} />}
      title={tr("title", "Eklenen belgeler")}
      description={tr(
        "description",
        "Başvuruya eklenen dosyaları buradan kontrol edebilirsiniz.",
      )}
    >
      {files.length === 0 ? (
        <Box
          sx={{
            p: 2,
            borderRadius: 4,
            border: `1px dashed ${alpha(theme.palette.divider, 0.9)}`,
            bgcolor: alpha(theme.palette.background.default, 0.35),
          }}
        >
          <Typography fontWeight={900}>
            {tr("emptyTitle", "Henüz belge eklenmedi")}
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={0.4}>
            {tr(
              "emptyDescription",
              "Dosya seçip “Belgeyi Ekle” dediğinizde burada listelenecek.",
            )}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {files.map((file) => (
            <Stack
              key={file.id}
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={1.25}
              sx={{
                p: 1.25,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
                bgcolor: alpha(theme.palette.background.default, 0.3),
              }}
            >
              <Stack
                direction="row"
                spacing={1.2}
                alignItems="center"
                sx={{ minWidth: 0 }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.success.main, 0.09),
                    color: "success.main",
                    flexShrink: 0,
                  }}
                >
                  <IconFileText size={18} />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={900} noWrap>
                    {file.name}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {getDocumentTitle(file.kind)} · {file.sizeLabel}
                  </Typography>

                  {file.description && (
                    <Typography variant="body2" color="text.secondary" mt={0.3}>
                      {file.description}
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Button
                color="error"
                size="small"
                startIcon={<IconX size={15} />}
                onClick={() => onRemove(file.id)}
                sx={{
                  alignSelf: { xs: "flex-end", sm: "center" },
                  textTransform: "none",
                  fontWeight: 900,
                }}
              >
                {tr("remove", "Kaldır")}
              </Button>
            </Stack>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}