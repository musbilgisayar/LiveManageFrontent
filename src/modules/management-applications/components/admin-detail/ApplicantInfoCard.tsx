//src/modules/management-applications/components/admin-detail/ApplicantInfoCard.tsx
//bu dosya, başvuru sahibinin bilgilerini gösteren bir kart bileşenidir. Başvuru sahibinin adı, e-posta adresi, telefon numarası, başvuru türü, kimlik numarası, vergi numarası ve mersis numarası gibi bilgileri içerir. Ayrıca, e-posta ve telefon doğrulama durumlarını göstermek için iki adet Chip bileşeni kullanır. Bu bileşen, yönetim uygulamalarının admin detay sayfasında kullanılır.
"use client";

import React from "react";

import { Chip, Stack } from "@mui/material";

import {
  IconMailCheck,
  IconPhoneCheck,
  IconUser,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import SectionCard from "./shared/SectionCard";
import InfoRow from "./shared/InfoRow";

import type {
  AdminApplicationApplicant,
} from "../../types/adminManagementApplication.types";
import { normalizeAdminApplicantTypeLabel } from "../../utils/adminManagementApplication.utils";

type ApplicantInfoCardProps = {
  applicant: AdminApplicationApplicant;
  applicantType?: number | string | null;
  identityNumberMasked?: string | null;
  taxNumberMasked?: string | null;
  mersisNumberMasked?: string | null;
};

const LABEL_FALLBACKS: Record<string, string> = {
  "admin.detail.applicant.applicantType": "Başvuru Sahibi Türü",
  "admin.detail.applicant.taxNumber": "Vergi No",
  "admin.detail.applicant.mersisNumber": "MERSİS No",
};

function withLabelFallback(value: string, key: string): string {
  if (value === `[management-applications:${key}]` || value === `[${key}]`) {
    return LABEL_FALLBACKS[key] ?? key;
  }

  return value;
}

export default function ApplicantInfoCard({
  applicant,
  applicantType,
  identityNumberMasked,
  taxNumberMasked,
  mersisNumberMasked,
}: ApplicantInfoCardProps) {
  const { t } = useI18nNs("management-applications");
  const label = (key: string) => withLabelFallback(t(key), key);

  return (
    <SectionCard
      title={t("admin.detail.applicant.title")}
      icon={<IconUser size={19} />}
    >
      <Stack spacing={1}>
        <InfoRow
          label={t("admin.detail.applicant.fullName")}
          value={applicant.fullName}
        />

        <InfoRow
          label={t("admin.detail.applicant.email")}
          value={applicant.email}
        />

        <InfoRow
          label={t("admin.detail.applicant.phone")}
          value={applicant.phone}
        />

        <InfoRow
          label={label("admin.detail.applicant.applicantType")}
          value={normalizeAdminApplicantTypeLabel(applicantType)}
        />

        <InfoRow
          label={t("admin.detail.applicant.identityNumber")}
          value={identityNumberMasked ?? applicant.identityNumberMasked}
        />

        <InfoRow
          label={label("admin.detail.applicant.taxNumber")}
          value={taxNumberMasked}
        />

        <InfoRow
          label={label("admin.detail.applicant.mersisNumber")}
          value={mersisNumberMasked}
        />

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ pt: 0.75 }}
        >
          <Chip
            size="small"
            icon={<IconMailCheck size={15} />}
            label={
              applicant.isEmailVerified
                ? t("admin.detail.applicant.emailVerified")
                : t("admin.detail.applicant.emailNotVerified")
            }
            color={applicant.isEmailVerified ? "success" : "warning"}
            variant="outlined"
            sx={{
              fontWeight: 800,
              borderRadius: 999,
            }}
          />

          <Chip
            size="small"
            icon={<IconPhoneCheck size={15} />}
            label={
              applicant.isPhoneVerified
                ? t("admin.detail.applicant.phoneVerified")
                : t("admin.detail.applicant.phoneNotVerified")
            }
            color={applicant.isPhoneVerified ? "success" : "warning"}
            variant="outlined"
            sx={{
              fontWeight: 800,
              borderRadius: 999,
            }}
          />
        </Stack>
      </Stack>
    </SectionCard>
  );
}
