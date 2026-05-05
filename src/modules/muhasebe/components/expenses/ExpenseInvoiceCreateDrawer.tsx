//bu dosya yeni fatura girişi için açılan drawer componentidir. Muhasebe yönetimi ekranında "Yeni Fatura Girişi" butonuna tıklandığında bu drawer açılır ve kullanıcıdan fatura bilgilerini alır. Form doğrulaması yapar ve geçerli bir payload oluşturduğunda onCreated callback'i ile üst componente gönderir. Bu drawer sadece fatura kaydı oluşturur, ödeme işlemi içermez.
//src/modules/muhasebe/components/expenses/ExpenseInvoiceCreateDrawer.tsx
"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  IconFileInvoice,
  IconReceiptTax,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useMuhasebeExpenseCategories } from "@/modules/muhasebe/hooks/useMuhasebeExpenseCategories";

type Currency = "CHF" | "EUR" | "TRY";

export interface ExpenseInvoiceCreatePayload {
  category: string;
  categoryLabel: string;
  vendor: string;
  invoiceNo?: string;
  invoiceDate: string;
  dueDate?: string;
  amount: number;
  currency: Currency;
  description?: string;
  attachments?: string[];

  /**
   * Fatura girişi ödeme değildir.
   * Bu yüzden status otomatik unpaid/pending gelir.
   */
  status: "pending";
}

interface ExpenseInvoiceCreateDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (payload: ExpenseInvoiceCreatePayload) => void;
}

interface FormValues {
  category: string;
  vendor: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  amount: string;
  currency: Currency;
  description: string;
}

interface FormErrors {
  category?: string;
  vendor?: string;
  invoiceDate?: string;
  amount?: string;
}

const INITIAL_FORM: FormValues = {
  category: "",
  vendor: "",
  invoiceNo: "",
  invoiceDate: format(new Date(), "yyyy-MM-dd"),
  dueDate: "",
  amount: "",
  currency: "CHF",
  description: "",
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.category) errors.category = "Gider kalemi zorunlu";
  if (!values.vendor.trim()) errors.vendor = "Firma / tedarikçi zorunlu";
  if (!values.invoiceDate) errors.invoiceDate = "Fatura tarihi zorunlu";

  const amount = Number(values.amount);
  if (!values.amount.trim()) {
    errors.amount = "Tutar zorunlu";
  } else if (Number.isNaN(amount) || amount <= 0) {
    errors.amount = "Tutar 0'dan büyük olmalı";
  }

  return errors;
}

export default function ExpenseInvoiceCreateDrawer({
  open,
  onClose,
  onCreated,
}: ExpenseInvoiceCreateDrawerProps) {
  const { categories } = useMuhasebeExpenseCategories();

  const [form, setForm] = useState<FormValues>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories],
  );

  const resetForm = useCallback(() => {
    setForm({
      ...INITIAL_FORM,
      invoiceDate: format(new Date(), "yyyy-MM-dd"),
    });
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleChange = useCallback(
    (field: keyof FormValues, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const selectedCategory = activeCategories.find(
      (category) => category.code === form.category,
    );

    const payload: ExpenseInvoiceCreatePayload = {
      category: form.category,
      categoryLabel: selectedCategory?.name ?? form.category,
      vendor: form.vendor.trim(),
      invoiceNo: form.invoiceNo.trim() || undefined,
      invoiceDate: form.invoiceDate,
      dueDate: form.dueDate || undefined,
      amount: Number(form.amount),
      currency: form.currency,
      description: form.description.trim() || undefined,
      attachments: [],
      status: "pending",
    };

    onCreated?.(payload);
    handleClose();
  }, [activeCategories, form, handleClose, onCreated]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 560, md: 640 },
          p: 3,
        },
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Yeni Fatura Girişi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gelen faturayı ödeme yapmadan gider borcu olarak sisteme kaydedin.
            </Typography>
          </Box>

          <IconButton onClick={handleClose}>
            <IconX size={20} />
          </IconButton>
        </Stack>

        <Alert severity="info" icon={<IconFileInvoice size={18} />}>
          Bu ekran sadece fatura/gider kaydı oluşturur. Ödeme hesabı seçilmez,
          kasa veya banka bakiyesi değişmez.
        </Alert>

        <Stack spacing={2.5}>
          <TextField
            select
            label="Gider Kalemi *"
            fullWidth
            value={form.category}
            onChange={(event) => handleChange("category", event.target.value)}
            error={Boolean(errors.category)}
            helperText={errors.category}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconReceiptTax size={18} />
                </InputAdornment>
              ),
            }}
          >
            {activeCategories.map((category) => (
              <MenuItem key={category.id} value={category.code}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Firma / Tedarikçi *"
            placeholder="Örn: Elektrik AG"
            fullWidth
            value={form.vendor}
            onChange={(event) => handleChange("vendor", event.target.value)}
            error={Boolean(errors.vendor)}
            helperText={errors.vendor}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Fatura No"
                placeholder="Opsiyonel"
                fullWidth
                value={form.invoiceNo}
                onChange={(event) => handleChange("invoiceNo", event.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Fatura Tarihi *"
                type="date"
                fullWidth
                value={form.invoiceDate}
                onChange={(event) => handleChange("invoiceDate", event.target.value)}
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.invoiceDate)}
                helperText={errors.invoiceDate}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Son Ödeme Tarihi"
                type="date"
                fullWidth
                value={form.dueDate}
                onChange={(event) => handleChange("dueDate", event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Para Birimi"
                fullWidth
                value={form.currency}
                onChange={(event) =>
                  handleChange("currency", event.target.value as Currency)
                }
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
            error={Boolean(errors.amount)}
            helperText={errors.amount}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {form.currency === "CHF"
                    ? "₣"
                    : form.currency === "EUR"
                      ? "€"
                      : "₺"}
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Açıklama"
            multiline
            minRows={3}
            placeholder="Fatura veya gider hakkında kısa açıklama..."
            fullWidth
            value={form.description}
            onChange={(event) => handleChange("description", event.target.value)}
          />

          <Alert severity="warning" icon={<IconUpload size={18} />}>
            Belge yükleme alanını bir sonraki adımda bağlayacağız. Şimdilik
            fatura kaydı belge olmadan oluşturulur.
          </Alert>

          <Divider />

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleClose}>
              Vazgeç
            </Button>

            <Button variant="contained" onClick={handleSubmit}>
              Faturayı Kaydet
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
}