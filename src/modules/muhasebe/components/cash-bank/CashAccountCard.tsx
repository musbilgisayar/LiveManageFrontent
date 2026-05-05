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
  IconBuildingBank,
  IconCash,
  IconCircleCheck,
  IconStar,
} from "@tabler/icons-react";

import type { CashBankAccount } from "@/modules/muhasebe/types/CashBank.types";
import {
  formatCashBankDate,
  formatCashBankMoney,
} from "@/modules/muhasebe/utils/cashBankFormatters";

interface CashAccountCardProps {
  account: CashBankAccount;
}

export default function CashAccountCard({ account }: CashAccountCardProps) {
  const theme = useTheme();

  const isCash = account.type === "cash";
  const color = isCash ? theme.palette.success.main : theme.palette.primary.main;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.background.paper,
          0.98
        )} 0%, ${alpha(color, 0.055)} 100%)`,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Avatar
              sx={{
                width: 46,
                height: 46,
                bgcolor: alpha(color, 0.12),
                color,
              }}
            >
              {isCash ? <IconCash size={22} /> : <IconBuildingBank size={22} />}
            </Avatar>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="subtitle1" fontWeight={900} noWrap>
                  {account.name}
                </Typography>

                {account.isDefault && (
                  <Chip
                    size="small"
                    icon={<IconStar size={14} />}
                    label="Varsayılan"
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {account.code}
              </Typography>
            </Box>

            <Chip
              size="small"
              label={account.status === "active" ? "Aktif" : "Pasif"}
              color={account.status === "active" ? "success" : "default"}
              variant="outlined"
            />
          </Stack>

          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              BAKİYE
            </Typography>

            <Typography variant="h5" fontWeight={950}>
              {formatCashBankMoney(account.balance, account.currency)}
            </Typography>
          </Box>

          <Stack spacing={0.75}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Tür
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {isCash ? "Kasa" : "Banka"}
              </Typography>
            </Stack>

            {account.bankName && (
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Banka
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {account.bankName}
                </Typography>
              </Stack>
            )}

            {account.iban && (
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  IBAN
                </Typography>
                <Typography variant="body2" fontWeight={700} noWrap>
                  {account.iban}
                </Typography>
              </Stack>
            )}

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Son Hareket
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {formatCashBankDate(account.lastTransactionAt)}
              </Typography>
            </Stack>
          </Stack>

          {account.description && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                p: 1.25,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.info.main, 0.06),
              }}
            >
              <IconCircleCheck size={17} color={theme.palette.info.main} />
              <Typography variant="body2" color="text.secondary">
                {account.description}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}