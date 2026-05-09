"use client";

import React from "react";

import {
  Stack,
} from "@mui/material";

import {
  IconUser,
} from "@tabler/icons-react";

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
  return (
    <SectionCard
      title="Başvuru Sahibi"
      icon={<IconUser size={19} />}
    >
      <InfoRow
        label="Ad Soyad"
        value={applicant.fullName}
      />

      <InfoRow
        label="E-posta"
        value={applicant.email}
      />

      <InfoRow
        label="Telefon"
        value={applicant.phone}
      />

      <InfoRow
        label="Kimlik No"
        value={applicant.identityNumberMasked}
      />

      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
      >
        {/* sonra CheckChip componenti bağlanacak */}
      </Stack>
    </SectionCard>
  );
}