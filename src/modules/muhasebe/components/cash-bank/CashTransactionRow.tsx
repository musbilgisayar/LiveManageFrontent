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
  IconArrowDownLeft,
  IconArrowUpRight,
  IconExchange,
  IconReceipt,
  IconRotateClockwise,
} from "@tabler/icons-react";

import type { CashBankTransaction } from "@/modules/muhasebe/types/CashBank.types";

interface CashTransactionRowProps {
  transaction: CashBankTransaction;
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

function getTransactionMeta(transaction: CashBankTransaction) {
  switch (transaction.type) {
    case "income":
      return {
        label: "Gelir",
        color: "success" as const,
        icon: <IconArrowDownLeft size={20} />,
        amountPrefix: "+",
      };

    case "expense":
      return {
        label: "Gider",
        color: "error" as const,
        icon: <IconArrowUpRight size={20} />,
        amountPrefix: "-",
      };

    case "transfer-in":
      return {
        label: "Transfer Giriş",
        color: "info" as const,
        icon: <IconExchange size={20} />,
        amountPrefix: "+",
      };

    case "transfer-out":
      return {
        label: "Transfer Çıkış",
        color: "warning" as const,
        icon: <IconExchange size={20} />,
        amountPrefix: "-",
      };

    case "correction":
      return {
        label: "Düzeltme",
        color: "default" as const,
        icon: <IconRotateClockwise size={20} />,
        amountPrefix: "",
      };

    default:
      return {
        label: "Hareket",
        color: "default" as const,
        icon: <IconReceipt size={20} />,
        amountPrefix: "",
      };
  }
}

export default function CashTransactionRow({
  transaction,
}: CashTransactionRowProps) {
  const theme = useTheme();
  const meta = getTransactionMeta(transaction);

  const paletteColor =
    meta.color === "success"
      ? theme.palette.success.main
      : meta.color === "error"
        ? theme.palette.error.main
        : meta.color === "info"
          ? theme.palette.info.main
          : meta.color === "warning"
            ? theme.palette.warning.main
            : theme.palette.text.secondary;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.96),
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Avatar
              sx={{
                width: 42,
                height: 42,
                bgcolor: alpha(paletteColor, 0.12),
                color: paletteColor,
              }}
            >
              {meta.icon}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="subtitle2" fontWeight={900}>
                  {transaction.description}
                </Typography>

                <Chip
                  size="small"
                  label={meta.label}
                  color={meta.color}
                  variant="outlined"
                />
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {transaction.transactionNo} · {transaction.accountName}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "row", md: "column" }}
            justifyContent={{ xs: "space-between", md: "center" }}
            alignItems={{ xs: "center", md: "flex-end" }}
            spacing={0.25}
          >
            <Typography
              variant="subtitle1"
              fontWeight={950}
              color={paletteColor}
              sx={{ whiteSpace: "nowrap" }}
            >
              {meta.amountPrefix}
              {formatMoney(transaction.amount, transaction.currency)}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {formatDate(transaction.occurredAt)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}