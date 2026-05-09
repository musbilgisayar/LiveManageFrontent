"use client";

import React from "react";

import {
  Box,
  Typography,
} from "@mui/material";

import {
  IconUserShield,
} from "@tabler/icons-react";

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
  return (
    <SectionCard
      title="Yetki ve Temsil Bilgileri"
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
          label="Temsil şekli"
          value={authority.representationType}
        />

        <InfoBox
          label="Talep edilen rol"
          value={authority.requestedRole}
        />

        <InfoBox
          label="Yetki başlangıcı"
          value={authority.authorityStartDate}
        />

        <InfoBox
          label="Yetki bitişi"
          value={authority.authorityEndDate ?? "-"}
        />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={800}
        >
          Yetki kapsamı
        </Typography>

        <Typography
          fontWeight={750}
          sx={{ mt: 0.35 }}
        >
          {authority.authorityScope}
        </Typography>
      </Box>
    </SectionCard>
  );
}