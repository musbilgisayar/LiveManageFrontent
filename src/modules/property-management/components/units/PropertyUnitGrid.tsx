"use client";

import React from "react";
import { Box } from "@mui/material";
import type { PropertyUnit } from "../../types/PropertyUnit.types";
import PropertyUnitCard from "./PropertyUnitCard";

type Props = {
  units: PropertyUnit[];
  propertyId: string;
  onEdit: (unit: PropertyUnit) => void;
  onDelete: (unitId: string) => void;
};

export default function PropertyUnitGrid({
  units,
  propertyId,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr",
          xl: "repeat(3, 1fr)",
        },
        gap: 2,
      }}
    >
      {units.map((unit) => (
        <PropertyUnitCard
          key={unit.id}
          unit={unit}
          propertyId={propertyId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
}