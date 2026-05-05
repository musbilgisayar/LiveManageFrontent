"use client";

import React from "react";
import {
  Alert,
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
  Box,
} from "@mui/material";
import { IconFileInvoice, IconX } from "@tabler/icons-react";

import type {
  ChargeFormErrors,
  ChargeFormValues,
  ChargeStatus,
  ChargeType,
  Currency,
} from "@/modules/muhasebe/types/MuhasebeCharge.types";
import {
  CHARGE_TYPE_OPTIONS,
  CHARGE_UNIT_OPTIONS,
} from "@/modules/muhasebe/utils/muhasebeCharge.utils";

interface SingleChargeDrawerProps {
  open: boolean;
  editingId: string | null;
  values: ChargeFormValues;
  errors: ChargeFormErrors;
  loading?: boolean;
  onClose: () => void;
  onChange: (field: keyof ChargeFormValues, value: string) => void;
  onUnitSelect: (unitValue: string) => void;
  onSubmit: () => void;
}

export default function SingleChargeDrawer({
  open,
  editingId,
  values,
  errors,
  loading = false,
  onClose,
  onChange,
  onUnitSelect,
  onSubmit,
}: SingleChargeDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
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
              {editingId ? "Tahakkuk Düzenle" : "Tekil Borç Oluştur"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Bu işlem para hareketi oluşturmaz. Sadece borç kaydı üretir.
            </Typography>
          </Box>

          <IconButton onClick={onClose}>
            <IconX size={20} />
          </IconButton>
        </Stack>

        <Alert severity="info" icon={<IconFileInvoice size={18} />}>
          Tahakkuk, daire veya kişiye borç yazma işlemidir. Ödeme durumu
          tahsilatlardan hesaplanır ve elle değiştirilmez.
        </Alert>

        <Stack spacing={2.5}>
          <TextField
            type="month"
            label="Dönem *"
            fullWidth
            value={values.period}
            onChange={(event) => onChange("period", event.target.value)}
            InputLabelProps={{ shrink: true }}
            error={Boolean(errors.period)}
            helperText={errors.period}
          />

          <TextField
            select
            label="Daire / Birim *"
            fullWidth
            value={values.unit}
            onChange={(event) => onUnitSelect(event.target.value)}
            error={Boolean(errors.unit)}
            helperText={errors.unit}
          >
            {CHARGE_UNIT_OPTIONS.map((item) => (
              <MenuItem key={item.unit} value={item.unit}>
                {item.unit} — {item.residentName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Sakin / Muhatap *"
            fullWidth
            value={values.residentName}
            onChange={(event) => onChange("residentName", event.target.value)}
            error={Boolean(errors.residentName)}
            helperText={errors.residentName}
          />

          <TextField
            select
            label="Borç Türü"
            fullWidth
            value={values.chargeType}
            onChange={(event) => onChange("chargeType", event.target.value as ChargeType)}
          >
            {CHARGE_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Stack>
                  <Typography fontWeight={700}>{option.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.helper}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

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
                label="Vade Tarihi *"
                type="date"
                fullWidth
                value={values.dueDate}
                onChange={(event) => onChange("dueDate", event.target.value)}
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.dueDate)}
                helperText={errors.dueDate}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Kayıt Durumu"
                fullWidth
                value={values.status}
                onChange={(event) => onChange("status", event.target.value as ChargeStatus)}
              >
                <MenuItem value="draft">Taslak</MenuItem>
                <MenuItem value="posted">Kesinleşti</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <TextField
            label="Açıklama"
            multiline
            minRows={3}
            fullWidth
            placeholder="Borç kaydı hakkında kısa açıklama..."
            value={values.description}
            onChange={(event) => onChange("description", event.target.value)}
          />

          <Divider />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={onClose}>
              İptal
            </Button>

            <Button variant="contained" onClick={onSubmit} disabled={loading}>
              {loading ? "Kaydediliyor..." : editingId ? "Güncelle" : "Tahakkuku Kaydet"}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
}