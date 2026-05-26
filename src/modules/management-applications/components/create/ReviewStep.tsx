// src/modules/management-applications/components/create/ReviewStep.tsx
"use client";

import { Stack, TextField } from "@mui/material";
import { IconInfoCircle } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import LegalConsentBox from "./LegalConsentBox";
import SectionCard from "./shared/SectionCard";
import SummaryPanel from "./SummaryPanel";

import {
  premiumFieldSx,
  representationOptions,
  structureOptions,
} from "./constants";

import type {
  ManagementApplicationFormErrors as FormErrors,
  ManagementApplicationFormState as FormState,
  UploadedFileItem,
} from "../../types/managementApplication.types";

type ReviewStepProps = {
  form: FormState;
  errors: FormErrors;
  blockCount: number;
  totalApartmentCount: number;
  summaryAddress: string;
  uploadedFiles: UploadedFileItem[];
  onPatch: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
};

const I18N_PREFIX = "management-applications";

const KEYS = {
  noteTitle: "management-applications:create.review.note.title",
  noteDescription: "management-applications:create.review.note.description",
  noteField: "management-applications:create.review.note.field",
  noteHelper: "management-applications:create.review.note.helper",

  summaryStructureType:
    "management-applications:create.review.summary.structureType",
  summaryPropertyName:
    "management-applications:create.review.summary.propertyName",
  summaryRepresentation:
    "management-applications:create.review.summary.representation",
  summaryAuthorizedPerson:
    "management-applications:create.review.summary.authorizedPerson",
  summaryAuthorityStart:
    "management-applications:create.review.summary.authorityStart",
  summaryAuthorityEnd:
    "management-applications:create.review.summary.authorityEnd",
  summaryNoEndDate:
    "management-applications:create.review.summary.noEndDate",
  summaryAddress: "management-applications:create.review.summary.address",
  summaryBlockCount:
    "management-applications:create.review.summary.blockCount",
  summaryTotalApartmentCount:
    "management-applications:create.review.summary.totalApartmentCount",
  summaryUploadedDocument:
    "management-applications:create.review.summary.uploadedDocument",
  summaryDocumentCount:
    "management-applications:create.review.summary.documentCount",
} as const;

export default function ReviewStep({
  form,
  errors,
  blockCount,
  totalApartmentCount,
  summaryAddress,
  uploadedFiles,
  onPatch,
}: ReviewStepProps) {
  const { t } = useI18nNs(I18N_PREFIX);

  const tr = (fullKey: string, fallback: string) => {
    const value = t(fullKey);

    if (!value) return fallback;
    if (value === fullKey) return fallback;
    if (value === `[${fullKey}]`) return fallback;

    return value;
  };

  const trDirect = (key: string, fallback: string) => {
    const value = t(key);

    if (!value) return fallback;
    if (value === key) return fallback;
    if (value === `[${key}]`) return fallback;

    return value;
  };

  const structure = structureOptions.find(
    (item) => item.value === form.structureType,
  );

  const representation = representationOptions.find(
    (item) => item.value === form.representationType,
  );

  const structureLabel = structure
    ? trDirect(structure.labelKey, structure.fallbackLabel)
    : "-";

  const representationLabel = representation
    ? trDirect(representation.labelKey, representation.fallbackLabel)
    : "-";

  return (
    <Stack spacing={3}>
      <SectionCard
        icon={<IconInfoCircle size={19} />}
        title={tr(KEYS.noteTitle, "Başvuru açıklaması")}
        description={tr(
          KEYS.noteDescription,
          "Eklemek istediğiniz özel bir not varsa yazabilirsiniz.",
        )}
      >
        <TextField
          label={tr(KEYS.noteField, "Açıklama")}
          value={form.note}
          onChange={(event) => onPatch("note", event.target.value)}
          helperText={tr(KEYS.noteHelper, "Bu alan zorunlu değildir.")}
          multiline
          minRows={4}
          fullWidth
          sx={premiumFieldSx}
        />
      </SectionCard>

      <SummaryPanel
        items={[
          {
            label: tr(KEYS.summaryStructureType, "Yapı tipi"),
            value: structureLabel,
          },
          {
            label: tr(KEYS.summaryPropertyName, "Yapı adı"),
            value: form.propertyName || "-",
          },
          {
            label: tr(KEYS.summaryRepresentation, "Temsil"),
            value: representationLabel,
          },
          {
            label: tr(KEYS.summaryAuthorizedPerson, "Yetkili kişi"),
            value: form.contactFullName || "-",
          },
          {
            label: tr(KEYS.summaryAuthorityStart, "Yetki başlangıcı"),
            value: form.authorityStartDate || "-",
          },
          {
            label: tr(KEYS.summaryAuthorityEnd, "Yetki bitişi"),
            value:
              form.authorityEndDate ||
              tr(KEYS.summaryNoEndDate, "Süresiz / belirtilmedi"),
          },
          {
            label: tr(KEYS.summaryAddress, "Adres"),
            value: summaryAddress || "-",
          },
          {
            label: tr(KEYS.summaryBlockCount, "Blok sayısı"),
            value: `${blockCount}`,
          },
          {
            label: tr(KEYS.summaryTotalApartmentCount, "Toplam daire sayısı"),
            value: `${totalApartmentCount}`,
          },
          {
            label: tr(KEYS.summaryUploadedDocument, "Eklenen belge"),
            value: tr(KEYS.summaryDocumentCount, "{count} belge").replace(
              "{count}",
              String(uploadedFiles.length),
            ),
          },
        ]}
      />

      <LegalConsentBox form={form} errors={errors} onPatch={onPatch} />
    </Stack>
  );
}