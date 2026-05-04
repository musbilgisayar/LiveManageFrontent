"use client";

import React from "react";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconBuildingBank,
  IconWallet,
  IconCreditCard,
  IconDeviceMobile,
} from "@tabler/icons-react";

type CashAccount = {
  id: string;
  name: string;
  type: "cash" | "bank" | "postfinance" | "twint" | "other";
  balance: number;
  currency: string;
};

type CashAccountSummaryCardProps = {
  accounts: CashAccount[];
};

function getIcon(type: CashAccount["type"]) {
  switch (type) {
    case "cash":
      return <IconWallet size={18} />;
    case "bank":
      return <IconBuildingBank size={18} />;
    case "twint":
    case "postfinance":
      return <IconDeviceMobile size={18} />;
    default:
      return <IconCreditCard size={18} />;
  }
}

export default function CashAccountSummaryCard({
  accounts,
}: CashAccountSummaryCardProps) {
  const theme = useTheme();

  const total = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const currency = accounts[0]?.currency ?? "CHF";

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2" fontWeight={800}>
              Kasa / Banka Özeti
            </Typography>

            <Typography variant="h6" fontWeight={900}>
              {total} {currency}
            </Typography>
          </Stack>

          <Stack spacing={1}>
            {accounts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Henüz kasa/banka hesabı yok.
              </Typography>
            ) : (
              accounts.map((acc) => (
                <Stack
                  key={acc.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        color: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      {getIcon(acc.type)}
                    </Box>

                    <Typography variant="body2" fontWeight={600}>
                      {acc.name}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" fontWeight={700}>
                    {acc.balance} {acc.currency}
                  </Typography>
                </Stack>
              ))
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}