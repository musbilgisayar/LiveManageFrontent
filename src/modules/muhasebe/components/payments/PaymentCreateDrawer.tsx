//bu dosya yeni tahsilat girişi için açılan drawer componentidir. Muhasebe yönetimi ekranında "Yeni Tahsilat" butonuna tıklandığında bu drawer açılır ve kullanıcıdan tahsilat bilgilerini alır. Form doğrulaması yapar ve geçerli bir payload oluşturduğunda onCreated callback'i ile üst componente gönderir. Bu drawer sadece tahsilat kaydı oluşturur, ödeme işlemi içermez.
//src/modules/muhasebe/components/payments/PaymentCreateDrawer.tsx
"use client";

import React, { useState } from "react";
import {
  Drawer,
  Stack,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  Grid,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { format } from "date-fns";

export type PaymentCreatePayload = {
  customerName: string;
  unit?: string;
  amount: number;
  currency: "CHF" | "EUR" | "TRY";
  date: string;
  paymentMethod: string;
  cashAccount: string;
  receiptNo?: string;
  description?: string;
};

export default function PaymentCreateDrawer({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (payload: PaymentCreatePayload) => void;
}) {
  const [form, setForm] = useState({
    customerName: "",
    unit: "",
    amount: "",
    currency: "CHF",
    date: format(new Date(), "yyyy-MM-dd"),
    paymentMethod: "Nakit",
    cashAccount: "Banka Hesabı",
    receiptNo: "",
    description: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.customerName || !form.amount || !form.cashAccount) return;

    onCreated({
      customerName: form.customerName,
      unit: form.unit,
      amount: Number(form.amount),
      currency: form.currency as any,
      date: form.date,
      paymentMethod: form.paymentMethod,
      cashAccount: form.cashAccount,
      receiptNo: form.receiptNo,
      description: form.description,
    });

    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 500 }, p: 3 } }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={800}>
            Yeni Tahsilat
          </Typography>
          <IconButton onClick={onClose}>
            <IconX size={20} />
          </IconButton>
        </Stack>

        {/* Form */}
        <Stack spacing={2.5}>
          <TextField
            label="Müşteri / Borçlu *"
            value={form.customerName}
            onChange={(e) => handleChange("customerName", e.target.value)}
            fullWidth
          />

          <TextField
            label="Daire"
            value={form.unit}
            onChange={(e) => handleChange("unit", e.target.value)}
            fullWidth
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Tutar *"
                type="number"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₣</InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Para Birimi"
                value={form.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                fullWidth
              >
                <MenuItem value="CHF">CHF</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="TRY">TRY</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <TextField
            type="date"
            label="Tarih"
            value={form.date}
            onChange={(e) => handleChange("date", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            select
            label="Ödeme Yöntemi"
            value={form.paymentMethod}
            onChange={(e) => handleChange("paymentMethod", e.target.value)}
            fullWidth
          >
            <MenuItem value="Nakit">Nakit</MenuItem>
            <MenuItem value="Banka">Banka</MenuItem>
            <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
            <MenuItem value="TWINT">TWINT</MenuItem>
          </TextField>

          <TextField
            select
            label="Kasa / Banka Hesabı *"
            value={form.cashAccount}
            onChange={(e) => handleChange("cashAccount", e.target.value)}
            fullWidth
          >
            <MenuItem value="Banka Hesabı">🏦 Banka</MenuItem>
            <MenuItem value="Nakit Kasa">💵 Kasa</MenuItem>
            <MenuItem value="TWINT">📱 TWINT</MenuItem>
          </TextField>

          <TextField
            label="Makbuz No"
            value={form.receiptNo}
            onChange={(e) => handleChange("receiptNo", e.target.value)}
            fullWidth
          />

          <TextField
            label="Açıklama"
            multiline
            minRows={2}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            fullWidth
          />
        </Stack>

        {/* Actions */}
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={onClose}>İptal</Button>
          <Button variant="contained" onClick={handleSave}>
            Tahsilatı Kaydet
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}