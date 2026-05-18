"use client";

import React from "react";

import {
  Chip,
  Stack,
} from "@mui/material";

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

type ApplicantInfoCardProps = {
  applicant: AdminApplicationApplicant;
};

export default function ApplicantInfoCard({
  applicant,
}: ApplicantInfoCardProps) {
  const { t } = useI18nNs("management-applications");

  return (
    <SectionCard
      title={t("admin.detail.applicant.title")}
      icon={<IconUser size={19} />}
    >
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
        label={t("admin.detail.applicant.identityNumber")}
        value={applicant.identityNumberMasked}
      />

      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
      >
        <Chip
          size="small"
          icon={<IconMailCheck size={15} />}
          label={
            applicant.emailVerified
              ? t("admin.detail.applicant.emailVerified")
              : t("admin.detail.applicant.emailNotVerified")
          }
          color={applicant.emailVerified ? "success" : "warning"}
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
            applicant.phoneVerified
              ? t("admin.detail.applicant.phoneVerified")
              : t("admin.detail.applicant.phoneNotVerified")
          }
          color={applicant.phoneVerified ? "success" : "warning"}
          variant="outlined"
          sx={{
            fontWeight: 800,
            borderRadius: 999,
          }}
        />
      </Stack>
    </SectionCard>
  );
}