"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { PropertyUnit } from "../../types/PropertyUnit.types";
import {
  buildUnitTitle,
  getUnitTypeLabel,
} from "../../utils/propertyUnit.helpers";

type Props = {
  units: PropertyUnit[];
  propertyId: string;
  onEdit: (unit: PropertyUnit) => void;
  onDelete: (unitId: string) => void;
};

export default function PropertyUnitTable({
  units,
  propertyId,
  onEdit,
  onDelete,
}: Props) {
  const router = useRouter();
  const theme = useTheme<Theme>();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: alpha(theme.palette.text.primary, 0.08),
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ minWidth: 980 }}>
            <Box
              sx={{
                px: 2,
                py: 1.25,
                display: "grid",
                gridTemplateColumns:
                  "1.1fr 0.8fr 1.2fr 1.2fr 0.8fr 0.8fr 120px",
                gap: 1,
                bgcolor: alpha(theme.palette.text.primary, 0.035),
                borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
              }}
            >
              {["Bağımsız Bölüm", "Tür", "Malik", "Oturan", "Kira", "Aidat", "İşlem"].map(
                (item) => (
                  <Typography
                    key={item}
                    variant="caption"
                    color="text.secondary"
                    fontWeight={900}
                  >
                    {item}
                  </Typography>
                ),
              )}
            </Box>

            {units.map((unit) => (
              <Box
                key={unit.id}
                sx={{
                  px: 2,
                  py: 1.25,
                  display: "grid",
                  gridTemplateColumns:
                    "1.1fr 0.8fr 1.2fr 1.2fr 0.8fr 0.8fr 120px",
                  gap: 1,
                  alignItems: "center",
                  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Box
                  onClick={() =>
                    router.push(`/property-management/${propertyId}/units/${unit.id}`)
                  }
                  sx={{ cursor: "pointer" }}
                >
                  <Typography fontWeight={900}>{buildUnitTitle(unit)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Kapı No: {unit.unitNumber}
                  </Typography>
                </Box>

                <Chip size="small" label={getUnitTypeLabel(unit.unitType)} variant="outlined" />
                <Typography variant="body2">{unit.ownerFullName || "-"}</Typography>
                <Typography variant="body2">{unit.residentFullName || "-"}</Typography>
                <Typography variant="body2">{unit.rentStatus}</Typography>
                <Typography variant="body2">{unit.duesStatus}</Typography>

                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => onEdit(unit)}>
                    <IconEdit size={17} />
                  </IconButton>

                  <IconButton size="small" color="error" onClick={() => onDelete(unit.id)}>
                    <IconTrash size={17} />
                  </IconButton>
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}