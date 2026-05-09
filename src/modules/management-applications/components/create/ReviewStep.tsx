"use client";

import { Stack, TextField } from "@mui/material";
import { IconInfoCircle } from "@tabler/icons-react";

import SectionCard from "./shared/SectionCard";
import SummaryPanel from "./SummaryPanel";
import LegalConsentBox from "./LegalConsentBox";
import { getRepresentationLabel, getStructureLabel, premiumFieldSx } from "./constants";
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

export default function ReviewStep({
  form,
  errors,
  blockCount,
  totalApartmentCount,
  summaryAddress,
  uploadedFiles,
  onPatch,
}: ReviewStepProps) {
  return (
    <Stack spacing={3}>
      <SectionCard
        icon={<IconInfoCircle size={19} />}
        title="Başvuru açıklaması"
        description="Eklemek istediğiniz özel bir not varsa yazabilirsiniz."
      >
        <TextField
          label="Açıklama"
          value={form.note}
          onChange={(event) => onPatch("note", event.target.value)}
          helperText="Bu alan zorunlu değildir."
          multiline
          minRows={4}
          fullWidth
          sx={premiumFieldSx}
        />
      </SectionCard>

      <SummaryPanel
        items={[
          { label: "Yapı tipi", value: getStructureLabel(form.structureType) },
          { label: "Yapı adı", value: form.propertyName || "-" },
          { label: "Temsil", value: getRepresentationLabel(form.representationType) },
          { label: "Yetkili kişi", value: form.contactFullName || "-" },
          { label: "Yetki başlangıcı", value: form.authorityStartDate || "-" },
          {
            label: "Yetki bitişi",
            value: form.authorityEndDate || "Süresiz / belirtilmedi",
          },
          { label: "Adres", value: summaryAddress || "-" },
          { label: "Blok sayısı", value: `${blockCount}` },
          { label: "Toplam daire sayısı", value: `${totalApartmentCount}` },
          { label: "Eklenen belge", value: `${uploadedFiles.length} belge` },
        ]}
      />

      <LegalConsentBox form={form} errors={errors} onPatch={onPatch} />
    </Stack>
  );
}