"use client";

import React from "react";

import {
  IconHome,
} from "@tabler/icons-react";

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
  return (
    <SectionCard
      title="Gayrimenkul Bilgisi"
      icon={<IconHome size={19} />}
    >
      <InfoRow
        label="Yapı adı"
        value={property.propertyName}
      />

      <InfoRow
        label="Yapı tipi"
        value={property.structureType}
      />

      <InfoRow
        label="Blok sayısı"
        value={String(property.blockCount)}
      />

      <InfoRow
        label="Daire sayısı"
        value={String(property.totalApartmentCount)}
      />

      <InfoRow
        label="Adres"
        value={property.addressSummary}
        wide
      />
    </SectionCard>
  );
}