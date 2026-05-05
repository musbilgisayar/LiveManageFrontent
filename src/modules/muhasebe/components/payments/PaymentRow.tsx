"use client";

import React from "react";
import {
  Avatar,
  Box,
  Checkbox,
  Chip,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  IconCoin,
  IconCopy,
  IconEdit,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";

import type { PaymentItem } from "@/modules/muhasebe/types/payment.types";
import {
  formatPaymentMoney,
  formatPaymentShortDate,
  PAYMENT_STATUS_OPTIONS,
} from "@/modules/muhasebe/utils/muhasebePayment.utils";

interface Props {
  item: PaymentItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onView: (item: PaymentItem) => void;
  onEdit: (item: PaymentItem) => void;
  onDelete: (item: PaymentItem) => void;
  onDuplicate: (item: PaymentItem) => void;
}

export default function PaymentRow({
  item,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
}: Props) {
  const status = PAYMENT_STATUS_OPTIONS.find((s) => s.value === item.status)!;

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onChange={() => onSelect(item.id)} />
      </TableCell>

      <TableCell>
        <Stack direction="row" spacing={1}>
          <Avatar>
            <IconCoin size={16} />
          </Avatar>

          <Box>
            <Typography>{item.payerName}</Typography>
            <Typography variant="caption">{item.unit}</Typography>
          </Box>
        </Stack>
      </TableCell>

      <TableCell>
        {formatPaymentMoney(item.amount, item.currency)}
      </TableCell>

      <TableCell>{formatPaymentShortDate(item.paymentDate)}</TableCell>

      <TableCell>
        <Chip size="small" label={status.label} />
      </TableCell>

      <TableCell>{item.paymentMethod}</TableCell>

      <TableCell>{item.cashAccount}</TableCell>

      <TableCell>{item.receiptNo || "-"}</TableCell>

      <TableCell align="center">
        <Stack direction="row">
          <Tooltip title="Düzenle">
            <IconButton size="small" onClick={() => onEdit(item)}>
              <IconEdit size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Kopyala">
            <IconButton size="small" onClick={() => onDuplicate(item)}>
              <IconCopy size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Detay">
            <IconButton size="small" onClick={() => onView(item)}>
              <IconEye size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Sil">
            <IconButton size="small" color="error" onClick={() => onDelete(item)}>
              <IconTrash size={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}