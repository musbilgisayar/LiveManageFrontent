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
import { IconFileInvoice, IconX } from "@tabler/icons-react";

import type {
  ExpenseCurrency,
  ExpenseFormErrors,
  ExpenseFormValues,
  ExpenseStatus,
} from "@/modules/muhasebe/types/expense.types";
import {
  EXPENSE_CASH_ACCOUNT_OPTIONS,
  EXPENSE_STATUS_OPTIONS,
} from "@/modules/muhasebe/utils/muhasebeExpense.utils";

interface ExpenseCategoryOption {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

interface ExpenseDrawerProps {
  open: boolean;
  editingId: string | null;
  values: ExpenseFormValues;
  errors: ExpenseFormErrors;
  loading: boolean;
  categories: ExpenseCategoryOption[];
  onClose: () => void;
  onChange: (field: keyof ExpenseFormValues, value: string) => void;
  onSubmit: () => void;
}

export default function ExpenseDrawer({
  open,
  editingId,
  values,
  errors,
  loading,
  categories,
  onClose,
  onChange,
  onSubmit,
}: ExpenseDrawerProps) {
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
              {editingId ? "Gider Düzenle" : "Yeni Gider Ekle"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Zorunlu alanları doldurarak kayıt oluşturun.
            </Typography>
          </Box>

          <IconButton onClick={onClose}>
            <IconX size={20} />
          </IconButton>
        </Stack>

        <Stack spacing={2.5}>
          <TextField
            select
            label="Gider Kategorisi *"
            fullWidth
            value={values.category}
            onChange={(event) => onChange("category", event.target.value)}
            error={Boolean(errors.category)}
            helperText={errors.category}
          >
            {categories
              .filter((category) => category.isActive)
              .map((category) => (
                <MenuItem key={category.id} value={category.code}>
                  {category.name}
                </MenuItem>
              ))}
          </TextField>

          <TextField
            label="Firma / Tedarikçi *"
            placeholder="Örn: Lift Service GmbH"
            fullWidth
            value={values.vendor}
            onChange={(event) => onChange("vendor", event.target.value)}
            error={Boolean(errors.vendor)}
            helperText={errors.vendor}
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
                onChange={(event) =>
                  onChange("currency", event.target.value as ExpenseCurrency)
                }
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
                label="Gider Tarihi *"
                type="date"
                fullWidth
                value={values.date}
                onChange={(event) => onChange("date", event.target.value)}
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.date)}
                helperText={errors.date}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Durum"
                fullWidth
                value={values.status}
                onChange={(event) =>
                  onChange("status", event.target.value as ExpenseStatus)
                }
              >
                {EXPENSE_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <TextField
            select
            label="Ödeme Hesabı *"
            fullWidth
            value={values.cashAccount}
            onChange={(event) => onChange("cashAccount", event.target.value)}
            error={Boolean(errors.cashAccount)}
            helperText={errors.cashAccount}
          >
            {EXPENSE_CASH_ACCOUNT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.icon} {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Fatura No"
            placeholder="Opsiyonel"
            fullWidth
            value={values.invoiceNo}
            onChange={(event) => onChange("invoiceNo", event.target.value)}
          />

          <TextField
            label="Açıklama"
            multiline
            minRows={3}
            placeholder="Gider hakkında kısa açıklama..."
            fullWidth
            value={values.description}
            onChange={(event) => onChange("description", event.target.value)}
          />

          <Alert severity="info" icon={<IconFileInvoice size={18} />}>
            <Typography variant="body2" fontWeight={700}>
              Belge Yükleme
            </Typography>
            <Typography variant="caption">
              Fatura ve belgeleri daha sonra yükleyebilirsiniz.
            </Typography>
          </Alert>

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
            <Button variant="outlined" onClick={onClose}>
              İptal
            </Button>

            <Button variant="contained" onClick={onSubmit} disabled={loading}>
              {loading ? "Kaydediliyor..." : editingId ? "Güncelle" : "Gideri Kaydet"}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
}