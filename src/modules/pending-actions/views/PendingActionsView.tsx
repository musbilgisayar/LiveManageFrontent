

//src/modules/pending-actions/views/PendingActionsView.tsx
"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Divider,
} from "@mui/material";
import {
  IconChecklist,
  IconHome,
  IconUserShield,
  IconArrowsTransferUp,
  IconBuildingCommunity,
  IconFileCheck,
  IconShieldLock,
} from "@tabler/icons-react";

type ItemType =
  | "all"
  | "listing"
  | "management"
  | "delegation"
  | "invitation"
  | "verification"
  | "document";

type StatusType = "pending" | "action_required";

type PendingItem = {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  status: StatusType;
  date: string;
};

const mockData: PendingItem[] = [
  {
    id: "1",
    type: "listing",
    title: "İlan Başvurusu",
    description: "Koru Evleri için verdiğiniz ilan inceleniyor.",
    status: "pending",
    date: "02.05.2026",
  },
  {
    id: "2",
    type: "management",
    title: "Yönetici Başvurusu",
    description: "Site yönetimi başvurunuz değerlendirme aşamasında.",
    status: "pending",
    date: "01.05.2026",
  },
  {
    id: "3",
    type: "invitation",
    title: "Organizasyon Daveti",
    description: "Bir site yönetimine davet edildiniz.",
    status: "action_required",
    date: "30.04.2026",
  },
  {
    id: "4",
    type: "delegation",
    title: "Yetki Devri",
    description: "Size yetki devri yapılmak üzere onay bekleniyor.",
    status: "pending",
    date: "29.04.2026",
  },
];

function getIcon(type: ItemType) {
  switch (type) {
    case "listing":
      return <IconHome size={20} />;
    case "management":
      return <IconUserShield size={20} />;
    case "delegation":
      return <IconArrowsTransferUp size={20} />;
    case "invitation":
      return <IconBuildingCommunity size={20} />;
    case "verification":
      return <IconShieldLock size={20} />;
    case "document":
      return <IconFileCheck size={20} />;
    default:
      return <IconChecklist size={20} />;
  }
}

function getStatusChip(status: StatusType) {
  if (status === "pending") {
    return <Chip label="İncelemede" color="warning" size="small" />;
  }
  return <Chip label="Aksiyon Gerekli" color="error" size="small" />;
}

export default function PendingActionsView() {
  const [filter, setFilter] = useState<ItemType>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return mockData;
    return mockData.filter((x) => x.type === filter);
  }, [filter]);

  const pendingCount = mockData.filter((x) => x.status === "pending").length;
  const actionCount = mockData.filter(
    (x) => x.status === "action_required"
  ).length;

  return (
    <Box p={3}>
      {/* HEADER */}
      <Stack spacing={1} mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Onay Bekleyen İşlemler
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Onay sürecinde olan işlemlerinizi buradan takip edebilirsiniz.
        </Typography>

        <Stack direction="row" spacing={2}>
          <Chip label={`${pendingCount} beklemede`} color="warning" />
          <Chip label={`${actionCount} aksiyon gerekli`} color="error" />
        </Stack>
      </Stack>

      {/* FILTER */}
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_, val) => val && setFilter(val)}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="all">Tümü</ToggleButton>
        <ToggleButton value="listing">İlan</ToggleButton>
        <ToggleButton value="management">Yönetim</ToggleButton>
        <ToggleButton value="delegation">Yetki</ToggleButton>
        <ToggleButton value="invitation">Davet</ToggleButton>
      </ToggleButtonGroup>

      {/* LIST */}
      <Stack spacing={2}>
        {filtered.map((item) => (
          <Card
            key={item.id}
            sx={{
              borderRadius: 3,
              boxShadow: 1,
              "&:hover": { boxShadow: 4 },
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                {/* TOP */}
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    {getIcon(item.type)}
                    <Typography fontWeight={600}>
                      {item.title}
                    </Typography>
                  </Stack>

                  {getStatusChip(item.status)}
                </Stack>

                {/* DESC */}
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>

                <Divider />

                {/* FOOTER */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="caption" color="text.secondary">
                    {item.date}
                  </Typography>

                  {item.status === "action_required" ? (
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" color="error">
                        Reddet
                      </Button>
                      <Button size="small" variant="contained">
                        Kabul Et
                      </Button>
                    </Stack>
                  ) : (
                    <Button size="small">Detay</Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}