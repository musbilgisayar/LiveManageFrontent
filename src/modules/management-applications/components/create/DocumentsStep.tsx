// src/modules/management-applications/components/create/DocumentsStep.tsx
"use client";

import React from "react";

import { alpha, Box, Stack, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";

import CompactDocumentUploader from "./CompactDocumentUploader";
import DocumentRequirementSummary from "./DocumentRequirementSummary";
import InlineNotice from "./shared/InlineNotice";
import UploadedDocumentList from "./UploadedDocumentList";
import UploadSecurityBadge from "./upload/UploadSecurityBadge";

import type {
  DocumentRequirement,
  RequiredDocumentKind,
  UploadedFileItem,
} from "../../types/managementApplication.types";

type DocumentsStepProps = {
  requirements: DocumentRequirement[];
  uploadedKindCounts: Record<RequiredDocumentKind, number>;
  uploadedFiles: UploadedFileItem[];
  selectedKind: RequiredDocumentKind;
  selectedFile: File | null;
  description: string;
  error?: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onKindChange: (kind: RequiredDocumentKind) => void;
  onFileChange: (file: File | null) => void;
  onDescriptionChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
};

export default function DocumentsStep({
  requirements,
  uploadedKindCounts,
  uploadedFiles,
  selectedKind,
  selectedFile,
  description,
  error,
  inputRef,
  onKindChange,
  onFileChange,
  onDescriptionChange,
  onAdd,
  onRemove,
}: DocumentsStepProps) {
  const theme = useTheme<Theme>();

  return (
    <Stack spacing={2.2}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "0.95fr 1.45fr",
          },
          gap: 2.2,
          alignItems: "stretch",
        }}
      >
        <DocumentRequirementSummary
          requirements={requirements}
          uploadedKindCounts={uploadedKindCounts}
        />

        <CompactDocumentUploader
          requirements={requirements}
          selectedKind={selectedKind}
          selectedFile={selectedFile}
          description={description}
          onKindChange={onKindChange}
          onFileChange={onFileChange}
          onDescriptionChange={onDescriptionChange}
          onAdd={onAdd}
          inputRef={inputRef}
        />
      </Box>

      <UploadSecurityBadge />

      <UploadedDocumentList files={uploadedFiles} onRemove={onRemove} />

      {error && (
        <Box
          sx={{
            borderRadius: 4,
            boxShadow: `0 14px 34px ${alpha(
              theme.palette.warning.main,
              0.08,
            )}`,
          }}
        >
          <InlineNotice tone="warning">{error}</InlineNotice>
        </Box>
      )}
    </Stack>
  );
}