"use client";

import React from "react";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import {
  IconBuildingBank,
  IconCoin,
  IconReceipt,
  IconReportMoney,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import type { IncomeItem } from "@/modules/muhasebe/types/income.types";
import {
  formatIncomeDate,
  formatIncomeMoney,
  getIncomeCategoryColor,
  getIncomeStatusLabel,
} from "@/modules/muhasebe/utils/muhasebeIncome.utils";

function getIncomeCategoryIcon(category: string) {
  if (category === "Kira Geliri") return <IconBuildingBank size={18} />;
  if (category === "Ortak Alan Geliri") return <IconReportMoney size={18} />;
  if (category === "Ceza / Gecikme Geliri") return <IconReceipt size={18} />;

  return <IconCoin size={18} />;
}

interface IncomeDetailDialogProps {
  item: IncomeItem | null;
  onClose: () => void;
}

export default function IncomeDetailDialog({
  item,
  onClose,
}: IncomeDetailDialogProps) {
  const categoryColor = item ? getIncomeCategoryColor(item.category) : "#10b981";

  return (
    <Dialog open={Boolean(item)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Gelir Detayı</DialogTitle>

      <DialogContent dividers>
        {item && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: alpha(categoryColor, 0.12),
                  color: categoryColor,
                }}
              >
                {getIncomeCategoryIcon(item.category)}
              </Avatar>

              <Box>
                <Typography fontWeight={800}>{item.category}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.customerName}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <DetailRow label="Kategori" value={item.category} />
            <DetailRow label="Ödeyen" value={item.customerName} />
            <DetailRow label="Tarih" value={formatIncomeDate(item.incomeDate)} />
            <DetailRow label="Tutar" value={formatIncomeMoney(item.amount, item.currency)} />
            <DetailRow label="Durum" value={getIncomeStatusLabel(item.status)} />
            <DetailRow label="Ödeme Yöntemi" value={item.paymentMethod} />
            <DetailRow label="Belge No" value={item.invoiceNo || "-"} />
            <DetailRow label="Açıklama" value={item.description || "-"} />
            <DetailRow label="Oluşturan" value={item.createdBy} />
            <DetailRow
              label="Oluşturulma"
              value={format(new Date(item.createdAt), "dd.MM.yyyy HH:mm", {
                locale: tr,
              })}
            />
            <DetailRow
              label="Güncellenme"
              value={format(new Date(item.updatedAt), "dd.MM.yyyy HH:mm", {
                locale: tr,
              })}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Typography variant="body2" fontWeight={700} textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}