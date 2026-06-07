"use client";

import React from "react";

import { Stack } from "@mui/material";

import { IconHome } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import SectionCard from "./shared/SectionCard";
import InfoRow from "./shared/InfoRow";

import type {
  AdminApplicationProperty,
} from "../../types/adminManagementApplication.types";

type PropertyInfoCardProps = {
  property: AdminApplicationProperty;
};

export default function PropertyInfoCard({
  property,
}: PropertyInfoCardProps) {
  const { t } = useI18nNs("management-applications");

  return (
    <SectionCard
      title={t("admin.detail.property.title")}
      description={t("admin.detail.property.description")}
      icon={<IconHome size={19} />}
    >
      <Stack spacing={1}>
        <InfoRow
          label={t("admin.detail.property.propertyName")}
          value={property.propertyName}
        />

        <InfoRow
          label={t("admin.detail.property.descriptionLabel")}
          value={
            property.description ||
            t("admin.detail.common.notProvided")
          }
          wide
        />

        <InfoRow
          label={t("admin.detail.property.structureType")}
          value={property.structureType}
        />

        <InfoRow
          label={t("admin.detail.property.blockCount")}
          value={property.blockCount}
        />

        <InfoRow
          label={t("admin.detail.property.residentialUnitCount")}
          value={property.residentialUnitCount}
        />

        <InfoRow
          label={t("admin.detail.property.commercialUnitCount")}
          value={property.commercialUnitCount}
        />

        <InfoRow
          label={t("admin.detail.property.totalApartmentCount")}
          value={property.totalApartmentCount}
        />

        <InfoRow
          label={t("admin.detail.property.addressSummary")}
          value={property.addressSummary}
          wide
        />
      </Stack>
    </SectionCard>
  );
}
