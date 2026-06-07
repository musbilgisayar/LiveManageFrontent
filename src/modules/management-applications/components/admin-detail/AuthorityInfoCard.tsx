"use client";

import React from "react";

import { Stack } from "@mui/material";

import { IconUserShield } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import SectionCard from "./shared/SectionCard";
import InfoRow from "./shared/InfoRow";

import type {
  AdminApplicationAuthority,
} from "../../types/adminManagementApplication.types";

type AuthorityInfoCardProps = {
  authority: AdminApplicationAuthority;
};

export default function AuthorityInfoCard({
  authority,
}: AuthorityInfoCardProps) {
  const { t } = useI18nNs("management-applications");

  return (
    <SectionCard
      title={t("admin.detail.authority.title")}
      description={t("admin.detail.authority.description")}
      icon={<IconUserShield size={19} />}
    >
      <Stack spacing={1}>
        <InfoRow
          label={t("admin.detail.authority.representationType")}
          value={authority.representationType}
        />

        <InfoRow
          label={t("admin.detail.authority.requestedRole")}
          value={authority.requestedRole}
        />

        <InfoRow
          label={t("admin.detail.authority.authorityStartDate")}
          value={authority.authorityStartDate}
        />

        <InfoRow
          label={t("admin.detail.authority.authorityEndDate")}
          value={
            authority.authorityEndDate ||
            t("admin.detail.common.notProvided")
          }
        />

 
      </Stack>
    </SectionCard>
  );
}