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
import { IconEdit, IconReceiptTax } from "@tabler/icons-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import type { ChargeItem } from "@/modules/muhasebe/types/MuhasebeCharge.types";
import {
  CHARGE_STATUS_OPTIONS,
  formatChargeLongDate,
  formatChargeMoney,
  getChargeTypeConfig,
  getPaymentState,
  getPaymentStateLabel,
  getRemainingAmount,
} from "@/modules/muhasebe/utils/muhasebeCharge.utils";
import ChargeDetailRow from "./ChargeDetailRow";

interface ChargeDetailDialogProps {
  item: ChargeItem | null;
  onClose: () => void;
  onEdit: (item: ChargeItem) => void;
}

export default function ChargeDetailDialog({
  item,
  onClose,
  onEdit,
}: ChargeDetailDialogProps) {
  const typeConfig = item ? getChargeTypeConfig(item.chargeType) : null;

  return (
    <Dialog open={Boolean(item)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tahakkuk Detayı</DialogTitle>

      <DialogContent dividers>
        {item && typeConfig && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: alpha(typeConfig.color, 0.12),
                  color: typeConfig.color,
                }}
              >
                <IconReceiptTax size={18} />
              </Avatar>

              <Box>
                <Typography fontWeight={800}>{item.unit}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.residentName}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <ChargeDetailRow label="Referans No" value={item.referenceNo || "-"} />
            <ChargeDetailRow label="Dönem" value={item.period} />
            <ChargeDetailRow label="Borç Türü" value={item.chargeTypeLabel} />
            <ChargeDetailRow
              label="Borç Tutarı"
              value={formatChargeMoney(item.amount, item.currency)}
            />
            <ChargeDetailRow
              label="Tahsil Edilen"
              value={formatChargeMoney(item.paidAmount, item.currency)}
            />
            <ChargeDetailRow
              label="Kalan"
              value={formatChargeMoney(getRemainingAmount(item), item.currency)}
            />
            <ChargeDetailRow label="Vade" value={formatChargeLongDate(item.dueDate)} />
            <ChargeDetailRow
              label="Durum"
              value={
                CHARGE_STATUS_OPTIONS.find((status) => status.value === item.status)
                  ?.label || item.status
              }
            />
            <ChargeDetailRow
              label="Ödeme Durumu"
              value={getPaymentStateLabel(getPaymentState(item))}
            />
            <ChargeDetailRow label="Açıklama" value={item.description || "-"} />
            <ChargeDetailRow label="Oluşturan" value={item.createdBy} />
            <ChargeDetailRow
              label="Oluşturulma"
              value={format(new Date(item.createdAt), "dd.MM.yyyy HH:mm", {
                locale: tr,
              })}
            />
            <ChargeDetailRow
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

        {item && item.status === "draft" && (
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