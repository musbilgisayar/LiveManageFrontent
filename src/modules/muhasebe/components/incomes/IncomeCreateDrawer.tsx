"use client";

import React, { useCallback, useState } from "react";
import {
  Button,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { IconReceipt, IconX } from "@tabler/icons-react";
import { format } from "date-fns";

type Currency = "CHF" | "EUR" | "TRY";

export interface IncomeCreatePayload {
  category: string;
  customerName: string;
  incomeDate: string;
  amount: number;
  currency: Currency;
  paymentMethod: string;
  invoiceNo?: string;
  description?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (payload: IncomeCreatePayload) => void;
}

const INITIAL_FORM = {
  category: "",
  customerName: "",
  incomeDate: format(new Date(), "yyyy-MM-dd"),
  amount: "",
  currency: "CHF" as Currency,
  paymentMethod: "Banka Havalesi",
  invoiceNo: "",
  description: "",
};

const PAYMENT_METHODS = [
  "Banka Havalesi",
  "Nakit",
  "TWINT",
  "PostFinance",
  "Kredi Kartı",
];

export default function IncomeCreateDrawer({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState(INITIAL_FORM);

  const handleClose = useCallback(() => {
    setForm(INITIAL_FORM);
    onClose();
  }, [onClose]);

  const handleChange = useCallback((field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!form.category || !form.customerName.trim() || !form.amount.trim()) return;

    onCreated?.({
      category: form.category,
      customerName: form.customerName.trim(),
      incomeDate: form.incomeDate,
      amount: Number(form.amount),
      currency: form.currency,
      paymentMethod: form.paymentMethod,
      invoiceNo: form.invoiceNo.trim() || undefined,
      description: form.description.trim() || undefined,
    });

    handleClose();
  }, [form, handleClose, onCreated]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 560, md: 640 }, p: 3 } }}
    >
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Yeni Gelir Kaydı
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kira, ortak alan geliri veya diğer gelirleri kaydedin.
            </Typography>
          </Box>

          <IconButton onClick={handleClose}>
            <IconX size={20} />
          </IconButton>
        </Stack>

        <TextField
          select
          label="Gelir Kalemi *"
          fullWidth
          value={form.category}
          onChange={(event) => handleChange("category", event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconReceipt size={18} />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="rent">Kira Geliri</MenuItem>
          <MenuItem value="common_area">Ortak Alan Geliri</MenuItem>
          <MenuItem value="penalty">Ceza / Gecikme Geliri</MenuItem>
          <MenuItem value="other">Diğer Gelir</MenuItem>
        </TextField>

        <TextField
          label="Müşteri / Ödeyen *"
          placeholder="Örn: Migros, Ahmet Yılmaz"
          fullWidth
          value={form.customerName}
          onChange={(event) => handleChange("customerName", event.target.value)}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Gelir Tarihi *"
              type="date"
              fullWidth
              value={form.incomeDate}
              onChange={(event) => handleChange("incomeDate", event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Para Birimi"
              fullWidth
              value={form.currency}
              onChange={(event) => handleChange("currency", event.target.value as Currency)}
            >
              <MenuItem value="CHF">🇨🇭 İsviçre Frangı (CHF)</MenuItem>
              <MenuItem value="EUR">🇪🇺 Euro (EUR)</MenuItem>
              <MenuItem value="TRY">🇹🇷 Türk Lirası (TRY)</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <TextField
          label="Tutar *"
          type="number"
          placeholder="0.00"
          fullWidth
          value={form.amount}
          onChange={(event) => handleChange("amount", event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {form.currency === "CHF" ? "₣" : form.currency === "EUR" ? "€" : "₺"}
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="Ödeme Yöntemi"
          fullWidth
          value={form.paymentMethod}
          onChange={(event) => handleChange("paymentMethod", event.target.value)}
        >
          {PAYMENT_METHODS.map((method) => (
            <MenuItem key={method} value={method}>
              {method}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Belge / Makbuz No"
          placeholder="Opsiyonel"
          fullWidth
          value={form.invoiceNo}
          onChange={(event) => handleChange("invoiceNo", event.target.value)}
        />

        <TextField
          label="Açıklama"
          multiline
          minRows={3}
          placeholder="Gelir hakkında kısa açıklama..."
          fullWidth
          value={form.description}
          onChange={(event) => handleChange("description", event.target.value)}
        />

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button variant="outlined" onClick={handleClose}>
            Vazgeç
          </Button>

          <Button variant="contained" onClick={handleSubmit}>
            Geliri Kaydet
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}