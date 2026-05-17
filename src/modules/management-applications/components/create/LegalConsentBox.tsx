"use client";

import { Box, Checkbox, FormControlLabel, Stack } from "@mui/material";
import { IconShieldCheck } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

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

const NS = "property:managementApplication.create.legalConsent";

export default function LegalConsentBox({
  form,
  errors,
  onPatch,
}: LegalConsentBoxProps) {
  const { t } = useI18nNs(["property"]);

  const tr = (key: string, fallback: string) => {
    const fullKey = `${NS}.${key}`;
    const value = t(fullKey);
    return value && value !== fullKey ? value : fallback;
  };

  return (
    <SectionCard
      icon={<IconShieldCheck size={19} />}
      title={tr("title", "Beyan ve onaylar")}
      description={tr(
        "description",
        "Başvurunuzu göndermek için aşağıdaki onayları tamamlayın.",
      )}
    >
      <Stack spacing={0.6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={form.consentAccuracy}
              onChange={(event) =>
                onPatch("consentAccuracy", event.target.checked)
              }
            />
          }
          label={tr(
            "accuracy",
            "Beyan ettiğim bilgilerin doğru ve güncel olduğunu kabul ediyorum.",
          )}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.consentAuthority}
              onChange={(event) =>
                onPatch("consentAuthority", event.target.checked)
              }
            />
          }
          label={tr(
            "authority",
            "İlgili yapı adına başvuru yapmaya yetkili olduğumu beyan ediyorum.",
          )}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.consentPrivacy}
              onChange={(event) =>
                onPatch("consentPrivacy", event.target.checked)
              }
            />
          }
          label={tr(
            "privacy",
            "Aydınlatma metnini okudum ve başvuru kapsamında veri işleme sürecini anladım.",
          )}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.consentContract}
              onChange={(event) =>
                onPatch("consentContract", event.target.checked)
              }
            />
          }
          label={tr(
            "contract",
            "Hizmet sözleşmesi ve platform koşullarını kabul ediyorum.",
          )}
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