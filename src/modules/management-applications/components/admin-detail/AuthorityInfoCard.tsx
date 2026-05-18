"use client";

import React from "react";

import {
  Box,
  Typography,
} from "@mui/material";

import {
  IconUserShield,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import SectionCard from "./shared/SectionCard";
import InfoBox from "./shared/InfoBox";

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
      icon={<IconUserShield size={19} />}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 1.25,
        }}
      >
        <InfoBox
          label={t("admin.detail.authority.representationType")}
          value={authority.representationType}
        />

        <InfoBox
          label={t("admin.detail.authority.requestedRole")}
          value={authority.requestedRole}
        />

        <InfoBox
          label={t("admin.detail.authority.authorityStartDate")}
          value={authority.authorityStartDate}
        />

        <InfoBox
          label={t("admin.detail.authority.authorityEndDate")}
          value={
            authority.authorityEndDate ||
            t("admin.detail.common.notProvided")
          }
        />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={800}
        >
          {t("admin.detail.authority.authorityScope")}
        </Typography>

        <Typography
          fontWeight={750}
          sx={{ mt: 0.35 }}
        >
          {authority.authorityScope ||
            t("admin.detail.common.notProvided")}
        </Typography>
      </Box>
    </SectionCard>
  );
}