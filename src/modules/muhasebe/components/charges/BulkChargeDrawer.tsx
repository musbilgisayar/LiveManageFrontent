"use client";

import React from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";

import type {
  BulkFormErrors,
  BulkFormValues,
  ChargeType,
  Currency,
  ChargeUnitOption,
} from "@/modules/muhasebe/types/MuhasebeCharge.types";
import {
  CHARGE_TYPE_OPTIONS,
  formatChargeMoney,
  formatChargeShortDate,
  getChargeTypeConfig,
} from "@/modules/muhasebe/utils/muhasebeCharge.utils";
import ChargeDetailRow from "./ChargeDetailRow";
import ChargePreviewCard from "./ChargePreviewCard";

interface BulkChargeDrawerProps {
  open: boolean;
  step: number;
  values: BulkFormValues;
  errors: BulkFormErrors;
  loading?: boolean;
  targetUnits: ChargeUnitOption[];
  duplicateUnits: ChargeUnitOption[];
  creatableUnits: ChargeUnitOption[];
  onClose: () => void;
  onChange: (field: keyof BulkFormValues, value: string) => void;
  onBack: () => void;
  onNext: () => void;
  onCreate: () => void;
}

export default function BulkChargeDrawer({
  open,
  step,
  values,
  errors,
  loading = false,
  targetUnits,
  duplicateUnits,
  creatableUnits,
  onClose,
  onChange,
  onBack,
  onNext,
  onCreate,
}: BulkChargeDrawerProps) {
  const amount = Number(values.amount || 0);
  const totalAmount = amount * creatableUnits.length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 620, md: 720 },
          p: 3,
        },
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Toplu Aidat Tahakkuku
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Ön izleme ile mükerrer kayıtları kontrol ederek toplu borç oluşturun.
            </Typography>
          </Box>

          <IconButton onClick={onClose}>
            <IconX size={20} />
          </IconButton>
        </Stack>

        <Stepper activeStep={step}>
          <Step>
            <StepLabel>Dönem ve kapsam</StepLabel>
          </Step>
          <Step>
            <StepLabel>Ön izleme</StepLabel>
          </Step>
          <Step>
            <StepLabel>Oluştur</StepLabel>
          </Step>
        </Stepper>

        {step === 0 && (
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
              label="Kapsam"
              fullWidth
              value={values.scope}
              onChange={(event) =>
                onChange("scope", event.target.value as BulkFormValues["scope"])
              }
            >
              <MenuItem value="all">Tüm daireler</MenuItem>
              <MenuItem value="block">Blok bazlı</MenuItem>
              <MenuItem value="selected">Seçili örnek daireler</MenuItem>
            </TextField>

            {values.scope === "block" && (
              <TextField
                select
                label="Blok"
                fullWidth
                value={values.block}
                onChange={(event) => onChange("block", event.target.value)}
              >
                <MenuItem value="A Blok">A Blok</MenuItem>
                <MenuItem value="B Blok">B Blok</MenuItem>
                <MenuItem value="C Blok">C Blok</MenuItem>
              </TextField>
            )}

            <TextField
              select
              label="Borç Türü"
              fullWidth
              value={values.chargeType}
              onChange={(event) =>
                onChange("chargeType", event.target.value as ChargeType)
              }
            >
              {CHARGE_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Kişi başı tutar *"
                  type="number"
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
                    onChange("currency", event.target.value as Currency)
                  }
                >
                  <MenuItem value="CHF">🇨🇭 İsviçre Frangı (CHF)</MenuItem>
                  <MenuItem value="EUR">🇪🇺 Euro (EUR)</MenuItem>
                  <MenuItem value="TRY">🇹🇷 Türk Lirası (TRY)</MenuItem>
                </TextField>
              </Grid>
            </Grid>

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

            <TextField
              label="Açıklama"
              multiline
              minRows={3}
              fullWidth
              value={values.description}
              onChange={(event) => onChange("description", event.target.value)}
            />
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={2.5}>
            <Alert severity={duplicateUnits.length > 0 ? "warning" : "success"}>
              {duplicateUnits.length > 0
                ? `${duplicateUnits.length} kayıt mükerrer olduğu için atlanacak.`
                : "Mükerrer tahakkuk bulunmadı."}
            </Alert>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <ChargePreviewCard title="Hedef Daire" value={targetUnits.length} />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <ChargePreviewCard title="Oluşturulacak" value={creatableUnits.length} />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <ChargePreviewCard title="Atlanacak" value={duplicateUnits.length} />
              </Grid>
            </Grid>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={1}>
                  <ChargeDetailRow label="Dönem" value={values.period} />
                  <ChargeDetailRow
                    label="Borç Türü"
                    value={getChargeTypeConfig(values.chargeType).label}
                  />
                  <ChargeDetailRow
                    label="Kişi Başı Tutar"
                    value={formatChargeMoney(amount, values.currency)}
                  />
                  <ChargeDetailRow
                    label="Toplam Tahakkuk"
                    value={formatChargeMoney(totalAmount, values.currency)}
                  />
                  <ChargeDetailRow
                    label="Vade"
                    value={formatChargeShortDate(values.dueDate)}
                  />
                </Stack>
              </CardContent>
            </Card>

            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 3,
                boxShadow: "none",
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Daire</TableCell>
                    <TableCell>Sakin</TableCell>
                    <TableCell>Durum</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {targetUnits.map((unit) => {
                    const isDuplicate = duplicateUnits.some(
                      (duplicate) => duplicate.unit === unit.unit,
                    );

                    return (
                      <TableRow key={unit.unit}>
                        <TableCell>{unit.unit}</TableCell>
                        <TableCell>{unit.residentName}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={isDuplicate ? "Atlanacak" : "Oluşturulacak"}
                            color={isDuplicate ? "warning" : "success"}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={2.5}>
            <Alert severity="info">
              Toplu tahakkuklar taslak olarak oluşturulacak. Kontrol ettikten sonra
              listeden kesinleştirebilirsiniz.
            </Alert>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={1}>
                  <ChargeDetailRow
                    label="Oluşturulacak Tahakkuk"
                    value={`${creatableUnits.length} kayıt`}
                  />
                  <ChargeDetailRow
                    label="Toplam Tutar"
                    value={formatChargeMoney(totalAmount, values.currency)}
                  />
                  <ChargeDetailRow
                    label="Atlanan Mükerrer Kayıt"
                    value={`${duplicateUnits.length} kayıt`}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        )}

        <Divider />

        <Stack direction="row" justifyContent="space-between">
          <Button variant="outlined" disabled={step === 0} onClick={onBack}>
            Geri
          </Button>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={onClose}>
              Vazgeç
            </Button>

            {step < 2 ? (
              <Button variant="contained" onClick={onNext}>
                Devam
              </Button>
            ) : (
              <Button variant="contained" onClick={onCreate} disabled={loading}>
                {loading ? "Oluşturuluyor..." : "Taslakları Oluştur"}
              </Button>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
}