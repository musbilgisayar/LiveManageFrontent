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
  totalApartmentCount: number;
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

  totalApartmentCount:
    "management-applications:create.address.fields.totalApartmentCount",
  totalApartmentCountHint:
    "management-applications:create.address.fields.totalApartmentCountHint",

  noPropertyName:
    "management-applications:create.address.summary.noPropertyName",
  blocks: "management-applications:create.address.summary.blocks",
  apartments: "management-applications:create.address.summary.apartments",
} as const;

export default function AddressAndBuildingStep({
  form,
  errors,
  blockCount,
  totalApartmentCount,
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
          "Başvuru yapılan yapının blok ve daire bilgisini girin.",
        )}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
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
              label={tr(KEYS.totalApartmentCount, "Toplam daire sayısı")}
              value={form.totalApartmentCount}
              onChange={(event) =>
                onPatch("totalApartmentCount", event.target.value)
              }
              error={!!errors.totalApartmentCount}
              helperText={
                errors.totalApartmentCount ||
                tr(
                  KEYS.totalApartmentCountHint,
                  "Yapıdaki toplam daire sayısı",
                )
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
            {totalApartmentCount || 0} {tr(KEYS.apartments, "daire")}
          </InlineNotice>
        </Stack>
      </SectionCard>
    </Stack>
  );
}