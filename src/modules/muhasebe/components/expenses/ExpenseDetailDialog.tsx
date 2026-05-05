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
  IconCalendarEvent,
  IconCreditCard,
  IconEdit,
  IconReceiptTax,
  IconTags,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import type { ExpenseItem } from "@/modules/muhasebe/types/expense.types";
import {
  EXPENSE_CATEGORY_COLORS,
  formatExpenseDate,
  formatExpenseMoney,
  getExpenseStatusLabel,
} from "@/modules/muhasebe/utils/muhasebeExpense.utils";

function getExpenseCategoryIcon(category: string) {
  if (category === "elevator") return <IconBuildingBank size={18} />;
  if (category === "electricity") return <IconCreditCard size={18} />;
  if (category === "water") return <IconCalendarEvent size={18} />;
  if (category === "garden") return <IconTags size={18} />;
  if (category === "repair") return <span style={{ fontSize: 16 }}>🔧</span>;
  if (category === "insurance") return <IconBuildingBank size={18} />;

  return <IconReceiptTax size={18} />;
}

interface ExpenseDetailDialogProps {
  item: ExpenseItem | null;
  onClose: () => void;
  onEdit: (item: ExpenseItem) => void;
}

export default function ExpenseDetailDialog({
  item,
  onClose,
  onEdit,
}: ExpenseDetailDialogProps) {
  const categoryColor = item
    ? EXPENSE_CATEGORY_COLORS[item.category] ?? EXPENSE_CATEGORY_COLORS.other
    : EXPENSE_CATEGORY_COLORS.other;

  return (
    <Dialog open={Boolean(item)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Gider Detayı</DialogTitle>

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
                {getExpenseCategoryIcon(item.category)}
              </Avatar>

              <Box>
                <Typography fontWeight={800}>{item.categoryLabel}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.vendor}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <DetailRow label="Tutar" value={formatExpenseMoney(item.amount, item.currency)} />
            <DetailRow label="Tarih" value={formatExpenseDate(item.date)} />
            <DetailRow label="Durum" value={getExpenseStatusLabel(item.status)} />
            <DetailRow label="Ödeme Hesabı" value={item.cashAccount} />
            <DetailRow label="Fatura No" value={item.invoiceNo || "-"} />
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

        {item && (
          <Button
            variant="contained"
            startIcon={<IconEdit size={16} />}
            onClick={() => {
              onEdit(item);
              onClose();
            }}
          >
            Düzenle
          </Button>
        )}
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