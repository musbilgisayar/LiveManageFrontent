"use client";

import React, { useMemo } from "react";
import { alpha, Box, Button, MenuItem, Stack, TextField, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconUpload } from "@tabler/icons-react";

import SectionCard from "./shared/SectionCard";
import InlineNotice from "./shared/InlineNotice";
import { documentCatalog, formatFileSize, premiumFieldSx } from "./constants";
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

  const allOptions = useMemo(() => {
    const map = new Map<RequiredDocumentKind, DocumentRequirement>();

    requirements.forEach((item) => map.set(item.kind, item));

    map.set("other", {
      kind: "other",
      title: documentCatalog.other.title,
      description: documentCatalog.other.description,
      required: false,
    });

    return Array.from(map.values());
  }, [requirements]);

  const selectedRequirement = allOptions.find((item) => item.kind === selectedKind);
  const canAdd = !!selectedFile && !!selectedKind;

  return (
    <SectionCard
      icon={<IconUpload size={19} />}
      title="Belge ekle"
      description="Belge türünü seçin, dosyanızı ekleyin ve gerekiyorsa kısa bir açıklama yazın."
    >
      <Stack spacing={2}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 1.1fr" },
            gap: 2,
          }}
        >
          <TextField
            select
            label="Belge türü"
            value={selectedKind}
            onChange={(event) =>
              onKindChange(event.target.value as RequiredDocumentKind)
            }
            helperText={
              selectedRequirement?.required
                ? "Bu belge zorunlu belgeler arasında."
                : "Bu belge isteğe bağlı olarak eklenebilir."
            }
            fullWidth
            sx={premiumFieldSx}
          >
            {allOptions.map((item) => (
              <MenuItem key={item.kind} value={item.kind}>
                {item.title}
                {item.required ? " · Zorunlu" : ""}
              </MenuItem>
            ))}
          </TextField>

          <Box>
            <input
              ref={inputRef}
              type="file"
              hidden
              accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff"
              onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
            />

            <Box
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              sx={{
                minHeight: 56,
                px: 1.5,
                py: 1,
                borderRadius: 3.25,
                border: `1px solid ${alpha(theme.palette.divider, 0.86)}`,
                bgcolor: alpha(theme.palette.background.default, 0.35),
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                transition: "all 160ms ease",
                "&:hover": {
                  borderColor: alpha(theme.palette.primary.main, 0.35),
                  bgcolor: alpha(theme.palette.primary.main, 0.035),
                },
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: "primary.main",
                  flexShrink: 0,
                }}
              >
                <IconUpload size={18} />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={900} noWrap>
                  {selectedFile ? selectedFile.name : "Dosya seçin"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedFile
                    ? formatFileSize(selectedFile.size)
                    : "PDF, JPG, PNG, TIF · En fazla 10 MB"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <TextField
          label="Açıklama"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="İsteğe bağlı kısa açıklama yazabilirsiniz."
          helperText="Bu alan zorunlu değildir."
          fullWidth
          sx={premiumFieldSx}
        />

        {selectedRequirement && (
          <InlineNotice tone="info">{selectedRequirement.description}</InlineNotice>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.5}
        >
          <Typography variant="body2" color="text.secondary">
            Eklenen belgeler aşağıdaki listede görünecektir.
          </Typography>

          <Button
            variant="contained"
            disabled={!canAdd}
            onClick={onAdd}
            startIcon={<IconUpload size={17} />}
            sx={{
              height: 46,
              borderRadius: 999,
              px: 2.75,
              textTransform: "none",
              fontWeight: 950,
              boxShadow: canAdd
                ? "0 10px 22px rgba(37, 99, 235, 0.2)"
                : "none",
            }}
          >
            Belgeyi Ekle
          </Button>
        </Stack>
      </Stack>
    </SectionCard>
  );
}