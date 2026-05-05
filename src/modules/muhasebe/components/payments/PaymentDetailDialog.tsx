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
import { IconCoin, IconEdit } from "@tabler/icons-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import type { PaymentItem } from "@/modules/muhasebe/types/payment.types";
import {
  formatPaymentDate,
  formatPaymentMoney,
  getPaymentStatusLabel,
} from "@/modules/muhasebe/utils/muhasebePayment.utils";

interface Props {
  item: PaymentItem | null;
  onClose: () => void;
  onEdit: (item: PaymentItem) => void;
}

export default function PaymentDetailDialog({ item, onClose, onEdit }: Props) {
  return (
    <Dialog open={Boolean(item)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tahsilat Detayı</DialogTitle>

      <DialogContent dividers>
        {item && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: alpha("#10b981", 0.12), color: "#10b981" }}>
                <IconCoin size={18} />
              </Avatar>

              <Box>
                <Typography fontWeight={800}>{item.payerName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.unit || "Birim belirtilmemiş"}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <DetailRow label="Ödeyen" value={item.payerName} />
            <DetailRow label="Birim" value={item.unit || "-"} />
            <DetailRow label="Tutar" value={formatPaymentMoney(item.amount, item.currency)} />
            <DetailRow label="Tarih" value={formatPaymentDate(item.paymentDate)} />
            <DetailRow label="Durum" value={getPaymentStatusLabel(item.status)} />
            <DetailRow label="Ödeme Yöntemi" value={item.paymentMethod} />
            <DetailRow label="Kasa / Banka" value={item.cashAccount} />
            <DetailRow label="Makbuz No" value={item.receiptNo || "-"} />
            <DetailRow label="Açıklama" value={item.description || "-"} />
            <DetailRow label="Oluşturan" value={item.createdBy} />
            <DetailRow
              label="Oluşturulma"
              value={format(new Date(item.createdAt), "dd.MM.yyyy HH:mm", { locale: tr })}
            />
            <DetailRow
              label="Güncellenme"
              value={format(new Date(item.updatedAt), "dd.MM.yyyy HH:mm", { locale: tr })}
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