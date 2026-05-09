"use client";

import React from "react";
import { Stack } from "@mui/material";

import InlineNotice from "./shared/InlineNotice";
import DocumentRequirementSummary from "./DocumentRequirementSummary";
import CompactDocumentUploader from "./CompactDocumentUploader";
import UploadedDocumentList from "./UploadedDocumentList";
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
  return (
    <Stack spacing={3}>
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

      <UploadedDocumentList files={uploadedFiles} onRemove={onRemove} />

      {error && <InlineNotice tone="warning">{error}</InlineNotice>}
    </Stack>
  );
}