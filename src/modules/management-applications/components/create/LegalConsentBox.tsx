"use client";

import { Box, Checkbox, FormControlLabel, Stack } from "@mui/material";
import { IconShieldCheck } from "@tabler/icons-react";

import SectionCard from "./shared/SectionCard";
import InlineNotice from "./shared/InlineNotice";
import type {
  ManagementApplicationFormErrors as FormErrors,
  ManagementApplicationFormState as FormState,
} from "../../types/managementApplication.types";

type LegalConsentBoxProps = {
  form: FormState;
  errors: FormErrors;
  onPatch: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
};

export default function LegalConsentBox({
  form,
  errors,
  onPatch,
}: LegalConsentBoxProps) {
  return (
    <SectionCard
      icon={<IconShieldCheck size={19} />}
      title="Beyan ve onaylar"
      description="Başvurunuzu göndermek için aşağıdaki onayları tamamlayın."
    >
      <Stack spacing={0.6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={form.consentAccuracy}
              onChange={(event) => onPatch("consentAccuracy", event.target.checked)}
            />
          }
          label="Beyan ettiğim bilgilerin doğru ve güncel olduğunu kabul ediyorum."
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.consentAuthority}
              onChange={(event) => onPatch("consentAuthority", event.target.checked)}
            />
          }
          label="İlgili yapı adına başvuru yapmaya yetkili olduğumu beyan ediyorum."
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.consentPrivacy}
              onChange={(event) => onPatch("consentPrivacy", event.target.checked)}
            />
          }
          label="Aydınlatma metnini okudum ve başvuru kapsamında veri işleme sürecini anladım."
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.consentContract}
              onChange={(event) => onPatch("consentContract", event.target.checked)}
            />
          }
          label="Hizmet sözleşmesi ve platform koşullarını kabul ediyorum."
        />
      </Stack>

      {errors.consents && (
        <Box sx={{ mt: 1.5 }}>
          <InlineNotice tone="warning">{errors.consents}</InlineNotice>
        </Box>
      )}
    </SectionCard>
  );
}