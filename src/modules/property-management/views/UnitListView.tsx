"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconHome, IconUser, IconUsers, IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

/* ================= MOCK DATA ================= */

type Unit = {
  id: string;
  block: string;
  floor: string;
  unitNo: string;
  type: "Daire" | "Dükkan" | "Ofis";
  owner: string;
  resident: string;
  status: "active" | "pending";
};

const units: Unit[] = [
  {
    id: "1",
    block: "A",
    floor: "3",
    unitNo: "12",
    type: "Daire",
    owner: "Ahmet Yılmaz",
    resident: "Mehmet Kaya",
    status: "active",
  },
  {
    id: "2",
    block: "A",
    floor: "2",
    unitNo: "8",
    type: "Daire",
    owner: "—",
    resident: "—",
    status: "pending",
  },
];

/* ================= VIEW ================= */

export default function UnitListView() {
  const theme = useTheme<Theme>();
  const router = useRouter();

  const total = units.length;
  const active = units.filter((x) => x.status === "active").length;
  const pending = units.filter((x) => x.status === "pending").length;

  return (
    <Box>
      {/* HEADER */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight={900}>
          Bağımsız Bölümler
        </Typography>

        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          onClick={() =>
            router.push("/property-management/1/units/create")
          }
        >
          Yeni Tanımla
        </Button>
      </Stack>

      {/* SUMMARY */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 2,
        }}
      >
        <SummaryCard
          label="Toplam"
          value={total}
          icon={<IconHome size={20} />}
        />
        <SummaryCard
          label="Aktif"
          value={active}
          icon={<IconUser size={20} />}
          color="success"
        />
        <SummaryCard
          label="Bekleyen"
          value={pending}
          icon={<IconUsers size={20} />}
          color="warning"
        />
      </Box>

      {/* TABLE */}
      <Card variant="outlined" sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: 1.5 }}>
          <Stack spacing={1.25}>
            {/* HEADER */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns:
                  "80px 80px 80px 100px 180px 180px 120px 100px",
                gap: 1,
                px: 1,
              }}
            >
              {[
                "Blok",
                "Kat",
                "No",
                "Tür",
                "Sahip",
                "Oturan",
                "Durum",
                "",
              ].map((h) => (
                <Typography
                  key={h}
                  variant="caption"
                  fontWeight={700}
                  sx={{ opacity: 0.7 }}
                >
                  {h}
                </Typography>
              ))}
            </Box>

            {/* ROWS */}
            {units.map((u) => (
              <Box
                key={u.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "80px 80px 80px 100px 180px 180px 120px 100px",
                  gap: 1,
                  alignItems: "center",
                  px: 1,
                  py: 0.75,
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                <Typography>{u.block}</Typography>
                <Typography>{u.floor}</Typography>
                <Typography>{u.unitNo}</Typography>
                <Typography>{u.type}</Typography>
                <Typography>{u.owner}</Typography>
                <Typography>{u.resident}</Typography>

                <Chip
                  size="small"
                  label={
                    u.status === "active"
                      ? "Aktif"
                      : "Onay Bekliyor"
                  }
                  color={u.status === "active" ? "success" : "warning"}
                />

                <Button
                  size="small"
                  onClick={() =>
                    router.push(
                      `/property-management/1/units/${u.id}`
                    )
                  }
                >
                  Detay
                </Button>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

/* ================= COMPONENTS ================= */

type SummaryColor = "primary" | "success" | "warning";

type SummaryCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: SummaryColor;
};

function SummaryCard({
  label,
  value,
  icon,
  color = "primary",
}: SummaryCardProps) {
  const theme = useTheme<Theme>();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        p: 1.5,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.palette[color].main, 0.1),
            color: theme.palette[color].main,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography fontWeight={900}>{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}