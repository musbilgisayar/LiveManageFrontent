// src/modules/property-management/views/PropertyUnitsView.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconDoor, IconHome, IconUser, IconUsers } from "@tabler/icons-react";

type Unit = {
  id: string;
  block: string;
  unitNumber: string;
  status: "occupied" | "vacant";
  ownerName: string;
  tenantName?: string;
  rentStatus: string;
  duesStatus: string;
};

const units: Unit[] = [
  {
    id: "12",
    block: "A",
    unitNumber: "12",
    status: "occupied",
    ownerName: "Mehmet Kaya",
    tenantName: "Ahmet Yılmaz",
    rentStatus: "Düzenli",
    duesStatus: "Ödendi",
  },
  {
    id: "13",
    block: "A",
    unitNumber: "13",
    status: "occupied",
    ownerName: "Ayşe Demir",
    tenantName: "Zeynep Arslan",
    rentStatus: "1 gecikme",
    duesStatus: "Gecikti",
  },
  {
    id: "5",
    block: "B",
    unitNumber: "5",
    status: "vacant",
    ownerName: "Ali Vural",
    rentStatus: "Boş",
    duesStatus: "-",
  },
];

export default function PropertyUnitsView({ propertyId }: { propertyId: string }) {
  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Daire Yönetimi
        </Typography>
        <Typography color="text.secondary">
          Site içerisindeki bağımsız bölümler ve durumları.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            xl: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        {units.map((unit) => (
          <UnitCard key={unit.id} unit={unit} propertyId={propertyId} />
        ))}
      </Box>
    </Box>
  );
}

function UnitCard({ unit, propertyId }: { unit: Unit; propertyId: string }) {
  const theme = useTheme<Theme>();
  const router = useRouter();

  const statusColor =
    unit.status === "occupied" ? theme.palette.success.main : theme.palette.warning.main;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: alpha(statusColor, 0.2),
        overflow: "hidden",
        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[6],
          borderColor: alpha(statusColor, 0.34),
        },
      }}
    >
      <CardActionArea
        onClick={() => router.push(`/property-management/${propertyId}/units/${unit.id}`)}
        sx={{ height: "100%" }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(statusColor, 0.1),
                    color: statusColor,
                  }}
                >
                  <IconDoor size={20} />
                </Box>

                <Box>
                  <Typography fontWeight={900}>
                    Blok {unit.block} / Daire {unit.unitNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {unit.status === "occupied" ? "Dolu" : "Boş"}
                  </Typography>
                </Box>
              </Stack>

              <Chip
                label={unit.status === "occupied" ? "Dolu" : "Boş"}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: alpha(statusColor, 0.1),
                  color: statusColor,
                }}
              />
            </Stack>

            <Stack spacing={1}>
              <InfoRow icon={<IconUser size={16} />} label="Malik" value={unit.ownerName} />
              <InfoRow icon={<IconUsers size={16} />} label="Kiracı" value={unit.tenantName ?? "-"} />
              <InfoRow icon={<IconHome size={16} />} label="Kira durumu" value={unit.rentStatus} />
              <InfoRow icon={<IconHome size={16} />} label="Aidat durumu" value={unit.duesStatus} />
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function InfoRow({
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
      {icon}
      <Typography variant="body2" color="text.secondary">
        {label}:
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        {value}
      </Typography>
    </Stack>
  );
}