"use client";

import { Box, Stack, TextField } from "@mui/material";
import { IconHome, IconMapPin } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import SectionCard from "./shared/SectionCard";
import InlineNotice from "./shared/InlineNotice";
import AddressHierarchySection from "./AddressHierarchySection";

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

const NS = "property:managementApplication.create.address";

export default function AddressAndBuildingStep({
  form,
  errors,
  blockCount,
  totalApartmentCount,
  onPatch,
  onAddressChange,
}: AddressAndBuildingStepProps) {
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
        title={tr("address.title", "Adres bilgileri")}
        description={tr(
          "address.description",
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
        title={tr("scale.title", "Yapı ölçeği")}
        description={tr(
          "scale.description",
          "Başvuru yapılan yapının blok ve daire bilgisini girin.",
        )}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              type="number"
              label={tr("fields.blockCount", "Blok sayısı")}
              value={form.blockCount}
              onChange={(event) => onPatch("blockCount", event.target.value)}
              error={!!errors.blockCount}
              helperText={
                errors.blockCount ??
                tr("fields.blockCountHint", "Yapıdaki toplam blok sayısı")
              }
              fullWidth
              sx={premiumFieldSx}
            />

            <TextField
              type="number"
              label={tr("fields.totalApartmentCount", "Toplam daire sayısı")}
              value={form.totalApartmentCount}
              onChange={(event) =>
                onPatch("totalApartmentCount", event.target.value)
              }
              error={!!errors.totalApartmentCount}
              helperText={
                errors.totalApartmentCount ??
                tr(
                  "fields.totalApartmentCountHint",
                  "Yapıdaki toplam daire sayısı",
                )
              }
              fullWidth
              sx={premiumFieldSx}
            />
          </Box>

          <InlineNotice tone="info">
            {structureLabel} ·{" "}
            {form.propertyName || tr("summary.noPropertyName", "Yapı adı girilmedi")}{" "}
            · {blockCount || 0} {tr("summary.blocks", "blok")} ·{" "}
            {totalApartmentCount || 0} {tr("summary.apartments", "daire")}
          </InlineNotice>
        </Stack>
      </SectionCard>
    </Stack>
  );
}