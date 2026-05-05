"use client";

import React from "react";
import {
  Alert,
  Box,
  Button,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { IconReceipt, IconUser, IconX } from "@tabler/icons-react";

import type {
  PaymentFormErrors,
  PaymentFormValues,
  PaymentStatus,
  Currency,
} from "@/modules/muhasebe/types/payment.types";
import {
  CASH_ACCOUNT_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/modules/muhasebe/utils/muhasebePayment.utils";

interface Props {
  open: boolean;
  editingId: string | null;
  values: PaymentFormValues;
  errors: PaymentFormErrors;
  loading: boolean;
  onClose: () => void;
  onChange: (field: keyof PaymentFormValues, value: string) => void;
  onSubmit: () => void;
}

export default function PaymentDrawer({
  open,
  editingId,
  values,
  errors,
  loading,
  onClose,
  onChange,
  onSubmit,
}: Props) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 560, md: 620 }, p: 3 } }}
    >
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={800}>
              {editingId ? "Tahsilat Düzenle" : "Yeni Tahsilat Ekle"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Ödeme girişini kaydedin ve ilgili kasa/banka hesabına işleyin.
            </Typography>
          </Box>

          <IconButton onClick={onClose}>
            <IconX size={20} />
          </IconButton>
        </Stack>

        <Stack spacing={2.5}>
          <TextField
            label="Ödeyen Kişi / Kurum *"
            placeholder="Örn: Ahmet Yılmaz"
            fullWidth
            value={values.payerName}
            onChange={(event) => onChange("payerName", event.target.value)}
            error={Boolean(errors.payerName)}
            helperText={errors.payerName}
          />

          <TextField
            label="Birim / Daire"
            placeholder="Örn: A Blok / Daire 5"
            fullWidth
            value={values.unit}
            onChange={(event) => onChange("unit", event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconUser size={18} />
                </InputAdornment>
              ),
            }}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Tutar *"
                type="number"
                placeholder="0.00"
                fullWidth
                value={values.amount}
                onChange={(event) => onChange("amount", event.target.value)}
                error={Boolean(errors.amount)}
                helperText={errors.amount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {values.currency === "CHF"
                        ? "₣"
                        : values.currency === "EUR"
                          ? "€"
                          : "₺"}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Para Birimi"
                fullWidth
                value={values.currency}
                onChange={(event) => onChange("currency", event.target.value as Currency)}
              >
                <MenuItem value="CHF">🇨🇭 İsviçre Frangı (CHF)</MenuItem>
                <MenuItem value="EUR">🇪🇺 Euro (EUR)</MenuItem>
                <MenuItem value="TRY">🇹🇷 Türk Lirası (TRY)</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Tahsilat Tarihi *"
                type="date"
                fullWidth
                value={values.paymentDate}
                onChange={(event) => onChange("paymentDate", event.target.value)}
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.paymentDate)}
                helperText={errors.paymentDate}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Durum"
                fullWidth
                value={values.status}
                onChange={(event) => onChange("status", event.target.value as PaymentStatus)}
              >
                {PAYMENT_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <TextField
            select
            label="Ödeme Yöntemi *"
            fullWidth
            value={values.paymentMethod}
            onChange={(event) => onChange("paymentMethod", event.target.value)}
            error={Boolean(errors.paymentMethod)}
            helperText={errors.paymentMethod}
          >
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.icon} {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Kasa / Banka Hesabı *"
            fullWidth
            value={values.cashAccount}
            onChange={(event) => onChange("cashAccount", event.target.value)}
            error={Boolean(errors.cashAccount)}
            helperText={errors.cashAccount}
          >
            {CASH_ACCOUNT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.icon} {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Makbuz No"
            placeholder="Opsiyonel"
            fullWidth
            value={values.receiptNo}
            onChange={(event) => onChange("receiptNo", event.target.value)}
          />

          <TextField
            label="Açıklama"
            multiline
            minRows={3}
            placeholder="Tahsilat hakkında kısa açıklama..."
            fullWidth
            value={values.description}
            onChange={(event) => onChange("description", event.target.value)}
          />

          <Alert severity="info" icon={<IconReceipt size={18} />}>
            <Typography variant="body2" fontWeight={700}>
              Borca Dağıtım
            </Typography>
            <Typography variant="caption">
              Bu mock ekranda sadece tahsilat kaydı oluşturulur. Gerçek backend aşamasında ödeme
              borçlara otomatik veya manuel dağıtılacaktır.
            </Typography>
          </Alert>

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
            <Button variant="outlined" onClick={onClose}>
              İptal
            </Button>

            <Button variant="contained" onClick={onSubmit} disabled={loading}>
              {loading ? "Kaydediliyor..." : editingId ? "Güncelle" : "Tahsilatı Kaydet"}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
}