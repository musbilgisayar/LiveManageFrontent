"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconDoor,
  IconEdit,
  IconHome,
  IconTrash,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import type { PropertyUnit } from "../../types/PropertyUnit.types";
import {
  buildUnitTitle,
  getUnitTypeLabel,
} from "../../utils/propertyUnit.helpers";

type Props = {
  unit: PropertyUnit;
  propertyId: string;
  onEdit: (unit: PropertyUnit) => void;
  onDelete: (unitId: string) => void;
};

export default function PropertyUnitCard({
  unit,
  propertyId,
  onEdit,
  onDelete,
}: Props) {
  const theme = useTheme<Theme>();
  const router = useRouter();

  const color =
    unit.status === "occupied"
      ? theme.palette.success.main
      : theme.palette.warning.main;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: alpha(color, 0.22),
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Box
            role="button"
            tabIndex={0}
            onClick={() =>
              router.push(`/property-management/${propertyId}/units/${unit.id}`)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                router.push(`/property-management/${propertyId}/units/${unit.id}`);
              }
            }}
            sx={{
              cursor: "pointer",
              borderRadius: 3,
              outline: "none",
              "&:focus-visible": {
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.22)}`,
              },
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2.5,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha(color, 0.1),
                      color,
                    }}
                  >
                    <IconDoor size={20} />
                  </Box>

                  <Box>
                    <Typography fontWeight={900}>{buildUnitTitle(unit)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getUnitTypeLabel(unit.unitType)}
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  size="small"
                  label={unit.status === "occupied" ? "Dolu" : "Boş"}
                  sx={{
                    bgcolor: alpha(color, 0.1),
                    color,
                    fontWeight: 800,
                  }}
                />
              </Stack>

              <Divider />

              <InfoLine icon={<IconUser size={16} />} label="Malik" value={unit.ownerFullName || "-"} />
              <InfoLine icon={<IconUsers size={16} />} label="Oturan" value={unit.residentFullName || "-"} />
              <InfoLine icon={<IconHome size={16} />} label="Aidat" value={unit.duesStatus} />
            </Stack>
          </Box>

          <Stack direction="row" spacing={1} pt={0.5}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<IconEdit size={16} />}
              onClick={() => onEdit(unit)}
            >
              Düzenle
            </Button>

            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<IconTrash size={16} />}
              onClick={() => onDelete(unit.id)}
            >
              Sil
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ color: "text.secondary", display: "flex" }}>{icon}</Box>
      <Typography variant="body2" color="text.secondary">
        {label}:
      </Typography>
      <Typography variant="body2" fontWeight={800}>
        {value}
      </Typography>
    </Stack>
  );
}