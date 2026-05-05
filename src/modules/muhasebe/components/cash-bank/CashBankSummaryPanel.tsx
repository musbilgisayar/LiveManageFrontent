"use client";

import React from "react";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconBuildingBank,
  IconCash,
  IconExchange,
  IconTrendingUp,
} from "@tabler/icons-react";

import type {
  CashBankAccount,
  CashBankTransaction,
  CashBankTransfer,
  CashBankSummary,
} from "@/modules/muhasebe/types/CashBank.types";

interface CashBankSummaryPanelProps {
  summary: CashBankSummary;
  accounts: CashBankAccount[];
  transactions: CashBankTransaction[];
  transfers: CashBankTransfer[];
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CashBankSummaryPanel({
  summary,
  accounts,
  transactions,
  transfers,
}: CashBankSummaryPanelProps) {
  const theme = useTheme();

  const activeAccounts = accounts.filter((account) => account.status === "active");
  const cashAccounts = accounts.filter((account) => account.type === "cash");
  const bankAccounts = accounts.filter((account) => account.type === "bank");

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Typography variant="h6" fontWeight={900}>
          Finansal Özet
        </Typography>
        <Chip size="small" label={`${activeAccounts.length} aktif hesap`} />
        <Chip size="small" label={`${transactions.length} hareket`} />
        <Chip size="small" label={`${transfers.length} transfer`} />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1.4fr 1fr",
          },
          gap: 2,
        }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <IconTrendingUp size={22} color={theme.palette.primary.main} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={900}>
                    Nakit Pozisyonu
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kasa ve banka hesaplarının anlık dağılımı
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconCash size={18} color={theme.palette.success.main} />
                    <Typography color="text.secondary">Kasa</Typography>
                  </Stack>
                  <Typography fontWeight={900}>
                    {formatMoney(summary.cashBalance, summary.currency)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconBuildingBank size={18} color={theme.palette.primary.main} />
                    <Typography color="text.secondary">Banka</Typography>
                  </Stack>
                  <Typography fontWeight={900}>
                    {formatMoney(summary.bankBalance, summary.currency)}
                  </Typography>
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={900}>Toplam</Typography>
                  <Typography variant="h6" fontWeight={950}>
                    {formatMoney(summary.totalBalance, summary.currency)}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.background.paper,
              0.98,
            )} 0%, ${alpha(theme.palette.info.main, 0.055)} 100%)`,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <IconExchange size={22} color={theme.palette.info.main} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={900}>
                    Operasyon Durumu
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Güncel kasa/banka operasyon özeti
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Kasa Hesabı</Typography>
                  <Typography fontWeight={900}>{cashAccounts.length}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Banka Hesabı</Typography>
                  <Typography fontWeight={900}>{bankAccounts.length}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Bu Ayki Hareket</Typography>
                  <Typography fontWeight={900}>
                    {summary.monthlyTransactionCount}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Transfer Kaydı</Typography>
                  <Typography fontWeight={900}>{transfers.length}</Typography>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}