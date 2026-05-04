//src/modules/muhasebe/components/dashboard/MuhasebeKurulumDurumuCard.tsx
"use client";

import React from "react";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconBuildingCommunity,
  IconBuildingBank,
  IconCalendarStats,
  IconCheckbox,
  IconCircleCheck,
  IconHomeStats,
  IconInfoCircle,
  IconReceipt2,
} from "@tabler/icons-react";

type SetupStepStatus = "completed" | "warning" | "missing";

type SetupStep = {
  id: string;
  title: string;
  description: string;
  status: SetupStepStatus;
  icon: React.ReactNode;
  actionLabel?: string;
};

type MuhasebeKurulumDurumuCardProps = {
  propertyName: string;
};

export default function MuhasebeKurulumDurumuCard({
  propertyName,
}: MuhasebeKurulumDurumuCardProps) {
  const theme = useTheme();

  const steps: SetupStep[] = [
    {
      id: "property",
      title: "Site / Apartman seçildi",
      description: propertyName,
      status: "completed",
      icon: <IconBuildingCommunity size={19} />,
    },
    {
      id: "units",
      title: "Bağımsız bölümler kontrol edildi",
      description: "Daire, dükkân veya ofis kayıtları muhasebe için hazır.",
      status: "completed",
      icon: <IconHomeStats size={19} />,
    },
    {
      id: "cash-account",
      title: "Kasa / Banka hesabı",
      description: "Ödeme ve gider hareketleri için en az bir hesap tanımlanmalı.",
      status: "missing",
      icon: <IconBuildingBank size={19} />,
      actionLabel: "Hesap oluştur",
    },
    {
      id: "period",
      title: "Aktif muhasebe dönemi",
      description: "Aidat ve giderlerin işleneceği dönem henüz oluşturulmadı.",
      status: "warning",
      icon: <IconCalendarStats size={19} />,
      actionLabel: "Dönem oluştur",
    },
    {
      id: "charges",
      title: "İlk tahakkuk",
      description: "Seçili dönem için henüz aidat/borçlandırma yapılmadı.",
      status: "warning",
      icon: <IconReceipt2 size={19} />,
      actionLabel: "Aidat oluştur",
    },
  ];

  const completedCount = steps.filter((step) => step.status === "completed").length;
  const totalCount = steps.length;
  const isReady = completedCount === totalCount;

  const getStatusStyle = (status: SetupStepStatus) => {
    if (status === "completed") {
      return {
        color: theme.palette.success.main,
        bg: alpha(theme.palette.success.main, 0.1),
        border: alpha(theme.palette.success.main, 0.22),
        label: "Tamam",
      };
    }

    if (status === "warning") {
      return {
        color: theme.palette.warning.main,
        bg: alpha(theme.palette.warning.main, 0.1),
        border: alpha(theme.palette.warning.main, 0.22),
        label: "Bekliyor",
      };
    }

    return {
      color: theme.palette.error.main,
      bg: alpha(theme.palette.error.main, 0.1),
      border: alpha(theme.palette.error.main, 0.22),
      label: "Eksik",
    };
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
      }}
    >
      <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          mb={2}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <IconCheckbox size={20} />
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={800}>
                  Muhasebe Kurulum Durumu
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Bu site/apartman için muhasebeye başlamadan önce gerekli adımlar.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Chip
            size="small"
            color={isReady ? "success" : "warning"}
            label={isReady ? "Kurulum tamamlandı" : `${completedCount}/${totalCount} tamamlandı`}
            icon={isReady ? <IconCircleCheck size={16} /> : <IconInfoCircle size={16} />}
            sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
          />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
              xl: "1fr 1fr 1fr",
            },
            gap: 1.25,
            alignItems: "start",
          }}
        >
          {steps.map((step) => {
            const style = getStatusStyle(step.status);

            return (
              <Box
                key={step.id}
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  border: `1px solid ${style.border}`,
                  bgcolor: style.bg,
                }}
              >
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      flexShrink: 0,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      color: style.color,
                      bgcolor: alpha(style.color, 0.12),
                    }}
                  >
                    {step.icon}
                  </Box>

                  <Box minWidth={0} flex={1}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="body2" fontWeight={800}>
                        {step.title}
                      </Typography>

                      <Chip
                        size="small"
                        label={style.label}
                        sx={{
                          height: 22,
                          fontSize: 11,
                          color: style.color,
                          bgcolor: alpha(style.color, 0.12),
                        }}
                      />
                    </Stack>

                    <Typography variant="caption" color="text.secondary" display="block" mt={0.4}>
                      {step.description}
                    </Typography>

                    {step.actionLabel && step.status !== "completed" && (
                      <Button size="small" sx={{ mt: 1, px: 0 }}>
                        {step.actionLabel}
                      </Button>
                    )}
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}