"use client";

import { Box, Stack, TextField } from "@mui/material";
import { IconHome, IconMapPin } from "@tabler/icons-react";

import SectionCard from "./shared/SectionCard";
import InlineNotice from "./shared/InlineNotice";
import AddressHierarchySection from "./AddressHierarchySection";
import { getStructureLabel, premiumFieldSx } from "./constants";
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

export default function AddressAndBuildingStep({
  form,
  errors,
  blockCount,
  totalApartmentCount,
  onPatch,
  onAddressChange,
}: AddressAndBuildingStepProps) {
  return (
    <Stack spacing={3}>
      <SectionCard
        icon={<IconMapPin size={19} />}
        title="Adres bilgileri"
        description="Adresinizi hiyerarşik seçimlerle tamamlayın."
      >
        <AddressHierarchySection
          value={form.address}
          onChange={onAddressChange}
          errors={errors}
        />
      </SectionCard>

      <SectionCard
        icon={<IconHome size={19} />}
        title="Yapı ölçeği"
        description="Başvuru yapılan yapının blok ve daire bilgisini girin."
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
              label="Blok sayısı"
              value={form.blockCount}
              onChange={(event) => onPatch("blockCount", event.target.value)}
              error={!!errors.blockCount}
              helperText={errors.blockCount ?? "Yapıdaki toplam blok sayısı"}
              fullWidth
              sx={premiumFieldSx}
            />

            <TextField
              type="number"
              label="Toplam daire sayısı"
              value={form.totalApartmentCount}
              onChange={(event) => onPatch("totalApartmentCount", event.target.value)}
              error={!!errors.totalApartmentCount}
              helperText={errors.totalApartmentCount ?? "Yapıdaki toplam daire sayısı"}
              fullWidth
              sx={premiumFieldSx}
            />
          </Box>

          <InlineNotice tone="info">
            Başvuru özeti: {getStructureLabel(form.structureType)} ·{" "}
            {form.propertyName || "Yapı adı girilmedi"} · {blockCount || 0} blok ·{" "}
            {totalApartmentCount || 0} daire
          </InlineNotice>
        </Stack>
      </SectionCard>
    </Stack>
  );
}