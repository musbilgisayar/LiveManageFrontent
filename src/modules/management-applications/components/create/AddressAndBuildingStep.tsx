// src/modules/management-applications/components/create/AddressAndBuildingStep.tsx
"use client";

import { Box, Stack, TextField } from "@mui/material";
import { IconHome, IconMapPin } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import AddressHierarchySection from "./AddressHierarchySection";
import InlineNotice from "./shared/InlineNotice";
import SectionCard from "./shared/SectionCard";

import { premiumFieldSx, structureOptions } from "./constants";

import type {
  ManagementApplicationAddressForm as AddressForm,
  ManagementApplicationFormErrors as FormErrors,
  ManagementApplicationFormState as FormState,
} from "../../types/managementApplication.types";

type AddressAndBuildingStepProps = {
  form: FormState;
  errors: FormErrors;
  blockCount: number;
  residentialUnitCount: number;
  commercialUnitCount: number;
  totalUnitCount: number;
  onPatch: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onAddressChange: (next: AddressForm) => void;
};

const I18N_PREFIX = "management-applications";

const KEYS = {
  addressTitle: "management-applications:create.address.address.title",
  addressDescription:
    "management-applications:create.address.address.description",

  scaleTitle: "management-applications:create.address.scale.title",
  scaleDescription: "management-applications:create.address.scale.description",

  blockCount: "management-applications:create.address.fields.blockCount",
  blockCountHint:
    "management-applications:create.address.fields.blockCountHint",

  residentialUnitCount:
    "management-applications:create.address.fields.residentialUnitCount",
  residentialUnitCountHint:
    "management-applications:create.address.fields.residentialUnitCountHint",

  commercialUnitCount:
    "management-applications:create.address.fields.commercialUnitCount",
  commercialUnitCountHint:
    "management-applications:create.address.fields.commercialUnitCountHint",

  noPropertyName:
    "management-applications:create.address.summary.noPropertyName",
  blocks: "management-applications:create.address.summary.blocks",
  residentialUnits:
    "management-applications:create.address.summary.residentialUnits",
  commercialUnits:
    "management-applications:create.address.summary.commercialUnits",
  totalUnits:
    "management-applications:create.address.summary.totalUnits",
} as const;

export default function AddressAndBuildingStep({
  form,
  errors,
  blockCount,
  residentialUnitCount,
  commercialUnitCount,
  totalUnitCount,
  onPatch,
  onAddressChange,
}: AddressAndBuildingStepProps) {
  const { t } = useI18nNs(I18N_PREFIX);

  const tr = (fullKey: string, fallback: string) => {
    const value = t(fullKey);

    if (!value) return fallback;
    if (value === fullKey) return fallback;
    if (value === `[${fullKey}]`) return fallback;

    return value;
  };

  const trDirect = (fullKey: string, fallback: string) => {
    const value = t(fullKey);

    if (!value) return fallback;
    if (value === fullKey) return fallback;
    if (value === `[${fullKey}]`) return fallback;

    return value;
  };

  const selectedStructure = structureOptions.find(
    (item) => item.value === form.structureType,
  );

  const structureLabel = selectedStructure
    ? trDirect(selectedStructure.labelKey, selectedStructure.fallbackLabel)
    : "-";

  return (
    <Stack spacing={3}>
      <SectionCard
        icon={<IconMapPin size={19} />}
        title={tr(KEYS.addressTitle, "Adres bilgileri")}
        description={tr(
          KEYS.addressDescription,
          "Adresinizi hiyerarşik seçimlerle tamamlayın.",
        )}
      >
        <AddressHierarchySection
          value={form.address}
          onChange={onAddressChange}
          errors={errors}
        />
      </SectionCard>

      <SectionCard
        icon={<IconHome size={19} />}
        title={tr(KEYS.scaleTitle, "Yapı ölçeği")}
        description={tr(
          KEYS.scaleDescription,
          "Başvuru yapılan yapının konut, ticari bölüm ve blok bilgisini girin.",
        )}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr 1fr",
              },
              gap: 2,
            }}
          >
            <TextField
              type="number"
              label={tr(KEYS.blockCount, "Blok sayısı")}
              value={form.blockCount}
              onChange={(event) => onPatch("blockCount", event.target.value)}
              error={!!errors.blockCount}
              helperText={
                errors.blockCount ||
                tr(KEYS.blockCountHint, "Yapıdaki toplam blok sayısı")
              }
              fullWidth
              sx={premiumFieldSx}
            />

            <TextField
              type="number"
              label={tr(
                KEYS.residentialUnitCount,
                "Konut bağımsız bölüm sayısı",
              )}
              value={form.residentialUnitCount}
              onChange={(event) =>
                onPatch("residentialUnitCount", event.target.value)
              }
              error={!!errors.residentialUnitCount}
              helperText={
                errors.residentialUnitCount ||
                tr(KEYS.residentialUnitCountHint, "Konut sayısını girin")
              }
              fullWidth
              sx={premiumFieldSx}
            />

            <TextField
              type="number"
              label={tr(
                KEYS.commercialUnitCount,
                "Ticari bağımsız bölüm sayısı",
              )}
              value={form.commercialUnitCount}
              onChange={(event) =>
                onPatch("commercialUnitCount", event.target.value)
              }
              error={!!errors.commercialUnitCount}
              helperText={
                errors.commercialUnitCount ||
                tr(KEYS.commercialUnitCountHint, "Ticari bölüm sayısını girin")
              }
              fullWidth
              sx={premiumFieldSx}
            />
          </Box>

          <InlineNotice tone="info">
            {structureLabel} ·{" "}
            {form.propertyName ||
              tr(KEYS.noPropertyName, "Yapı adı girilmedi")}{" "}
            · {blockCount || 0} {tr(KEYS.blocks, "blok")} ·{" "}
            {residentialUnitCount || 0}{" "}
            {tr(KEYS.residentialUnits, "konut")} ·{" "}
            {commercialUnitCount || 0}{" "}
            {tr(KEYS.commercialUnits, "ticari")} ·{" "}
            {totalUnitCount || 0} {tr(KEYS.totalUnits, "toplam bölüm")}
          </InlineNotice>
        </Stack>
      </SectionCard>
    </Stack>
  );
}