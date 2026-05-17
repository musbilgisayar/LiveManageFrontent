"use client";

import { Stack, TextField } from "@mui/material";
import { IconInfoCircle } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import SectionCard from "./shared/SectionCard";
import SummaryPanel from "./SummaryPanel";
import LegalConsentBox from "./LegalConsentBox";

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

const NS = "property:managementApplication.create.review";

export default function ReviewStep({
  form,
  errors,
  blockCount,
  totalApartmentCount,
  summaryAddress,
  uploadedFiles,
  onPatch,
}: ReviewStepProps) {
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
        title={tr("note.title", "Başvuru açıklaması")}
        description={tr(
          "note.description",
          "Eklemek istediğiniz özel bir not varsa yazabilirsiniz.",
        )}
      >
        <TextField
          label={tr("note.field", "Açıklama")}
          value={form.note}
          onChange={(event) => onPatch("note", event.target.value)}
          helperText={tr("note.helper", "Bu alan zorunlu değildir.")}
          multiline
          minRows={4}
          fullWidth
          sx={premiumFieldSx}
        />
      </SectionCard>

      <SummaryPanel
        items={[
          { label: tr("summary.structureType", "Yapı tipi"), value: structureLabel },
          { label: tr("summary.propertyName", "Yapı adı"), value: form.propertyName || "-" },
          { label: tr("summary.representation", "Temsil"), value: representationLabel },
          { label: tr("summary.authorizedPerson", "Yetkili kişi"), value: form.contactFullName || "-" },
          { label: tr("summary.authorityStart", "Yetki başlangıcı"), value: form.authorityStartDate || "-" },
          {
            label: tr("summary.authorityEnd", "Yetki bitişi"),
            value:
              form.authorityEndDate ||
              tr("summary.noEndDate", "Süresiz / belirtilmedi"),
          },
          { label: tr("summary.address", "Adres"), value: summaryAddress || "-" },
          { label: tr("summary.blockCount", "Blok sayısı"), value: `${blockCount}` },
          {
            label: tr("summary.totalApartmentCount", "Toplam daire sayısı"),
            value: `${totalApartmentCount}`,
          },
          {
            label: tr("summary.uploadedDocument", "Eklenen belge"),
            value: tr("summary.documentCount", "{count} belge").replace(
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