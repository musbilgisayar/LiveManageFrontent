//bu dosya muhasebe yönetimi dashboard'unda son tahsilatlar ve son gider kayıtlarını gösteren kart componentidir. RecentTransactionsCard, payments ve expenses prop'ları alır ve bu verileri kullanarak iki ayrı bölümde son tahsilatları ve son giderleri listeler. Her işlem için ilgili bilgiler (birim, ödeyen, kategori, firma, tutar, durum vb.) gösterilir. Eğer tahsilat veya gider kaydı yoksa uygun bir mesaj görüntülenir.
//src/modules/muhasebe/components/dashboard/RecentTransactionsCard.tsx
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
import { IconArrowDownLeft, IconArrowUpRight, IconReceipt } from "@tabler/icons-react";

type RecentPayment = {
  id: string;
  unitLabel: string;
  payerName?: string;
  amount: number;
  currency: string;
  paymentDate: string;
  method: string;
  status: "completed" | "cancelled" | "reversed";
};

type RecentExpense = {
  id: string;
  category: string;
  vendorName?: string;
  amount: number;
  currency: string;
  expenseDate: string;
  status: "draft" | "approved" | "paid" | "cancelled";
};

type RecentTransactionsCardProps = {
  payments: RecentPayment[];
  expenses: RecentExpense[];
};

export default function RecentTransactionsCard({
  payments,
  expenses,
}: RecentTransactionsCardProps) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
      }}
    >
      <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                color: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <IconReceipt size={20} />
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={800}>
                Son İşlemler
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Son tahsilatlar ve son gider kayıtları
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 2,
              alignItems: "start",
            }}
          >
            <Stack spacing={1.25}>
              <Typography variant="body2" fontWeight={800}>
                Son Tahsilatlar
              </Typography>

              {payments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Henüz tahsilat kaydı yok.
                </Typography>
              ) : (
                payments.map((payment) => (
                  <Box
                    key={payment.id}
                    sx={{
                      p: 1.25,
                      borderRadius: 2.25,
                      bgcolor: alpha(theme.palette.success.main, 0.055),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.14)}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" spacing={1.5}>
                      <Stack direction="row" spacing={1.1} minWidth={0}>
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            flexShrink: 0,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            color: theme.palette.success.main,
                            bgcolor: alpha(theme.palette.success.main, 0.12),
                          }}
                        >
                          <IconArrowDownLeft size={17} />
                        </Box>

                        <Box minWidth={0}>
                          <Typography variant="body2" fontWeight={800} noWrap>
                            {payment.unitLabel}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap display="block">
                            {payment.payerName || "Ödeyen belirtilmedi"} · {payment.method}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack alignItems="flex-end" spacing={0.4}>
                        <Typography variant="body2" fontWeight={900}>
                          {payment.amount} {payment.currency}
                        </Typography>
                        <Chip size="small" label="Tahsil edildi" color="success" sx={{ height: 22 }} />
                      </Stack>
                    </Stack>
                  </Box>
                ))
              )}
            </Stack>

            <Stack spacing={1.25}>
              <Typography variant="body2" fontWeight={800}>
                Son Giderler
              </Typography>

              {expenses.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Henüz gider kaydı yok.
                </Typography>
              ) : (
                expenses.map((expense) => (
                  <Box
                    key={expense.id}
                    sx={{
                      p: 1.25,
                      borderRadius: 2.25,
                      bgcolor: alpha(theme.palette.error.main, 0.045),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.12)}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" spacing={1.5}>
                      <Stack direction="row" spacing={1.1} minWidth={0}>
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            flexShrink: 0,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            color: theme.palette.error.main,
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                          }}
                        >
                          <IconArrowUpRight size={17} />
                        </Box>

                        <Box minWidth={0}>
                          <Typography variant="body2" fontWeight={800} noWrap>
                            {expense.category}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap display="block">
                            {expense.vendorName || "Firma belirtilmedi"}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack alignItems="flex-end" spacing={0.4}>
                        <Typography variant="body2" fontWeight={900}>
                          {expense.amount} {expense.currency}
                        </Typography>
                        <Chip size="small" label="Gider" color="error" sx={{ height: 22 }} />
                      </Stack>
                    </Stack>
                  </Box>
                ))
              )}
            </Stack>
          </Box>

          <Divider />
        </Stack>
      </CardContent>
    </Card>
  );
}