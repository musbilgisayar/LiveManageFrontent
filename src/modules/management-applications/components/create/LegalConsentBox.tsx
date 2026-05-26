// src/modules/management-applications/components/create/LegalConsentBox.tsx
"use client";

import {
  alpha,
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconShieldCheck } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import InlineNotice from "./shared/InlineNotice";
import SectionCard from "./shared/SectionCard";

import type {
  ManagementApplicationFormErrors as FormErrors,
  ManagementApplicationFormState as FormState,
} from "../../types/managementApplication.types";

type LegalConsentBoxProps = {
  form: FormState;
  errors: FormErrors;
  onPatch: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
};

const I18N_PREFIX = "management-applications";

const KEYS = {
  title: "management-applications:create.legalConsent.title",
  description: "management-applications:create.legalConsent.description",
  accuracy: "management-applications:create.legalConsent.accuracy",
  authority: "management-applications:create.legalConsent.authority",
  privacy: "management-applications:create.legalConsent.privacy",
  contract: "management-applications:create.legalConsent.contract",
} as const;

export default function LegalConsentBox({
  form,
  errors,
  onPatch,
}: LegalConsentBoxProps) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs(I18N_PREFIX);

  const hasError = !!errors.consents;

  const tr = (fullKey: string, fallback: string) => {
    const value = t(fullKey);

    if (!value) return fallback;
    if (value === fullKey) return fallback;
    if (value === `[${fullKey}]`) return fallback;

    return value;
  };

  return (
    <SectionCard
      icon={<IconShieldCheck size={19} />}
      title={tr(KEYS.title, "Beyan ve onaylar")}
      description={tr(
        KEYS.description,
        "Başvurunuzu göndermek için aşağıdaki onayları tamamlayın.",
      )}
    >
      <Stack
        spacing={0.6}
        sx={{
          p: hasError ? 1.25 : 0,
          borderRadius: 2.5,
          border: hasError
            ? `1px solid ${alpha(theme.palette.error.main, 0.64)}`
            : "1px solid transparent",
          bgcolor: hasError
            ? alpha(theme.palette.error.main, 0.035)
            : "transparent",
          transition: "all 160ms ease",
        }}
      >
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
            KEYS.accuracy,
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
            KEYS.authority,
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
            KEYS.privacy,
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
            KEYS.contract,
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