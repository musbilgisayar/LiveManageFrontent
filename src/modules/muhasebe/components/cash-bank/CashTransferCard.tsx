"use client";

import React from "react";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconArrowRight,
  IconBuildingBank,
  IconCash,
  IconExchange,
} from "@tabler/icons-react";

import type { CashBankTransfer } from "@/modules/muhasebe/types/CashBank.types";

interface CashTransferCardProps {
  transfer: CashBankTransfer;
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusMeta(status: CashBankTransfer["status"]) {
  switch (status) {
    case "completed":
      return { label: "Tamamlandı", color: "success" as const };

    case "pending":
      return { label: "Bekliyor", color: "warning" as const };

    case "cancelled":
      return { label: "İptal", color: "default" as const };

    default:
      return { label: "Bilinmiyor", color: "default" as const };
  }
}

export default function CashTransferCard({ transfer }: CashTransferCardProps) {
  const theme = useTheme();
  const statusMeta = getStatusMeta(transfer.status);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.background.paper,
          0.98
        )} 0%, ${alpha(theme.palette.info.main, 0.055)} 100%)`,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: alpha(theme.palette.info.main, 0.12),
                  color: theme.palette.info.main,
                }}
              >
                <IconExchange size={22} />
              </Avatar>

              <Box>
                <Typography variant="subtitle1" fontWeight={900}>
                  {transfer.transferNo}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {formatDate(transfer.transferredAt)}
                </Typography>
              </Box>
            </Stack>

            <Chip
              size="small"
              label={statusMeta.label}
              color={statusMeta.color}
              variant="outlined"
            />
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                p: 1.25,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.error.main, 0.055),
                flex: 1,
              }}
            >
              <IconBuildingBank size={20} color={theme.palette.error.main} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  Çıkış Hesabı
                </Typography>
                <Typography variant="body2" fontWeight={800} noWrap>
                  {transfer.fromAccountName}
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              >
                <IconArrowRight size={18} />
              </Avatar>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                p: 1.25,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.success.main, 0.06),
                flex: 1,
              }}
            >
              <IconCash size={20} color={theme.palette.success.main} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  Giriş Hesabı
                </Typography>
                <Typography variant="body2" fontWeight={800} noWrap>
                  {transfer.toAccountName}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={800}>
                TRANSFER TUTARI
              </Typography>
              <Typography variant="h6" fontWeight={950}>
                {formatMoney(transfer.amount, transfer.currency)}
              </Typography>
            </Box>

            {transfer.description && (
              <Box sx={{ maxWidth: 420 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  AÇIKLAMA
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {transfer.description}
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}